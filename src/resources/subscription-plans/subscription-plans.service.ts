import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '@/resources/subscription-plans/dto/subscription-plan.dto';
import { SubscriptionPlan } from '@/schemas/mongo/subscription-plan.schema';
import { StripeService } from '@/utils/stripe/stripe.service';
import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

type PriceIdMap = Record<string, string>;
type PaymentLinkMap = Record<string, string>;

@Injectable()
export class SubscriptionPlansService implements OnModuleInit {
    constructor(
        @InjectModel(SubscriptionPlan.name) private subscriptionPlanModel: Model<SubscriptionPlan>,
        private readonly stripeService: StripeService,
    ) { }

    async onModuleInit() {
        const existingPlans = await this.subscriptionPlanModel.countDocuments();
        if (existingPlans === 0) {
            await this.createFreePlan();
        }
    }

    async toggleActive(id: string, isActive: boolean) {
        const plan = await this.subscriptionPlanModel.findByIdAndUpdate(id, { isActive });
        return plan;
    }

    private async createFreePlan() {
        const freePlan = new this.subscriptionPlanModel({
            name: 'Free Plan',
            description: 'Get started with our free plan',
            features: [
                'Unlimited orders',
                'Basic support',
                'No credit card required',
                'Standard delivery',
                'Email notifications'
            ],
            pricePerExtraOrder: 0,
            supportLevel: 'basic',
            isActive: true,
            isDefault: true,
            isFree: true,
            currency: 'gbp',
            pricingIntervals: [{
                interval: 'month',
                intervalCount: 1,
                price: 0,
                includedOrders: Number.MAX_SAFE_INTEGER,
                isDefault: true
            }],
            metadata: new Map([
                ['type', 'free'],
                ['unlimited', 'true']
            ]),
            customFeatures: {
                unlimited: true,
                noStripeIntegration: true
            }
        });

        try {
            await freePlan.save();
            console.log('Free plan created successfully');
        } catch (error) {
            console.error('Error creating free plan:', error);
            throw error;
        }
    }

    private validateMaxAmount(plan: CreateSubscriptionPlanDto | UpdateSubscriptionPlanDto) {
        const maxAmount = 99999999 / 100;

        if (plan.pricePerExtraOrder > maxAmount) {
            throw new ConflictException('Extra order price exceeds maximum allowed charge');
        }

        for (const interval of plan.pricingIntervals) {
            if (interval.price > maxAmount) {
                throw new ConflictException('Interval price exceeds maximum allowed charge');
            }
        }
    }

    private validateAndSetDefaultInterval(pricingIntervals: any[]) {
        if (!pricingIntervals || pricingIntervals.length === 0) {
            throw new ConflictException('Must have at least one pricing interval');
        }

        const defaultIntervals = pricingIntervals.filter(i => i.isDefault);
        if (defaultIntervals.length > 1) {
            throw new ConflictException('Only one interval can be set as default');
        }

        if (defaultIntervals.length === 0) {
            pricingIntervals[0].isDefault = true;
        }

        return pricingIntervals;
    }

    async findAll() {
        const plans = await this.subscriptionPlanModel.find({ isActive: true }).sort({ price: 1 });
        return plans;
    }

    async findById(id: string) {
        const plan = await this.subscriptionPlanModel.findOne({ id });
        if (!plan) {
            throw new NotFoundException('Subscription plan not found');
        }
        return plan;
    }

