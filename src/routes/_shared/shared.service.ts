import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/app/prisma/prisma.service';
import { UserModel } from 'src/models/user.model';

@Injectable()
export class SharedService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check and get User by Id
   */

  async checkAndGetUserById(userId: string): Promise<UserModel> {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        account: true,
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    if (!foundUser.activated) {
      throw new ForbiddenException('User is deactivated');
    }

    return foundUser;
  }

  /**
   * Check and get User by Id
   */

  async checkAndGetUserByAccountId(accountId: string): Promise<UserModel> {
    const foundBankAccount = await this.prisma.bankAccount.findUnique({
      where: {
        id: accountId,
      },
    });

    const foundUser = await this.checkAndGetUserById(foundBankAccount?.userId);
    return foundUser;
  }
}
