import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateUserDto) {
        const user = await this.prisma.user.findFirst({ where: { email: dto.email } });

        if (user) throw new ConflictException();

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.user.create({
            data: { ...dto, password: hashedPassword },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findAll() {
        return await this.prisma.user.findMany();
    }

    async findOne(id: number) {
        const user = this.prisma.user.findFirst({ where: { id } });

        if (!user) throw new NotFoundException();

        return user;
    }
}
