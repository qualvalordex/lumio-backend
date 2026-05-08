import { IsEnum, IsString } from 'class-validator';
import { SocialLinkType } from '../enums/social-link-type.enum';

export class CreateSocialLinkDto {
    @IsEnum(SocialLinkType)
    type!: SocialLinkType;

    @IsString()
    url!: string;
}
