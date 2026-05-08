import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({
        summary: 'Criar usuário',
        description: 'Cria um novo usuário.',
    })
    @Post()
    async create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }

    @ApiOperation({
        summary: 'Listar usuários',
        description: 'Listar todos os usuários.',
    })
    @Get()
    async findAll() {
        return this.userService.findAll();
    }

    @ApiOperation({
        summary: 'Encontrar usuário',
        description: 'Encontrar um usuário pelo id',
    })
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }
}
