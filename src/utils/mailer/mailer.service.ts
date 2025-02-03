import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
    constructor(private readonly mailerService: NestMailerService) { }

    async sendEmail(to: string, subject: string, template: string, context: any) {
        await this.mailerService.sendMail({
            to,
            subject,
            template,
            context,
        });
    }

    async sendWelcomeEmail(email: string, name: string, code: string) {
        await this.sendEmail(
            email,
            'Welcome to Buy4You',
            'welcome',
            {
                recipientName: name,
                verificationLink: `${process.env.APP_URL}/verify?code=${code}`,
                dashboardUrl: `${process.env.APP_URL}/dashboard`,
            }
        );
    }

    async sendOrderStatusEmail(
        email: string,
        orderNumber: string,
        customerName: string,
        status: string,
        items: any[],
        total: number,
        shippingAddress: string,
    ) {
        await this.sendEmail(
            email,
            `Order Status Update #${orderNumber}`,
            'order-status',
            {
                orderNumber,
                customerName,
                status,
                items,
                total,
                shippingAddress,
            }
        );
    }

    async sendQuotationRequestEmail(
        email: string,
        supplierName: string,
        buyerName: string,
        quotationId: string,
        items: any[],
        additionalNotes?: string,
    ) {
        await this.sendEmail(
            email,
            `New Quotation Request #${quotationId}`,
            'quotation-request',
            {
                supplierName,
                buyerName,
                quotationId,
                items,
                additionalNotes,
            }
        );
    }

    async sendQuotationStatusEmail(
        email: string,
        quotationId: string,
        buyerName: string,
        status: string,
        items: any[],
        total?: number,
        comments?: string,
    ) {
        await this.sendEmail(
            email,
            `Quotation Status Update #${quotationId}`,
            'quotation-status',
            {
                quotationId,
                buyerName,
                status,
                items,
                total,
                comments,
            }
        );
    }

    async sendProfileStatusEmail(
        email: string,
        recipientName: string,
        status: 'approved' | 'rejected',
        profileType: 'company' | 'individual',
        reason?: string,
    ) {
        await this.sendEmail(
            email,
            `Profile ${status === 'approved' ? 'Approved' : 'Needs Updates'}`,
            'profile-status',
            {
                recipientName,
                status,
                profileType,
                reason,
                dashboardUrl: `${process.env.APP_URL}/dashboard`,
            }
        );
    }

    async sendJobSiteInvitationEmail(
        email: string,
        inviterName: string,
        jobSiteName: string,
        invitationCode: string,
    ) {
        await this.sendEmail(
            email,
            `Invitation to Join ${jobSiteName}`,
            'job-site-invitation',
            {
                inviterName,
                jobSiteName,
                invitationLink: `${process.env.APP_URL}/job-sites/join?code=${invitationCode}`,
                qrCodeUrl: `${process.env.APP_URL}/api/qr/job-sites/${invitationCode}`,
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            }
        );
    }

    async sendPaymentStatusEmail(
        email: string,
        recipientName: string,
        status: string,
        amount: number,
        orderId?: string,
        subscriptionId?: string,
    ) {
        await this.sendEmail(
            email,
            `Payment ${status}`,
            'payment-status',
            {
                recipientName,
                status,
                amount,
                orderId,
                subscriptionId,
                dashboardUrl: `${process.env.APP_URL}/dashboard`,
            }
        );
    }

    async sendSubscriptionStatusEmail(
        email: string,
        recipientName: string,
        status: string,
        planName: string,
        nextBillingDate?: Date,
        amount?: number,
    ) {
        await this.sendEmail(
            email,
            `Subscription ${status}`,
            'subscription-status',
            {
                recipientName,
                status,
                planName,
                nextBillingDate,
                amount,
                dashboardUrl: `${process.env.APP_URL}/dashboard`,
            }
        );
    }
}
