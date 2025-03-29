import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface UserResponse {
  data: User;
}

@Injectable()
export class RestrictUserDataInterceptor
  implements NestInterceptor<User, UserResponse>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<UserResponse> {
    return next.handle().pipe(
      map((data) => ({
        ...data,
        password: undefined,
        createdDate: undefined,
        updatedDate: undefined,
      })),
    );
  }
}
