import { Inject, Injectable, LoggerService } from "@nestjs/common";

import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  LogMetadata,
} from "./logger.types";

@Injectable()
export class NestLoggerService implements LoggerService {
  private readonly logger: AppLogger;

  constructor(
    @Inject(LOGGER_FACTORY) private readonly createLogger: LoggerFactory
  ) {
    this.logger = this.createLogger("Nest");
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(this.formatMessage(message), this.toMeta(optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(this.formatMessage(message), this.toMeta(optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(this.formatMessage(message), this.toMeta(optionalParams));
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.logger.debug(this.formatMessage(message), this.toMeta(optionalParams));
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.logger.debug(this.formatMessage(message), this.toMeta(optionalParams));
  }

  private formatMessage(message: any): string {
    if (typeof message === "string") return message;
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  private toMeta(params: any[]): LogMetadata | undefined {
    if (!params || params.length === 0) return undefined;

    if (params.length === 1 && this.isRecord(params[0])) {
      return params[0];
    }

    return { params };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
}
