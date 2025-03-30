import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { mockUser1 } from 'src/utils/dummy';

import { SharedService } from '../shared.service';

describe('SharedService', () => {
  let sharedService: SharedService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SharedService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    sharedService = module.get<SharedService>(SharedService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAndGetUserById', () => {
    it('should throw error when the user is not found', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce(null);

      try {
        await sharedService.checkAndGetUserById(mockUser1.id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found');
      }
    });

    it('should throw error when the user deactivated', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValueOnce({
        ...mockUser1,
        activated: false,
      });

      try {
        await sharedService.checkAndGetUserById(mockUser1.id);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('User is deactivated');
      }
    });

    it('should return corresponding user base on user Id', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValueOnce(mockUser1);

      const foundUser = await sharedService.checkAndGetUserById(mockUser1.id);

      expect(foundUser).toStrictEqual(mockUser1);
    });
  });
});
