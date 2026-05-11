import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ProfileModule } from 'src/modules/profile/profile.module';

@Module({
    imports: [ProfileModule],
    exports: [UserService],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
