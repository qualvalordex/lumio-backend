import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    startDate?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    dueDate?: string;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    clientId?: number;
}
