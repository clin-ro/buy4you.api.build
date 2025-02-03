import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { InjectMinio } from 'nestjs-minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
    private readonly logger = new Logger(MinioService.name);
    private readonly bucketName: string;

    constructor(
        @InjectMinio() private readonly minioClient: Client,
        private readonly configService: ConfigService,
    ) {
        const bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');
        if (!bucketName) {
            throw new Error('MINIO_BUCKET_NAME is not defined');
        }
        this.bucketName = bucketName;
        this.initBucket();
    }

    private async initBucket() {
        try {
            const bucketExists = await this.minioClient.bucketExists(this.bucketName);
            if (!bucketExists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                this.logger.log(`Bucket ${this.bucketName} created successfully`);
            }
        } catch (error) {
            this.logger.error('Error initializing MinIO bucket:', error);
        }
    }

    async uploadFile(
        fileName: string,
        fileBuffer: Buffer,
        contentType: string,
        metadata: Record<string, any> = {},
    ): Promise<string> {
        try {
            const objectName = `${Date.now()}-${fileName}`;
            await this.minioClient.putObject(
                this.bucketName,
                objectName,
                fileBuffer,
                fileBuffer.length,
                { 'Content-Type': contentType, ...metadata }
            );

            const fileUrl = await this.minioClient.presignedGetObject(
                this.bucketName,
                objectName,
                24 * 60 * 60, // URL expires in 24 hours
            );

            return fileUrl;
        } catch (error) {
            this.logger.error('Error uploading file to MinIO:', error);
            throw error;
        }
    }

    async getFileStream(objectName: string): Promise<Readable> {
        try {
            return await this.minioClient.getObject(this.bucketName, objectName);
        } catch (error) {
            this.logger.error('Error getting file stream from MinIO:', error);
            throw error;
        }
    }

    async deleteFile(objectName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, objectName);
        } catch (error) {
            this.logger.error('Error deleting file from MinIO:', error);
            throw error;
        }
    }

    async getFileUrl(objectName: string, expiryInSeconds = 24 * 60 * 60): Promise<string> {
        try {
            return await this.minioClient.presignedGetObject(
                this.bucketName,
                objectName,
                expiryInSeconds,
            );
        } catch (error) {
            this.logger.error('Error generating presigned URL:', error);
            throw error;
        }
    }
} 