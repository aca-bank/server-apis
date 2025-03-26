import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { UserModel, UserRole } from 'src/models/user.model';

import { AuthService } from '../auth.service';
import * as authUtils from '../auth.utils';

jest.mock('bcrypt');
jest.mock('../auth.utils.ts');

const mockUser = {
  id: 'c1-012345',
  username: 'customer-1',
  password: '1111',
  name: 'Customer 1',
  balance: 100,
  role: UserRole.CUSTOMER,
};

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

  describe('createUser', () => {
    it('should throw error if the initial balance is less than 0', async () => {
      const mockPayload = {
        ...mockUser,
        balance: 0,
      };

      try {
        await authService.createUser(mockPayload, UserRole.CUSTOMER);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toEqual('Balance must be greater than 0');
      }
    });

    it('should throw error if the username was taken by another user', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ username: mockUser.username });

      try {
        await authService.createUser(mockUser, UserRole.CUSTOMER);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toEqual('Username is existed');
      }
    });

    it('should create a new user successfully', async () => {
      const createdUser: UserModel = {
        ...mockUser,
        id: '123456',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
      };
      prismaService.user.create = jest.fn().mockResolvedValueOnce(createdUser);

      const result = await authService.createUser(mockUser, UserRole.CUSTOMER);
      expect(result).toStrictEqual(createdUser);
    });
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
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce(mockUser);
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
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValueOnce(true);
      (authUtils as any).getTokens = jest
        .fn()
        .mockResolvedValueOnce(mockTokens);

      const result = await authService.signIn(mockSignInPayload);
      expect(result).toStrictEqual({
        ...mockTokens,
        ...mockUser,
      });
    });
  });
});
