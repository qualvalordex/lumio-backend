import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PhotoStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { RequestUploadDto } from './dto/request-upload.dto';

@Injectable()
export class PhotoService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
    ) {}

    async requestUpload(userId: number, projectId: number, dto: RequestUploadDto) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new NotFoundException();
        if (project.userId !== userId) throw new BadRequestException();

        if (project.includedPhotos !== null) {
            const existingCount = await this.prisma.photo.count({ where: { projectId } });
            if (existingCount + dto.photos.length > project.includedPhotos) {
                throw new BadRequestException(
                    `Limite de fotos excedido. Permitido: ${project.includedPhotos}`,
                );
            }
        }

        const results = await Promise.all(
            dto.photos.map(async (photo) => {
                const ext = photo.fileName.split('.').pop() ?? 'bin';
                const key = `${userId}/${projectId}/${crypto.randomUUID()}.${ext}`;
                const uploadUrl = await this.storage.generateUploadUrl(key, photo.mimeType);

                const created = await this.prisma.photo.create({
                    data: {
                        fileName: photo.fileName,
                        originalKey: key,
                        size: photo.size,
                        width: photo.width,
                        height: photo.height,
                        mimeType: photo.mimeType,
                        projectId,
                        status: PhotoStatus.UPLOADING,
                    },
                });

                return { photoId: created.id, uploadUrl, key };
            }),
        );

        return { photos: results };
    }

    async completeUpload(userId: number, projectId: number, dto: CompleteUploadDto) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new NotFoundException();
        if (project.userId !== userId) throw new BadRequestException();

        const photos = await this.prisma.photo.findMany({
            where: { id: { in: dto.photoIds }, projectId },
        });

        if (photos.length !== dto.photoIds.length) throw new BadRequestException();

        await this.prisma.photo.updateMany({
            where: { id: { in: dto.photoIds }, projectId },
            data: { status: PhotoStatus.PROCESSING },
        });

        return this.prisma.photo.findMany({
            where: { id: { in: dto.photoIds } },
        });
    }
}
