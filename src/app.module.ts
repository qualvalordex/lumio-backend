import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ClientModule } from './modules/client/client.module';
import { ProjectModule } from './modules/project/project.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        UserModule,
        ProfileModule,
        ClientModule,
        ProjectModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
