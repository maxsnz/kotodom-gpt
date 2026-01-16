import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
} from "../../infra/logger";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: AppLogger;

  constructor(
    @Inject(LOGGER_FACTORY) private readonly loggerFactory: LoggerFactory
  ) {
    this.logger = loggerFactory(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);
    const errorStack = exception instanceof Error ? exception.stack : undefined;

    // Log the error with full context (skip 404 errors)
    if (status !== HttpStatus.NOT_FOUND) {
      this.logger.error("Unhandled exception", {
        status,
        method: request.method,
        url: request.url,
        error: {
          message: errorMessage,
          stack: errorStack,
          ...(exception instanceof HttpException
            ? { response: exception.getResponse() }
            : {}),
        },
      });
    }

    // Send error response (maintains existing error handling behavior)
    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode: status,
            message: "Internal server error",
            error: "Internal Server Error",
          };

    response.status(status).send(errorResponse);
  }
}
