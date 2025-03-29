import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { mockUser1 } from 'src/utils/dummy';

import { AuthService } from '../auth.service';
import * as authUtils from '../auth.utils';

jest.mock('bcrypt');
jest.mock('../auth.utils.ts');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    const mockSignInPayload = {
      username: 'customer-1',
      password: 'password',
    };

    it('should throw error if the username is not existed', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce(null);
      try {
        await authService.signIn(mockSignInPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User cannot be found');
      }
    });

    it('should throw error when the password is incorrect', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      bcrypt.compare = jest.fn().mockResolvedValueOnce(false);

      try {
        await authService.signIn(mockSignInPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('Password is incorrect');
      }
    });

    it('should sign in successfully and return the access token, refresh token and user', async () => {
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);
      bcrypt.compare = jest.fn().mockResolvedValueOnce(true);
      (authUtils as any).getTokens = jest
        .fn()
        .mockResolvedValueOnce(mockTokens);

      const result = await authService.signIn(mockSignInPayload);
      expect(result).toStrictEqual(mockTokens);
    });
  });
});
