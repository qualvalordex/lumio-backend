import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
    let sut: ProjectService;
    let prisma: PrismaService;

    const mockUser = { id: 1, email: 'john@test.com', name: 'John', isActive: true, createdAt: new Date(), updatedAt: new Date() };
    const mockClient = { id: 1, name: 'Cliente Teste', phone: '11999999999', cpfCnpj: '529.982.247-25', userId: 1, createdAt: new Date(), updatedAt: new Date() };
    const mockProject = {
        id: 1,
        name: 'Ensaio Primavera',
        startDate: new Date('2026-05-13'),
        dueDate: new Date('2026-06-13'),
        quotedPrice: null,
        agreedPrice: null,
        includedPhotos: null,
        userId: 1,
        clientId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ProjectService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: { findUnique: jest.fn() },
                        client: { findUnique: jest.fn() },
                        project: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
                    },
                },
            ],
        }).compile();

        sut = module.get(ProjectService);
        prisma = module.get(PrismaService);
    });

    describe('list', () => {
        it('should throw NotFoundException when user does not exist', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await expect(sut.list(1)).rejects.toThrow(NotFoundException);
        });

        it('should return projects for a valid user', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as never);
            jest.spyOn(prisma.project, 'findMany').mockResolvedValue([mockProject] as never);

            const result = await sut.list(1);

            expect(result).toEqual([mockProject]);
        });
    });

    describe('create', () => {
        it('should throw NotFoundException when user does not exist', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await expect(sut.create(1, { name: 'Test' })).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when clientId is provided but client does not exist', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as never);
            jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(null);

            await expect(sut.create(1, { name: 'Test', clientId: 99 })).rejects.toThrow(NotFoundException);
        });

        it('should create and return the project', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as never);
            jest.spyOn(prisma.project, 'create').mockResolvedValue(mockProject as never);

            const result = await sut.create(1, { name: 'Ensaio Primavera' });

            expect(prisma.project.create).toHaveBeenCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ userId: 1 }) }),
            );
            expect(result).toEqual(mockProject);
        });

        it('should create project linked to a client', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as never);
            jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(mockClient as never);
            jest.spyOn(prisma.project, 'create').mockResolvedValue({ ...mockProject, clientId: 1 } as never);

            const result = await sut.create(1, { name: 'Ensaio Primavera', clientId: 1 });

            expect(result.clientId).toBe(1);
        });
    });

    describe('update', () => {
        it('should throw NotFoundException when project does not exist', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(null);

            await expect(sut.update(1, 99, { name: 'New Name' })).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when project belongs to another user', async () => {
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue({ ...mockProject, userId: 99 } as never);

            await expect(sut.update(1, 1, { name: 'New Name' })).rejects.toThrow(BadRequestException);
        });

        it('should update and return the project', async () => {
            const updated = { ...mockProject, name: 'Updated' };
            jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProject as never);
            jest.spyOn(prisma.project, 'update').mockResolvedValue(updated as never);

            const result = await sut.update(1, 1, { name: 'Updated' });

            expect(result.name).toBe('Updated');
        });
    });
});
