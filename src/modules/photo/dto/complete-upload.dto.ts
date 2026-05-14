import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class CompleteUploadDto {
    @ApiProperty({ type: [Number] })
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    photoIds!: number[];
}
