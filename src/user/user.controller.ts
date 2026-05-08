import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user-dto";
import { UserService } from "./user.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @ApiOperation({
        summary: 'Criar usuário',
        description: 'Cria um novo usuário.'
    })
    @Post()
    async create(@Body() dto: CreateUserDto) {
        return this.userService.create();
    }
}