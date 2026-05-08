import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
    let sut: UserService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findFirst: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        sut = module.get(UserService);
        prisma = module.get(PrismaService);
    });

    it('should create an user', async () => {
        jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

        jest.spyOn(prisma.user, 'create').mockResolvedValue({
            id: 1,
            email: 'john@test.com',
            name: 'John',
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as never);

        const result = await sut.create({
            email: 'john@test.com',
            password: '123456',
            name: 'John',
        });

        expect(result.email).toBe('john@test.com');
    });

    it('should throw if an user email is already registered', async () => {
        jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({
            id: 1,
            email: 'john@test.com',
            name: 'John',
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as never);

        await expect(
            sut.create({
                email: 'john@test.com',
                password: '123456',
                name: 'John',
            }),
        ).rejects.toThrow(ConflictException);
    });

    it('should throw when user not found', async () => {
        jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

        await expect(sut.findOne(3)).rejects.toThrow(NotFoundException);
        expect(prisma.user.findFirst).toHaveBeenCalledWith({
            where: { id: 3 },
        });
    });
});
