import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CurrentUser } from 'src/auth/decorators/current-user';
import { type AuthenticatedUser } from 'src/auth/types/authenticated-user';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Profile')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @ApiOperation({
        summary: 'Criar perfil',
        description: 'Cria um perfil para um usuário',
    })
    @Post()
    async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProfileDto) {
        return this.profileService.create(user.id, dto);
    }

    @ApiOperation({
        summary: 'Atualizar perfil',
        description: 'Atualiza o perfil de um usuário',
    })
    @Patch(':id')
    async update(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProfileDto) {
        return this.profileService.update(user.id, dto);
    }

    @ApiOperation({
        summary: 'Obter perfil',
        description: 'Obtém o perfil de um usuário',
    })
    @Get(':id')
    async findOne(@CurrentUser() user: AuthenticatedUser) {
        return this.profileService.findByUserId(user.id);
    }
}
