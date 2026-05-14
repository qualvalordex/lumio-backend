import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [StorageModule],
    providers: [PhotoService],
    controllers: [PhotoController],
})
export class PhotoModule {}
