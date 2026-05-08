import { ConflictException, Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateUserDto) {
        const user = await this.prisma.user.findFirst({ where: { email: dto.email } });

        if (user) throw new ConflictException();

        return this.prisma.user.create({
            data: dto,
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
}
