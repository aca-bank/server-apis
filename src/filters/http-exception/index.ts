import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from 'src/types/exception';

interface NormalizeAppExceptionParams {
  url: string;
  exceptionResponse: string | object;
}

const normalizeAppException = ({
  url,
  exceptionResponse,
}: NormalizeAppExceptionParams): AppException => {
  const { message, statusCode, error } = exceptionResponse as any;

  /* System error */
  if (typeof message === 'string') {
    return {
      url,
      message: [
        {
          details: {
            code: statusCode.toString(),
            description: message,
          },
        },
      ],
      statusCode,
      statusTitle: 'System Error',
    };
  }

  /* Validation error */
  if (Array.isArray(message)) {
    return {
      url,
      message,
      statusCode,
      statusTitle: error,
    };
  }
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const appException: AppException = normalizeAppException({
      url: request.url,
      exceptionResponse,
    });

    response.status(status).json(appException);
  }
}
