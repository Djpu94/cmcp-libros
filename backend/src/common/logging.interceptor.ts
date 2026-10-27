import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { finalize, Observable } from 'rxjs';
import type { AuthenticatedUser } from './current-user.decorator.js';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly mutationMethods = new Set(['POST', 'PATCH', 'DELETE']);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = request.method.toUpperCase();

    if (!this.mutationMethods.has(method)) {
      return next.handle();
    }

    const startedAt = Date.now();
    const route = request.route?.path ?? request.path;
    const entity = route.split('/').filter(Boolean)[0] ?? 'unknown';
    const entityId =
      request.params?.id ?? request.params?.bookId ?? null;
    const userId =
      request.user?.id ?? request.user?.userId ?? request.user?.sub ?? null;

    return next.handle().pipe(
      finalize(() => {
        this.logger.log(
          JSON.stringify({
            action: method,
            entity,
            entityId,
            userId,
            durationMs: Date.now() - startedAt,
          }),
        );
      }),
    );
  }
}
