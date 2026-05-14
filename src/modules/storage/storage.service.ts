import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
    private readonly client: S3Client;
    private readonly bucket: string;
    private readonly expirySeconds: number;

    constructor(private readonly config: ConfigService) {
        const endpoint = config.get<string>('S3_ENDPOINT');
        this.client = new S3Client({
            region: config.getOrThrow<string>('S3_REGION'),
            credentials: {
                accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY_ID'),
                secretAccessKey: config.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
            },
            ...(endpoint
                ? {
                      endpoint,
                      forcePathStyle: config.get('S3_FORCE_PATH_STYLE') === 'true',
                  }
                : {}),
        });
        this.bucket = config.getOrThrow<string>('S3_BUCKET');
        this.expirySeconds = parseInt(config.get<string>('S3_PRESIGN_EXPIRY_SECONDS') ?? '900');
    }

    async generateUploadUrl(key: string, mimeType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: mimeType,
        });
        return getSignedUrl(this.client, command, { expiresIn: this.expirySeconds });
    }
}
