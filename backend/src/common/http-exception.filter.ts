import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import type { AuthenticatedUser } from './current-user.decorator.js';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<AuthenticatedRequest>();
    const response = context.getResponse<Response>();
    const result = this.getErrorResponse(exception);
    const userId =
      request.user?.id ?? request.user?.userId ?? request.user?.sub ?? null;
    const log: Record<string, unknown> = {
      method: request.method,
      path: request.path,
      userId,
      statusCode: result.statusCode,
      message: exception instanceof Error ? exception.message : String(exception),
    };

    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      log.stack = exception.stack;
    }

    this.logger.error(JSON.stringify(log));
    response.status(result.statusCode).json({
      ...result,
      timestamp: new Date().toISOString(),
      path: request.path,
    });
  }

  private getErrorResponse(exception: unknown): Omit<ErrorResponse, 'timestamp' | 'path'> {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const response =
        typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? exceptionResponse
          : undefined;
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : response && 'message' in response
            ? this.getMessage(response.message, exception.message)
            : exception.message;
      const error =
        response && 'error' in response && typeof response.error === 'string'
          ? response.error
          : this.getStatusName(statusCode);

      return { statusCode, message, error };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with the provided values already exists',
          error: 'Conflict',
        };
      }

      if (exception.code === 'P2025') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'Not Found',
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private getMessage(value: unknown, fallback: string): string | string[] {
    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      return value;
    }

    return fallback;
  }

  private getStatusName(statusCode: number): string {
    const statusName = HttpStatus[statusCode];
    return statusName
      ? statusName
          .split('_')
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' ')
      : 'Error';
  }
}
