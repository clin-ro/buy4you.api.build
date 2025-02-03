import { CreateJobSiteDto, UpdateJobSiteDto } from '@/resources/job-sites/dto/job-site.dto';
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

    async findAll(userId: string) {
        return this.jobSiteModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ name: 1 });
    }

    async search(userId: string, term?: string, status?: string) {
        let query = this.jobSiteModel.find({ userId: new Types.ObjectId(userId) });

        if (term) {
            query = query.or([
                { name: new RegExp(term, 'i') },
                { 'address.street': new RegExp(term, 'i') },
                { 'address.city': new RegExp(term, 'i') },
            ]);
        }

        if (status && status !== 'all') {
            query = query.where('status').equals(status);
        }

        return query.exec();
    }

    async findById(id: string, userId: string) {
        const jobSite = await this.jobSiteModel.findOne({
            _id: new Types.ObjectId(id),
            userId: new Types.ObjectId(userId),
        });

        if (!jobSite) {
            throw new NotFoundException('Job site not found');
        }

        return jobSite;
    }

    async create(createJobSiteDto: CreateJobSiteDto, userId: string) {
        const jobSite = new this.jobSiteModel({
            ...createJobSiteDto,
            userId: new Types.ObjectId(userId),
            buyers: [new Types.ObjectId(userId)], // Add creator as first buyer
        });

        return jobSite.save();
    }

    async update(id: string, updateJobSiteDto: UpdateJobSiteDto, userId: string) {
        const jobSite = await this.findById(id, userId);
        Object.assign(jobSite, updateJobSiteDto);
        return jobSite.save();
    }

    async remove(id: string, userId: string): Promise<void> {
        const jobSite = await this.findById(id, userId);

        const hasOrders = await this.orderModel.exists({
            jobSiteId: new Types.ObjectId(id)
        });

        if (hasOrders) {
            throw new ConflictException('Cannot delete job site with associated orders');
        }

        await jobSite.deleteOne();
    }

    async addBuyerToJobSite(id: string, buyerId: string, userId: string) {
        const jobSite = await this.findById(id, userId);
        const buyerProfile = await this.profileModel.findById(buyerId);

        if (!buyerProfile) {
            throw new NotFoundException('Buyer profile not found');
        }

        if (!jobSite.buyers) {
            jobSite.buyers = [];
        }

        const buyerObjectId = new Types.ObjectId(buyerId);
        if (jobSite.buyers.some(id => id.equals(buyerObjectId))) {
            throw new ConflictException('Buyer already added to job site');
        }

        jobSite.buyers.push(buyerObjectId);
        return jobSite.save();
    }

    async removeBuyerFromJobSite(id: string, buyerId: string, userId: string) {
        const jobSite = await this.findById(id, userId);

        const buyerObjectId = new Types.ObjectId(buyerId);
        if (!jobSite.buyers || !jobSite.buyers.some(bid => bid.equals(buyerObjectId))) {
            throw new NotFoundException('Buyer not found in job site');
        }

        const hasOrders = await this.orderModel.exists({
            jobSiteId: new Types.ObjectId(id),
            userId: buyerObjectId
        });

        if (hasOrders) {
            throw new ConflictException('Cannot remove buyer with associated orders');
        }

        jobSite.buyers = jobSite.buyers.filter(bid => !bid.equals(buyerObjectId));
        await jobSite.save();
    }

    async createInvitation(jobSiteId: string, userId: string, expirationHours: number = 24): Promise<{ invitationLink: string; qrCode: string }> {
        const jobSite = await this.jobSiteModel.findOne({
            _id: new Types.ObjectId(jobSiteId),
            userId: new Types.ObjectId(userId)
        });

        if (!jobSite) {
            throw new UnauthorizedException('Only job site owners can create invitations');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expirationHours);

        const invitation = new this.invitationModel({
            jobSiteId: new Types.ObjectId(jobSiteId),
            inviterUserId: new Types.ObjectId(userId),
            token,
            expiresAt,
            status: InvitationStatus.PENDING
        });

        await invitation.save();

        const invitationLink = `${this.baseUrl}/job-sites/join/${token}`;
        const qrCode = await QRCode.toDataURL(invitationLink);

        return { invitationLink, qrCode };
    }

    async acceptInvitation(token: string, userId: string): Promise<JobSite> {
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

        const userObjectId = new Types.ObjectId(userId);
        if (!jobSite.buyers.some(id => id.equals(userObjectId))) {
            jobSite.buyers.push(userObjectId);
            await jobSite.save();
        }

        invitation.status = InvitationStatus.ACCEPTED;
        invitation.acceptedByUserId = userObjectId;
        invitation.acceptedAt = new Date();
        await invitation.save();

        return jobSite;
    }

    async getInvitations(jobSiteId: string, userId: string): Promise<JobSiteInvitation[]> {
        const jobSite = await this.jobSiteModel.findOne({
            _id: new Types.ObjectId(jobSiteId),
            userId: new Types.ObjectId(userId)
        });

        if (!jobSite) {
            throw new UnauthorizedException('Only job site owners can view invitations');
        }

        return this.invitationModel.find({
            jobSiteId: new Types.ObjectId(jobSiteId)
        }).sort({ createdAt: -1 });
    }

    async revokeInvitation(invitationId: string, userId: string): Promise<void> {
        const invitation = await this.invitationModel.findById(invitationId);
        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }

        const jobSite = await this.jobSiteModel.findOne({
            _id: invitation.jobSiteId,
            userId: new Types.ObjectId(userId)
        });

        if (!jobSite) {
            throw new UnauthorizedException('Only job site owners can revoke invitations');
        }

        invitation.status = InvitationStatus.EXPIRED;
        await invitation.save();
    }
} 