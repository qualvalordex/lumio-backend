import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';

@Module({
    imports: [PrismaModule, UserModule, ProfileModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
