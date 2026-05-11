import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateClientDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    cpfCnpj?: string;

    @ApiProperty({ type: 'integer', minimum: 1, maximum: 12 })
    @IsInt()
    @Min(1)
    @Max(12)
    @IsOptional()
    birthMonth?: number;

    @ApiProperty({ type: 'integer', minimum: 1, maximum: 31 })
    @IsInt()
    @Min(1)
    @Max(31)
    @IsOptional()
    birthDay?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;
}
