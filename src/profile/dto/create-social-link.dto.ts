import { IsEnum, IsString } from 'class-validator';
import { SocialLinkType } from '../enums/social-link-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSocialLinkDto {
    @ApiProperty()
    @IsEnum(SocialLinkType)
    type!: SocialLinkType;

    @ApiProperty()
    @IsString()
    url!: string;
}
