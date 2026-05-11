import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientService {
    constructor(private readonly prismaService: PrismaService) {}

    private validateCpfCnpj(value: string): {
        valid: boolean;
        formatted: string;
        type: 'cpf' | 'cnpj';
    } {
        const digits = value.replace(/\D/g, '');

        if (digits.length === 11) {
            return {
                valid: this.isCpfValid(digits),
                formatted: digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
                type: 'cpf',
            };
        }

        if (digits.length === 14) {
            return {
                valid: this.isCnpjValid(digits),
                formatted: digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
                type: 'cnpj',
            };
        }

        return { valid: false, formatted: value, type: digits.length <= 11 ? 'cpf' : 'cnpj' };
    }

    private isCpfValid(digits: string): boolean {
        if (/^(\d)\1{10}$/.test(digits)) return false;

        const calcDigit = (slice: string, factor: number) => {
            const sum = slice.split('').reduce((acc, d, i) => acc + parseInt(d) * (factor - i), 0);
            const remainder = sum % 11;
            return remainder < 2 ? 0 : 11 - remainder;
        };

        return (
            calcDigit(digits.slice(0, 9), 10) === parseInt(digits[9]) &&
            calcDigit(digits.slice(0, 10), 11) === parseInt(digits[10])
        );
    }

    private isCnpjValid(digits: string): boolean {
        if (/^(\d)\1{13}$/.test(digits)) return false;

        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        const calcDigit = (slice: string, weights: number[]) => {
            const sum = slice.split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
            const remainder = sum % 11;
            return remainder < 2 ? 0 : 11 - remainder;
        };

        return (
            calcDigit(digits.slice(0, 12), weights1) === parseInt(digits[12]) &&
            calcDigit(digits.slice(0, 13), weights2) === parseInt(digits[13])
        );
    }

    async create(userId: number, dto: CreateClientDto) {
        const cpfCnpj = this.validateCpfCnpj(dto.cpfCnpj);

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
}
