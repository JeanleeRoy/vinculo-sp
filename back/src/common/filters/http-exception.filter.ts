import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log the full technical stack/cause internally for observability
    if (status >= 500) {
      this.logger.error(
        `Unhandled error on [${request.method}] ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `Client error ${status} on [${request.method}] ${request.url}`,
      );
    }

    // OWASP A05 (Security Misconfiguration) Mitigation:
    // Never expose raw SQL queries, driver stack traces, or internal error messages to client.
    let responseBody: Record<string, any>;

    if (isHttpException) {
      const res = exception.getResponse();
      responseBody =
        typeof res === 'object' && res !== null
          ? (res as Record<string, any>)
          : { statusCode: status, message: res };
    } else {
      responseBody = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected internal server error occurred.',
      };
    }

    response.status(status).json({
      ...responseBody,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
