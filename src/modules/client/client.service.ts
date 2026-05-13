import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { validateCpfCnpj } from 'src/shared/utils';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
    constructor(private readonly prisma: PrismaService) {}

    async list(userId: number) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException();

        return await this.prisma.client.findMany({ where: { userId } });
    }

    async create(userId: number, dto: CreateClientDto) {
        const cpfCnpj = validateCpfCnpj(dto.cpfCnpj);

        if (!cpfCnpj.valid) throw new BadRequestException();

        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) throw new NotFoundException();

        const client = await this.prisma.client.findUnique({
            where: {
                userId_cpfCnpj: {
                    userId,
                    cpfCnpj: cpfCnpj.formatted,
                },
            },
        });

        if (client) throw new ConflictException();

        const createdClient = await this.prisma.client.create({
            data: {
                ...dto,
                userId,
                cpfCnpj: cpfCnpj.formatted,
            },
        });

        return createdClient;
    }

    async update(userId: number, clientId: number, dto: UpdateClientDto) {
        if (dto.cpfCnpj) {
            const cpfCnpj = validateCpfCnpj(dto.cpfCnpj);

            if (!cpfCnpj.valid) throw new BadRequestException();

            dto.cpfCnpj = cpfCnpj.formatted;
        }

        const client = await this.prisma.client.findUnique({ where: { id: clientId } });

        if (!client || userId != client.userId) throw new BadRequestException();

        const updatedClient = await this.prisma.client.update({
            data: dto,
            where: { id: client.id },
        });

        return updatedClient;
    }
}
