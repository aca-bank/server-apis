import { HttpStatus } from '@nestjs/common';

export class ExceptionMessageDetails {
  code: string;
  description: string;
}

export class ExceptionMessage {
  details: ExceptionMessageDetails;
  fieldName?: string;
  payload?: any;
}

export class AppException {
  url: string;
  message: ExceptionMessage[];
  statusCode?: HttpStatus;
  statusTitle?: string;
}
