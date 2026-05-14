import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PhotoStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PhotoService } from './photo.service';

describe('PhotoService', () => {
    let sut: PhotoService;
    let prisma: PrismaService;
    let storage: StorageService;

    const mockProject = {
        id: 1,
        name: 'Ensaio Primavera',
        userId: 1,
        clientId: null,
        startDate: null,
        dueDate: null,
        quotedPrice: null,
        agreedPrice: null,
        includedPhotos: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockPhoto = {
        id: 1,
        fileName: 'foto.jpg',
        originalKey: '1/1/uuid.jpg',
        previewKey: null,
        thumbKey: null,
        position: 0,
        width: 4000,
        height: 3000,
        size: 5000000,
        mimeType: 'image/jpeg',
        status: PhotoStatus.UPLOADING,
        isSelected: false,
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                PhotoService,
                {
                    provide: PrismaService,
                    useValue: {
                        project: { findUnique: jest.fn() },
                        photo: {
                            count: jest.fn(),
                            create: jest.fn(),
                            findMany: jest.fn(),
                            updateMany: jest.fn(),
                        },
                    },
                },
                {
                    provide: StorageService,
                    useValue: {
                        generateUploadUrl: jest.fn(),
                    },
                },
            ],
        }).compile();

        sut = module.get(PhotoService);
        prisma = module.get(PrismaService);
        storage = module.get(StorageService);
    });

    describe('requestUpload', () => {
        const dto = {
            photos: [{ fileName: 'foto.jpg', mimeType: 'image/jpeg', size: 5000000, width: 4000, height: 3000 }],
        };

        it('should throw NotFoundException when project does not exist', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

            await expect(sut.requestUpload(1, 1, dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when project belongs to another user', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue({ ...mockProject, userId: 99 } as never);

            await expect(sut.requestUpload(1, 1, dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when photo limit is exceeded', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue({ ...mockProject, includedPhotos: 5 } as never);
            jest.spyOn(prisma.photo, 'count').mockResolvedValue(5);

            await expect(sut.requestUpload(1, 1, dto)).rejects.toThrow(BadRequestException);
        });

        it('should create photos and return presigned urls', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as never);
            jest.spyOn(storage, 'generateUploadUrl').mockResolvedValue('https://minio/presigned');
            jest.spyOn(prisma.photo, 'create').mockResolvedValue(mockPhoto as never);

            const result = await sut.requestUpload(1, 1, dto);

            expect(result.photos).toHaveLength(1);
            expect(result.photos[0]).toMatchObject({
                photoId: mockPhoto.id,
                uploadUrl: 'https://minio/presigned',
            });
            expect(prisma.photo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: PhotoStatus.UPLOADING, projectId: 1 }),
                }),
            );
        });

        it('should check photo limit when includedPhotos is set', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue({ ...mockProject, includedPhotos: 10 } as never);
            jest.spyOn(prisma.photo, 'count').mockResolvedValue(9);
            jest.spyOn(storage, 'generateUploadUrl').mockResolvedValue('https://minio/presigned');
            jest.spyOn(prisma.photo, 'create').mockResolvedValue(mockPhoto as never);

            const result = await sut.requestUpload(1, 1, dto);

            expect(prisma.photo.count).toHaveBeenCalledWith({ where: { projectId: 1 } });
            expect(result.photos).toHaveLength(1);
        });
    });

    describe('completeUpload', () => {
        const dto = { photoIds: [1] };

        it('should throw NotFoundException when project does not exist', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

            await expect(sut.completeUpload(1, 1, dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when project belongs to another user', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue({ ...mockProject, userId: 99 } as never);

            await expect(sut.completeUpload(1, 1, dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when a photoId does not belong to the project', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as never);
            jest.spyOn(prisma.photo, 'findMany').mockResolvedValue([]);

            await expect(sut.completeUpload(1, 1, dto)).rejects.toThrow(BadRequestException);
        });

        it('should update photos status to PROCESSING and return them', async () => {
            const processingPhoto = { ...mockPhoto, status: PhotoStatus.PROCESSING };
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as never);
            jest.spyOn(prisma.photo, 'findMany')
                .mockResolvedValueOnce([mockPhoto] as never)
                .mockResolvedValueOnce([processingPhoto] as never);
            jest.spyOn(prisma.photo, 'updateMany').mockResolvedValue({ count: 1 } as never);

            const result = await sut.completeUpload(1, 1, dto);

            expect(prisma.photo.updateMany).toHaveBeenCalledWith({
                where: { id: { in: [1] }, projectId: 1 },
                data: { status: PhotoStatus.PROCESSING },
            });
            expect(result[0].status).toBe(PhotoStatus.PROCESSING);
        });
    });
});
