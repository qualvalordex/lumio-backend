import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
    let sut: ProfileService;
    let prisma: PrismaService;

    const mockUser = { id: 1, email: 'john@test.com', name: 'John', isActive: true, createdAt: new Date(), updatedAt: new Date() };
    const mockProfile = { id: 1, userId: 1, bio: null, avatarUrl: null, createdAt: new Date(), updatedAt: new Date() };
    const mockSocialLink = { id: 1, profileId: 1, url: 'https://instagram.com/john', platform: 'instagram', createdAt: new Date(), updatedAt: new Date() };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ProfileService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: { findUnique: jest.fn() },
                        profile: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
                        socialLink: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
                    },
                },
            ],
        }).compile();

        sut = module.get(ProfileService);
        prisma = module.get(PrismaService);
    });

    describe('createEmpty', () => {
        it('should throw NotFoundException when user does not exist', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await expect(sut.createEmpty(1)).rejects.toThrow(NotFoundException);
        });

        it('should create and return an empty profile', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as never);
            jest.spyOn(prisma.profile, 'create').mockResolvedValue(mockProfile as never);

            const result = await sut.createEmpty(1);

            expect(prisma.profile.create).toHaveBeenCalledWith({ data: { userId: 1 } });
            expect(result).toEqual(mockProfile);
        });
    });

    describe('findByUserId', () => {
        it('should throw NotFoundException when profile does not exist', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);

            await expect(sut.findByUserId(1)).rejects.toThrow(NotFoundException);
        });

        it('should return the profile', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(mockProfile as never);

            const result = await sut.findByUserId(1);

            expect(result).toEqual(mockProfile);
        });
    });

    describe('update', () => {
        it('should throw NotFoundException when profile does not exist', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);

            await expect(sut.update(1, { bio: 'Hello' } as never)).rejects.toThrow(NotFoundException);
        });

        it('should update and return the profile', async () => {
            const updated = { ...mockProfile, bio: 'Hello' };
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(mockProfile as never);
            jest.spyOn(prisma.profile, 'update').mockResolvedValue(updated as never);

            const result = await sut.update(1, { bio: 'Hello' } as never);

            expect(result.bio).toBe('Hello');
        });
    });

    describe('createSocialLink', () => {
        it('should throw NotFoundException when profile does not exist', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);

            await expect(sut.createSocialLink(1, { url: 'https://instagram.com/john', platform: 'instagram' }))
                .rejects.toThrow(NotFoundException);
        });

        it('should create and return the social link', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(mockProfile as never);
            jest.spyOn(prisma.socialLink, 'create').mockResolvedValue(mockSocialLink as never);

            const result = await sut.createSocialLink(1, { url: 'https://instagram.com/john', platform: 'instagram' });

            expect(prisma.socialLink.create).toHaveBeenCalledWith({
                data: { url: 'https://instagram.com/john', platform: 'instagram', profileId: mockProfile.id },
            });
            expect(result).toEqual(mockSocialLink);
        });
    });

    describe('updateSocialLink', () => {
        it('should throw NotFoundException when profile does not exist', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);

            await expect(sut.updateSocialLink(1, 1, 'https://new-url.com')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when social link does not belong to profile', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(mockProfile as never);
            jest.spyOn(prisma.socialLink, 'findFirst').mockResolvedValue(null);

            await expect(sut.updateSocialLink(1, 99, 'https://new-url.com')).rejects.toThrow(NotFoundException);
        });

        it('should update and return the social link', async () => {
            const updated = { ...mockSocialLink, url: 'https://new-url.com' };
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(mockProfile as never);
            jest.spyOn(prisma.socialLink, 'findFirst').mockResolvedValue(mockSocialLink as never);
            jest.spyOn(prisma.socialLink, 'update').mockResolvedValue(updated as never);

            const result = await sut.updateSocialLink(1, 1, 'https://new-url.com');

            expect(result.url).toBe('https://new-url.com');
        });
    });

    describe('deleteSocialLink', () => {
        it('should throw NotFoundException when profile does not exist', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);

            await expect(sut.deleteSocialLink(1, 1)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when social link does not belong to profile', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(mockProfile as never);
            jest.spyOn(prisma.socialLink, 'findFirst').mockResolvedValue(null);

            await expect(sut.deleteSocialLink(1, 99)).rejects.toThrow(NotFoundException);
        });

        it('should delete and return the social link', async () => {
            jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(mockProfile as never);
            jest.spyOn(prisma.socialLink, 'findFirst').mockResolvedValue(mockSocialLink as never);
            jest.spyOn(prisma.socialLink, 'delete').mockResolvedValue(mockSocialLink as never);

            const result = await sut.deleteSocialLink(1, 1);

            expect(prisma.socialLink.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(mockSocialLink);
        });
    });
});
