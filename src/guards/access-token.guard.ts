import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { METADATA_NO_AUTHORIZE } from 'src/metadata/public.metadata';

@Injectable()
export class AccessTokenGuard extends AuthGuard('at-strategy') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublicApi = this.reflector.getAllAndOverride(
      METADATA_NO_AUTHORIZE,
      [context.getHandler(), context.getClass()],
    );

    return isPublicApi || super.canActivate(context);
  }
}
