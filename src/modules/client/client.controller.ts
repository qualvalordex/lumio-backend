import {
    Body,
    Controller,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user';
import { type AuthenticatedUser } from 'src/modules/auth/types/authenticated-user';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('Client')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    @ApiOperation({
        summary: 'Criar um cliente',
        description: 'Cria um cliente na carteira do usuário',
    })
    @Post()
    async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClientDto) {
        return this.clientService.create(user.id, dto);
    }

    @ApiOperation({
        summary: 'Atualizar cliente',
        description: 'Atualiza os dados de um cliente da carteira.',
    })
    @Patch(':clientId')
    async update(
        @CurrentUser() user: AuthenticatedUser,
        @Param('clientId', ParseIntPipe) clientId: number,
        @Body() dto: UpdateClientDto,
    ) {
        return this.clientService.update(user.id, clientId, dto);
    }
}
