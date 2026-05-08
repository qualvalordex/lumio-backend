import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({
        summary: 'Fazer login',
        description: 'Autentica o usuário na plataforma.',
    })
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @ApiOperation({
        summary: 'Obter meus dados',
        description: 'Retorna os dados do usuário logado.',
    })
    @UseGuards(JwtAuthGuard)
    @Post('me')
    me(@CurrentUser() user: any) {
        return user;
    }
}
