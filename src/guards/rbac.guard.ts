import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { METADATA_RBAC } from 'src/metadata/rbac.metadata';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>(
      METADATA_RBAC,
      context.getHandler(),
    );

    if (!roles) {
      return true; // If no roles are specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return roles.some((role) => user.role === role);
  }
}
