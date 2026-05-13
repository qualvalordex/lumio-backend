import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectService } from './project.service';
import { CurrentUser } from '../auth/decorators/current-user';
import { type AuthenticatedUser } from '../auth/types/authenticated-user';
import { CreateProjectDto } from './dto/create-project.dto';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @ApiOperation({
        summary: 'Criar projeto',
        description: 'Cria um projeto novo para o usuário.',
    })
    @Post()
    async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProjectDto) {
        return this.projectService.create(user.id, dto);
    }
}
