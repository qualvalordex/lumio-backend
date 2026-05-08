import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';
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

    @ApiOperation({
        summary: 'Criar social link',
        description: 'Cria um social link para o perfil do usuário autenticado',
    })
    @Post('social-links')
    async createSocialLink(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateSocialLinkDto,
    ) {
        return this.profileService.createSocialLink(user.id, dto);
    }

    @ApiOperation({
        summary: 'Atualizar link de rede social',
        description: 'Atualiza a URL de um social link do perfil do usuário autenticado',
    })
    @Patch('social-links/:id')
    async updateSocialLink(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id', ParseIntPipe) socialLinkId: number,
        @Body() dto: UpdateSocialLinkDto,
    ) {
        return this.profileService.updateSocialLink(user.id, socialLinkId, dto.url);
    }

    @ApiOperation({
        summary: 'Apagar link de rede social',
        description: 'Apaga um social link do perfil do usuário autenticado',
    })
    @Delete('social-links/:id')
    async deleteSocialLink(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id', ParseIntPipe) socialLinkId: number,
    ) {
        return this.profileService.deleteSocialLink(user.id, socialLinkId);
    }
}
