import { HttpStatus } from '@nestjs/common';

interface InfoProps {
  statusCode: HttpStatus;
  exceptionDesc: string;
}

export const PrismaErrorInfo: Record<string, InfoProps> = {
  P2002: {
    statusCode: HttpStatus.CONFLICT,
    exceptionDesc: 'Unique constraints failed',
  },
};
