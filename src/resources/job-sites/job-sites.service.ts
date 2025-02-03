import { SearchQueryDto } from '@/resources/buyers/dto/buyer-query.dto';
import { InvitationStatus, JobSiteInvitation } from '@/schemas/mongo/job-site-invitation.schema';
import { JobSite } from '@/schemas/mongo/job-site.schema';
import { Order } from '@/schemas/mongo/order.schema';
import { Profile } from '@/schemas/mongo/profile.schema';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model, Types } from 'mongoose';
import * as QRCode from 'qrcode';
import { CreateJobSiteDto, UpdateJobSiteDto } from './dto/job-site.dto';

@Injectable()
export class JobSitesService {
    private readonly baseUrl: string;

    constructor(
        @InjectModel(JobSite.name) private jobSiteModel: Model<JobSite>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Profile.name) private profileModel: Model<Profile>,
        @InjectModel(JobSiteInvitation.name) private invitationModel: Model<JobSiteInvitation>,
        private configService: ConfigService
    ) {
        this.baseUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    }

    async findAll(profileId: string) {
        return this.jobSiteModel.find({ profileId: new Types.ObjectId(profileId) }).sort({ name: 1 });
    }

    async search(profileId: string, query: SearchQueryDto) {
        let mongoQuery: any = { profileId: new Types.ObjectId(profileId) };

        if (query.term) {
            mongoQuery.$or = [
                { name: new RegExp(query.term, 'i') },
                { 'address.streetAddress': new RegExp(query.term, 'i') },
                { 'address.city': new RegExp(query.term, 'i') },
            ];
        }

        if (query.status && query.status !== 'all') {
            mongoQuery.status = query.status;
        }

        return this.jobSiteModel.find(mongoQuery).sort({ createdAt: -1 });
    }

    async findById(id: string, profileId: string) {
        const jobSite = await this.jobSiteModel.findOne({
            _id: new Types.ObjectId(id),
            profileId: new Types.ObjectId(profileId),
        });

        if (!jobSite) {
            throw new NotFoundException('Job site not found');
        }

        return jobSite;
    }

    async create(createJobSiteDto: CreateJobSiteDto, profileId: string) {
        const jobSite = new this.jobSiteModel({
            ...createJobSiteDto,
            profileId: new Types.ObjectId(profileId),
            userId: new Types.ObjectId(profileId),
            buyers: [new Types.ObjectId(profileId)],
            status: 'active',
            isActive: createJobSiteDto.isActive ?? true,
            preferredSuppliers: createJobSiteDto.preferredSuppliers?.map(id => new Types.ObjectId(id)) || []
        });

        return jobSite.save();
    }

    async update(id: string, updateJobSiteDto: UpdateJobSiteDto, profileId: string) {
        const jobSite = await this.findById(id, profileId);

        Object.assign(jobSite, {
            ...updateJobSiteDto,
            preferredSuppliers: updateJobSiteDto.preferredSuppliers?.map(id => new Types.ObjectId(id))
        });

        return jobSite.save();
    }

    async remove(id: string, profileId: string): Promise<void> {
        const jobSite = await this.findById(id, profileId);

        const hasOrders = await this.orderModel.exists({ jobSiteId: new Types.ObjectId(id) });
        if (hasOrders) {
            throw new ConflictException('Cannot delete job site with associated orders');
        }

        await jobSite.deleteOne();
    }

    async addBuyerToJobSite(id: string, addBuyerDto: { buyerId: string }, profileId: string) {
        const jobSite = await this.findById(id, profileId);
        const buyerProfile = await this.profileModel.findById(addBuyerDto.buyerId);

        if (!buyerProfile) {
            throw new NotFoundException('Buyer profile not found');
        }

        if (!jobSite.buyers) {
            jobSite.buyers = [];
        }

        const buyerId = new Types.ObjectId(addBuyerDto.buyerId);
        if (jobSite.buyers.some(id => id.equals(buyerId))) {
            throw new ConflictException('Buyer already added to job site');
        }

        jobSite.buyers.push(buyerId);
        return jobSite.save();
    }

    async removeBuyerFromJobSite(id: string, buyerId: string, profileId: string) {
        const jobSite = await this.findById(id, profileId);

        if (!jobSite.buyers || !jobSite.buyers.some(bid => bid.equals(new Types.ObjectId(buyerId)))) {
            throw new NotFoundException('Buyer not found in job site');
        }

        const hasOrders = await this.orderModel.exists({
            jobSiteId: new Types.ObjectId(id),
            profileId: new Types.ObjectId(buyerId)
        });

        if (hasOrders) {
            throw new ConflictException('Cannot remove buyer with associated orders');
        }

        jobSite.buyers = jobSite.buyers.filter(bid => !bid.equals(new Types.ObjectId(buyerId)));
        await jobSite.save();
    }

    async createInvitation(jobSiteId: string, profileId: string, expirationHours: number = 24): Promise<{ invitationLink: string; qrCode: string }> {
        const jobSite = await this.jobSiteModel.findOne({
            _id: new Types.ObjectId(jobSiteId),
            profileId: new Types.ObjectId(profileId)
        });

        if (!jobSite) {
            throw new UnauthorizedException('Only job site owners can create invitations');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expirationHours);

        const invitation = new this.invitationModel({
            jobSiteId: new Types.ObjectId(jobSiteId),
            inviterProfileId: new Types.ObjectId(profileId),
            token,
            expiresAt,
            status: InvitationStatus.PENDING
        });

        await invitation.save();

        const invitationLink = `${this.baseUrl}/job-sites/join/${token}`;
        const qrCode = await QRCode.toDataURL(invitationLink);

        return { invitationLink, qrCode };
    }

    async acceptInvitation(token: string, profileId: string): Promise<JobSite> {
        const invitation = await this.invitationModel.findOne({
            token,
            status: InvitationStatus.PENDING,
            expiresAt: { $gt: new Date() }
        });

        if (!invitation) {
            throw new NotFoundException('Invalid or expired invitation');
        }

        const jobSite = await this.jobSiteModel.findById(invitation.jobSiteId);
        if (!jobSite) {
            throw new NotFoundException('Job site not found');
        }

        if (!jobSite.buyers) {
            jobSite.buyers = [];
        }

        if (!jobSite.buyers.includes(new Types.ObjectId(profileId))) {
            jobSite.buyers.push(new Types.ObjectId(profileId));
            await jobSite.save();
        }

        invitation.status = InvitationStatus.ACCEPTED;
        invitation.acceptedByProfileId = new Types.ObjectId(profileId);
        invitation.acceptedAt = new Date();
        await invitation.save();

        return jobSite;
    }

    async getInvitations(jobSiteId: string, profileId: string): Promise<JobSiteInvitation[]> {
        const jobSite = await this.jobSiteModel.findOne({
            _id: new Types.ObjectId(jobSiteId),
            profileId: new Types.ObjectId(profileId)
        });

        if (!jobSite) {
            throw new UnauthorizedException('Only job site owners can view invitations');
        }

        return this.invitationModel.find({
            jobSiteId: new Types.ObjectId(jobSiteId)
        }).sort({ createdAt: -1 });
    }

    async revokeInvitation(invitationId: string, profileId: string): Promise<void> {
        const invitation = await this.invitationModel.findById(invitationId);
        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        const jobSite = await this.jobSiteModel.findOne({
            _id: invitation.jobSiteId,
            profileId: new Types.ObjectId(profileId)
        });

        if (!jobSite) {
            throw new UnauthorizedException('Only job site owners can revoke invitations');
        }

        invitation.status = InvitationStatus.EXPIRED;
        await invitation.save();
    }
} 