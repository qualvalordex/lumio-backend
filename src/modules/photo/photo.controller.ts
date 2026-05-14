import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user';
import { type AuthenticatedUser } from '../auth/types/authenticated-user';
import { PhotoService } from './photo.service';
import { RequestUploadDto } from './dto/request-upload.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';

@ApiTags('Photos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('project/:projectId/photos')
export class PhotoController {
    constructor(private readonly photoService: PhotoService) {}

    @ApiOperation({
        summary: 'Solicitar URLs de upload',
        description: 'Gera URLs pré-assinadas para upload direto de fotos no object storage.',
    })
    @Post('request-upload')
    async requestUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Param('projectId', ParseIntPipe) projectId: number,
        @Body() dto: RequestUploadDto,
    ) {
        return this.photoService.requestUpload(user.id, projectId, dto);
    }

    @ApiOperation({
        summary: 'Confirmar upload concluído',
        description: 'Marca as fotos como em processamento após o upload direto no storage.',
    })
    @Post('complete-upload')
    async completeUpload(
        @CurrentUser() user: AuthenticatedUser,
        @Param('projectId', ParseIntPipe) projectId: number,
        @Body() dto: CompleteUploadDto,
    ) {
        return this.photoService.completeUpload(user.id, projectId, dto);
    }
}
