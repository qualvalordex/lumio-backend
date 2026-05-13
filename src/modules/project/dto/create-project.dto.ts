import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

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

    @ApiProperty()
    @IsInt()
    @IsOptional()
    clientId?: number;
}
