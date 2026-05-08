import { IsString } from 'class-validator';

export class UpdateSocialLinkDto {
    @IsString()
    url!: string;
}
