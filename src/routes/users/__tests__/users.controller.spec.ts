import { Test } from '@nestjs/testing';
import { mockUser1 } from 'src/utils/dummy';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    createCustomer: jest.fn(),
    createManager: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Manager successfully', async () => {
    (usersService.createCustomer as jest.Mock).mockResolvedValueOnce(mockUser1);

    const result = await usersController.signUpCustomer(mockUser1);

    expect(result).toStrictEqual(mockUser1);
  });

  it('should create a Manager successfully', async () => {
    (usersService.createManager as jest.Mock).mockResolvedValueOnce(mockUser1);

    const result = await usersController.signUpManager(mockUser1);

    expect(result).toStrictEqual(mockUser1);
  });
});
