import { Test } from '@nestjs/testing';
import { mockUser1 } from 'src/utils/dummy';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    createUser: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sign in successfully', async () => {
    const mockSignInPayload = {
      username: mockUser1.username,
      password: mockUser1.password,
    };
    const mockSignInResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    (authService.signIn as jest.Mock).mockResolvedValueOnce(mockSignInResponse);

    const result = await authController.signIn(mockSignInPayload);

    expect(result).toStrictEqual(mockSignInResponse);
    expect(authService.signIn).toHaveBeenCalledWith(mockSignInPayload);
  });
});
