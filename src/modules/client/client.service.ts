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
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: number, dto: CreateClientDto) {
        const cpfCnpj = validateCpfCnpj(dto.cpfCnpj);

        if (!cpfCnpj.valid) throw new BadRequestException();

        const user = await this.prismaService.user.findUnique({ where: { id: userId } });

        if (!user) throw new NotFoundException();

        const client = await this.prismaService.client.findUnique({
            where: {
                userId_cpfCnpj: {
                    userId,
                    cpfCnpj: cpfCnpj.formatted,
                },
            },
        });

        if (client) throw new ConflictException();

        const createdClient = await this.prismaService.client.create({
            data: {
                ...dto,
                userId,
                cpfCnpj: cpfCnpj.formatted,
            },
        });

        return createdClient;
    }

    async update(userId: number, clientId: number, dto: UpdateClientDto) {
        const client = await this.prismaService.client.findUnique({ where: { id: clientId } });

        if (!client || userId != client.userId) throw new BadRequestException();

        const updatedClient = await this.prismaService.client.update({
            data: dto,
            where: { id: client.id },
        });

        return updatedClient;
    }
}
