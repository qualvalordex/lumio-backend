import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: number, dto: CreateClientDto) {
        const user = await this.prismaService.user.findUnique({ where: { id: userId } });

        if (!user) throw new NotFoundException();

        const client = await this.prismaService.client.findUnique({
            where: {
                userId_cpfCnpj: {
                    userId,
                    cpfCnpj: dto.cpfCnpj,
                },
            },
        });

        if (client) throw new ConflictException();

        const createdClient = await this.prismaService.client.create({
            data: {
                userId,
                ...dto,
            },
        });

        return createdClient;
    }
}
