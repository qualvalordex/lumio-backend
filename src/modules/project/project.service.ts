import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: number, dto: CreateProjectDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException();

        if (dto.clientId) {
            const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
            if (!client) throw new NotFoundException();
        }

        const project = await this.prisma.project.create({
            data: {
                ...dto,
                userId,
            },
        });

        return project;
    }
}
