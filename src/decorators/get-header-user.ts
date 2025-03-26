import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const AuthUser = createParamDecorator(
  (fieldName: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return fieldName ? request.user[fieldName] : request.user;
  },
);
