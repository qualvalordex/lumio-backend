import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: any) {
        console.log('GUARD EXECUTANDO');
        return super.canActivate(context);
    }
}
