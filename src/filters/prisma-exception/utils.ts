import { Prisma } from '@prisma/client';
import { AppException } from 'src/types/exception';

interface NormalizePrismaErrorParams {
  statusCode: number;
  request: Request;
  exception: Prisma.PrismaClientKnownRequestError;
  exceptionDesc: string;
}

export const normalizePrismaError = ({
  statusCode,
  request,
  exception,
  exceptionDesc,
}: NormalizePrismaErrorParams): AppException => {
  return {
    url: request.url,
    message: [
      {
        fieldName: exception.meta.target[0],
        payload: request.body,
        details: {
          code: exception.code,
          description: exceptionDesc,
        },
      },
    ],
    statusCode,
    statusTitle: 'Prisma Client Error',
  };
};
