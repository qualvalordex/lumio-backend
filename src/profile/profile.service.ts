import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: number, dto: CreateProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) throw new NotFoundException();

        return this.prisma.profile.create({
            data: {
                ...dto,
                userId,
            },
        });
    }

    async update(userId: number, dto: CreateProfileDto) {
        const profile = await this.prisma.profile.findUnique({ where: { userId: userId } });

        if (!profile) throw new NotFoundException();

        return this.prisma.profile.update({
            where: { userId },
            data: dto,
        });
    }

    async findByUserId(userId: number) {
        const profile = await this.prisma.profile.findUnique({ where: { userId } });

        if (!profile) throw new NotFoundException();

        return profile;
    }

    async createSocialLink(userId: number, dto: CreateSocialLinkDto) {
        const profile = await this.prisma.profile.findUnique({ where: { userId } });

        if (!profile) throw new NotFoundException();

        return this.prisma.socialLink.create({ data: { ...dto, profileId: profile.id } });
    }
}
