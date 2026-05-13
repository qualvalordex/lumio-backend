import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
    constructor(private readonly prisma: PrismaService) {}

    async list(userId: number) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException();

        return await this.prisma.project.findMany({ where: { userId } });
    }

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

    async update(userId: number, projectId: number, dto: UpdateProjectDto) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new NotFoundException();

        if (project.userId !== userId) throw new BadRequestException();

        const updatedProject = await this.prisma.project.update({
            where: { id: projectId },
            data: dto,
        });

        return updatedProject;
    }
}
