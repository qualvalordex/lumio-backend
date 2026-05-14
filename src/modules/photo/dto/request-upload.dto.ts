import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PhotoMetadataDto {
    @ApiProperty()
    @IsString()
    fileName!: string;

    @ApiProperty()
    @IsString()
    mimeType!: string;

    @ApiProperty()
    @IsInt()
    size!: number;

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    width?: number;

    @ApiProperty({ required: false })
    @IsInt()
    @IsOptional()
    height?: number;
}

export class RequestUploadDto {
    @ApiProperty({ type: [PhotoMetadataDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => PhotoMetadataDto)
    photos!: PhotoMetadataDto[];
}
