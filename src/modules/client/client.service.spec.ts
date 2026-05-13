import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ClientService } from './client.service';
import * as sharedUtils from 'src/shared/utils';

jest.mock('src/shared/utils', () => ({
    validateCpfCnpj: jest.fn(),
}));

describe('ClientService', () => {
    let sut: ClientService;
    let prisma: PrismaService;

    const mockUser = { id: 1, email: 'john@test.com', name: 'John', isActive: true, createdAt: new Date(), updatedAt: new Date() };
    const mockClient = {
        id: 1,
        name: 'Cliente Teste',
        phone: '11999999999',
        cpfCnpj: '529.982.247-25',
        birthMonth: null,
        birthDay: null,
        email: null,
        notes: null,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ClientService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: { findUnique: jest.fn() },
                        client: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        sut = module.get(ClientService);
        prisma = module.get(PrismaService);
    });

    describe('list', () => {
        it('should throw NotFoundException when user does not exist', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await expect(sut.list(1)).rejects.toThrow(NotFoundException);
        });

        it('should return clients for a valid user', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as never);
            jest.spyOn(prisma.client, 'findMany').mockResolvedValue([mockClient] as never);

            const result = await sut.list(1);

            expect(result).toEqual([mockClient]);
        });
    });

    describe('create', () => {
        it('should throw BadRequestException when CPF/CNPJ is invalid', async () => {
            (sharedUtils.validateCpfCnpj as jest.Mock).mockReturnValue({ valid: false, formatted: '000', type: 'cpf' });

            await expect(sut.create(1, { name: 'Test', phone: '11999999999', cpfCnpj: '000.000.000-00' }))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            (sharedUtils.validateCpfCnpj as jest.Mock).mockReturnValue({ valid: true, formatted: '529.982.247-25', type: 'cpf' });
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            await expect(sut.create(1, { name: 'Test', phone: '11999999999', cpfCnpj: '52998224725' }))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException when client already exists for user', async () => {
            (sharedUtils.validateCpfCnpj as jest.Mock).mockReturnValue({ valid: true, formatted: '529.982.247-25', type: 'cpf' });
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as never);
            jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(mockClient as never);

            await expect(sut.create(1, { name: 'Test', phone: '11999999999', cpfCnpj: '52998224725' }))
                .rejects.toThrow(ConflictException);
        });

        it('should create and return the client with formatted CPF', async () => {
            (sharedUtils.validateCpfCnpj as jest.Mock).mockReturnValue({ valid: true, formatted: '529.982.247-25', type: 'cpf' });
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as never);
            jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(null);
            jest.spyOn(prisma.client, 'create').mockResolvedValue(mockClient as never);

            const result = await sut.create(1, { name: 'Cliente Teste', phone: '11999999999', cpfCnpj: '52998224725' });

            expect(prisma.client.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ cpfCnpj: '529.982.247-25', userId: 1 }),
                }),
            );
            expect(result).toEqual(mockClient);
        });
    });

    describe('update', () => {
        it('should throw BadRequestException when new CPF/CNPJ is invalid', async () => {
            (sharedUtils.validateCpfCnpj as jest.Mock).mockReturnValue({ valid: false, formatted: '000', type: 'cpf' });

            await expect(sut.update(1, 1, { cpfCnpj: '000.000.000-00' }))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when client does not exist', async () => {
            jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(null);

            await expect(sut.update(1, 99, { name: 'New Name' })).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when client belongs to another user', async () => {
            jest.spyOn(prisma.client, 'findUnique').mockResolvedValue({ ...mockClient, userId: 99 } as never);

            await expect(sut.update(1, 1, { name: 'New Name' })).rejects.toThrow(BadRequestException);
        });

        it('should update and return the client', async () => {
            jest.spyOn(prisma.client, 'findUnique').mockResolvedValue(mockClient as never);
            jest.spyOn(prisma.client, 'update').mockResolvedValue({ ...mockClient, name: 'Updated' } as never);

            const result = await sut.update(1, 1, { name: 'Updated' });

            expect(result.name).toBe('Updated');
        });
    });
});
