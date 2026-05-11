import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';

@Module({
    imports: [],
    exports: [],
    providers: [ClientService],
    controllers: [ClientController],
})
export class ClientModule {}
