import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET'),
        });

        console.log('JWT STRATEGY INICIALIZADA');
    }

    async validate(payload: any) {
        console.log('JWT PAYLOAD:', payload);

        return {
            id: payload.sub,
            email: payload.email,
        };
    }
}
