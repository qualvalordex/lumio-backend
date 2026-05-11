import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateClientDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsString()
    phone!: string;

    @ApiProperty()
    @IsString()
    cpfCnpj!: string;

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
