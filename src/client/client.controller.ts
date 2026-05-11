import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Client')
@UseGuards(JwtAuthGuard)
@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}
}
