import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let sut: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser = {
        id: 1,
        email: 'john@test.com',
        password: 'hashed-password',
        name: 'John',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: { findByEmail: jest.fn() },
                },
                {
                    provide: JwtService,
                    useValue: { sign: jest.fn().mockReturnValue('mocked-token') },
                },
            ],
        }).compile();

        sut = module.get(AuthService);
        userService = module.get(UserService);
        jwtService = module.get(JwtService);
    });

    it('should return access_token on valid credentials', async () => {
        jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as never);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const result = await sut.login({ email: mockUser.email, password: '123456' });

        expect(result).toEqual({ access_token: 'mocked-token' });
        expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
        jest.spyOn(userService, 'findByEmail').mockResolvedValue(null as never);

        await expect(sut.login({ email: 'unknown@test.com', password: '123456' }))
            .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
        jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as never);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(sut.login({ email: mockUser.email, password: 'wrong-password' }))
            .rejects.toThrow(UnauthorizedException);
    });
});