    async create(createPlanDto: CreateSubscriptionPlanDto) {
        if (createPlanDto.isFree) {
            const existingFreePlan = await this.subscriptionPlanModel.findOne({ isFree: true });
            if (existingFreePlan) {
                throw new ConflictException('A free plan already exists');
            }
        }

        this.validateMaxAmount(createPlanDto);
        const pricingIntervals = this.validateAndSetDefaultInterval(createPlanDto.pricingIntervals);

        let stripeProduct: any;
        let stripePriceIds: PriceIdMap = {};
        let paymentLinks: PaymentLinkMap = {};
        let perOrderPrice: any;

        // Only create Stripe products for paid plans
        if (!createPlanDto.isFree) {
            // Create Stripe Product
            stripeProduct = await this.stripeService.createProduct({
                name: createPlanDto.name,
                description: createPlanDto.description,
                active: createPlanDto.isActive,
                metadata: {
                    supportLevel: createPlanDto.supportLevel,
                    ...createPlanDto.metadata,
                },
            });

            // Create Stripe Prices for intervals
            for (const interval of pricingIntervals) {
                const price = await this.stripeService.createPrice({
                    product: stripeProduct.id,
                    currency: createPlanDto.currency,
                    unit_amount: Math.round(interval.price * 100),
                    recurring: {
                        interval: interval.interval,
                        interval_count: interval.intervalCount,
                    },
                    metadata: {
                        includedOrders: interval.includedOrders.toString(),
                        isDefault: interval.isDefault.toString(),
                    },
                    tax_behavior: createPlanDto.taxBehavior || 'exclusive',
                });

                const key = `${interval.interval}_${interval.intervalCount}` as keyof PriceIdMap;
                stripePriceIds[key] = price.id;

                const paymentLink = await this.stripeService.createPaymentLink({
                    line_items: [{ price: price.id, quantity: 1 }],
                    allow_promotion_codes: true,
                    automatic_tax: { enabled: true },
                    tax_id_collection: { enabled: true },
                    after_completion: {
                        type: 'redirect',
                        redirect: { url: '/subscription/success' },
                    },
                });

                paymentLinks[key] = paymentLink.url;
            }

            // Create Stripe Price for per-order pricing
            perOrderPrice = await this.stripeService.createPrice({
                product: stripeProduct.id,
                currency: createPlanDto.currency,
                unit_amount: Math.round(createPlanDto.pricePerExtraOrder * 100),
                metadata: { type: 'per_order' },
                tax_behavior: createPlanDto.taxBehavior || 'exclusive',
            });
        }

        // Handle default plan setting
        if (createPlanDto.isDefault) {
            await this.subscriptionPlanModel.updateMany(
                { isFree: false },
                { isDefault: false }
            );
        }

        // Create plan in database
        const plan = new this.subscriptionPlanModel({
            ...createPlanDto,
            id: uuidv4(),
            stripeProductId: stripeProduct?.id,
            stripePriceIds,
            stripePerOrderPriceId: perOrderPrice?.id,
            paymentLinks,
        });

        return plan.save();
    }

    async update(id: string, updatePlanDto: UpdateSubscriptionPlanDto) {
        const plan = await this.findById(id);

        if (plan.isFree) {
            throw new ConflictException('Cannot modify the free plan');
        }

        this.validateMaxAmount(updatePlanDto);
        const pricingIntervals = this.validateAndSetDefaultInterval(updatePlanDto.pricingIntervals);

        // Update Stripe product
        await this.stripeService.updateProduct(plan.stripeProductId, {
            name: updatePlanDto.name,
            description: updatePlanDto.description,
            active: updatePlanDto.isActive,
            metadata: {
                supportLevel: updatePlanDto.supportLevel,
                ...updatePlanDto.metadata,
            },
        });

        // Update Stripe prices
        const stripePriceIds: PriceIdMap = {};
        const paymentLinks: PaymentLinkMap = {};

        for (const interval of pricingIntervals) {
            const key = `${interval.interval}_${interval.intervalCount}` as keyof PriceIdMap;
            const existingPriceId = plan.stripePriceIds.get(key);
            if (existingPriceId) {
                await this.stripeService.updatePrice(existingPriceId, { active: false });
            }

            const price = await this.stripeService.createPrice({
                product: plan.stripeProductId,
                currency: updatePlanDto.currency,
                unit_amount: Math.round(interval.price * 100),
                recurring: {
                    interval: interval.interval,
                    interval_count: interval.intervalCount,
                },
                metadata: {
                    includedOrders: interval.includedOrders.toString(),
                    isDefault: interval.isDefault.toString(),
                },
                tax_behavior: updatePlanDto.taxBehavior || 'exclusive',
            });

            stripePriceIds[key] = price.id;

            const paymentLink = await this.stripeService.createPaymentLink({
                line_items: [{ price: price.id, quantity: 1 }],
                allow_promotion_codes: true,
                automatic_tax: { enabled: true },
                tax_id_collection: { enabled: true },
                after_completion: {
                    type: 'redirect',
                    redirect: { url: '/subscription/success' },
                },
            });

            paymentLinks[key] = paymentLink.url;
        }

        // Update per-order price
        if (plan.stripePerOrderPriceId) {
            await this.stripeService.updatePrice(plan.stripePerOrderPriceId, { active: false });
        }

        const perOrderPrice = await this.stripeService.createPrice({
            product: plan.stripeProductId,
            currency: updatePlanDto.currency,
            unit_amount: Math.round(updatePlanDto.pricePerExtraOrder * 100),
            metadata: { type: 'per_order' },
            tax_behavior: updatePlanDto.taxBehavior || 'exclusive',
        });

        // Handle default plan setting
        if (updatePlanDto.isDefault) {
            await this.subscriptionPlanModel.updateMany(
                { id: { $ne: id }, isFree: false },
                { isDefault: false },
            );
        }

        Object.assign(plan, {
            ...updatePlanDto,
            pricingIntervals,
            stripePriceIds,
            stripePerOrderPriceId: perOrderPrice.id,
            paymentLinks,
        });

        return plan.save();
    }

