import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty({ example: '2026-05-13' })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    startDate?: Date;

    @ApiProperty({ example: '2026-06-13' })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    dueDate?: Date;

    @ApiProperty({ example: 1500.00 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    quotedPrice?: number;

    @ApiProperty({ example: 1200.00 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    agreedPrice?: number;

    @ApiProperty({ example: 50 })
    @IsInt()
    @IsOptional()
    includedPhotos?: number;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    clientId?: number;
}
