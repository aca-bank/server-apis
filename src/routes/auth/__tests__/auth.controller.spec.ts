import { Test } from '@nestjs/testing';
import { UserModel, UserRole } from 'src/models/user.model';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

const mockUser = {
  id: 'c1-012345',
  username: 'customer-1',
  password: '1111',
  name: 'Customer 1',
  balance: 100,
  role: UserRole.CUSTOMER,
};

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

  it('should create a new Customer successfully', async () => {
    const createdCustomer: UserModel = {
      ...mockUser,
      id: '123456',
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
    };
    (authService.createUser as jest.Mock).mockResolvedValueOnce(
      createdCustomer,
    );

    const result = await authController.signUpCustomer(mockUser);

    expect(result).toStrictEqual(createdCustomer);
    expect(authService.createUser).toHaveBeenCalledWith(
      mockUser,
      UserRole.CUSTOMER,
    );
  });

  it('should create a new Manager successfully', async () => {
    const createdManager: UserModel = {
      ...mockUser,
      id: '123456',
      role: UserRole.MANAGER,
      createdAt: new Date(),
    };
    (authService.createUser as jest.Mock).mockResolvedValueOnce(createdManager);

    const result = await authController.signUpManager(mockUser);

    expect(result).toStrictEqual(createdManager);
    expect(authService.createUser).toHaveBeenCalledWith(
      mockUser,
      UserRole.MANAGER,
    );
  });

  it('should sign in successfully', async () => {
    const mockSignInPayload = {
      username: mockUser.username,
      password: mockUser.password,
    };
    const mockSignInResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      ...mockUser,
    };
    (authService.signIn as jest.Mock).mockResolvedValueOnce(mockSignInResponse);

    const result = await authController.signIn(mockSignInPayload);

    expect(result).toStrictEqual(mockSignInResponse);
    expect(authService.signIn).toHaveBeenCalledWith(mockSignInPayload);
  });
});