    async remove(id: string) {
        const plan = await this.findById(id);

        if (plan.isFree) {
            throw new ConflictException('Cannot delete the free plan');
        }

        if (plan.isDefault) {
            throw new ConflictException('Cannot delete default plan. Please set another plan as default first.');
        }

        if (plan.stripeProductId) {
            await this.stripeService.deleteProduct(plan.stripeProductId);
            for (const priceId of Object.values(plan.stripePriceIds)) {
                await this.stripeService.updatePrice(priceId, { active: false });
            }
            if (plan.stripePerOrderPriceId) {
                await this.stripeService.updatePrice(plan.stripePerOrderPriceId, { active: false });
            }
        }

        await plan.deleteOne();
    }

    async updatePlan(id: string, updateDto: UpdateSubscriptionPlanDto) {
        const plan = await this.findById(id);

        // Update Stripe product if it exists
        if (plan.stripeProductId) {
            await this.stripeService.updateProduct(plan.stripeProductId, {
                name: updateDto.name,
                description: updateDto.description,
                metadata: updateDto.metadata,
            });

            // Update prices
            for (const interval of updateDto.pricingIntervals) {
                const key = `${interval.interval}_${interval.intervalCount}`;
                const existingPriceId = plan.stripePriceIds?.get(key);

                if (existingPriceId) {
                    await this.stripeService.updatePrice(existingPriceId, { active: false });
                }

                const price = await this.stripeService.createPrice({
                    product: plan.stripeProductId || '',
                    currency: updateDto.currency,
                    unit_amount: interval.price * 100,
                    recurring: {
                        interval: interval.interval === 'month' ? 'month' : 'year',
                        interval_count: interval.intervalCount,
                    },
                    metadata: {
                        includedOrders: interval.includedOrders.toString(),
                    },
                    tax_behavior: updateDto.taxBehavior,
                });

                if (!plan.stripePriceIds) {
                    plan.stripePriceIds = new Map();
                }
                plan.stripePriceIds.set(key, price.id);
            }

            // Update per-order price
            if (plan.stripePerOrderPriceId) {
                await this.stripeService.updatePrice(plan.stripePerOrderPriceId, { active: false });
            }

            const perOrderPrice = await this.stripeService.createPrice({
                product: plan.stripeProductId || '',
                currency: updateDto.currency,
                unit_amount: updateDto.pricePerExtraOrder * 100,
                metadata: {
                    type: 'per_order',
                },
                tax_behavior: updateDto.taxBehavior,
            });

            plan.stripePerOrderPriceId = perOrderPrice.id;
        }

        // Update plan in database
        Object.assign(plan, updateDto);
        await plan.save();

        return plan;
    }

    async togglePlan(id: string, isActive: boolean) {
        const plan = await this.findById(id);

        if (plan.stripeProductId) {
            await this.stripeService.updateProduct(plan.stripeProductId, { active: isActive });

            if (plan.stripePriceIds) {
                for (const [_, priceId] of plan.stripePriceIds.entries()) {
                    await this.stripeService.updatePrice(priceId, { active: isActive });
                }
            }

            if (plan.stripePerOrderPriceId) {
                await this.stripeService.updatePrice(plan.stripePerOrderPriceId, { active: isActive });
            }
        }

        plan.isActive = isActive;
        await plan.save();

        return plan;
    }

    async deletePlan(id: string) {
        const plan = await this.findById(id);

        if (plan.stripeProductId) {
            await this.stripeService.deleteProduct(plan.stripeProductId);

            if (plan.stripePriceIds) {
                for (const [_, priceId] of plan.stripePriceIds.entries()) {
                    await this.stripeService.updatePrice(priceId, { active: false });
                }
            }

            if (plan.stripePerOrderPriceId) {
                await this.stripeService.updatePrice(plan.stripePerOrderPriceId, { active: false });
            }
        }

        await plan.deleteOne();
    }
} 