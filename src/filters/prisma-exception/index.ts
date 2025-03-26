import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

import { PrismaErrorInfo } from './constants';
import { normalizePrismaError } from './utils';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { statusCode, exceptionDesc } = PrismaErrorInfo[exception.code] || {};

    if (statusCode) {
      const appException = normalizePrismaError({
        statusCode,
        request,
        exception,
        exceptionDesc,
      });
      response.status(statusCode).json(appException);
      return;
    }

    super.catch(exception, host);
  }
}
