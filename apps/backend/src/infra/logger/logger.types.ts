import { InjectionToken } from "@nestjs/common";

export type LogMetadata = Record<string, unknown>;

export interface AppLogger {
  info(message: string, meta?: LogMetadata): void;
  error(message: string, meta?: LogMetadata): void;
  warn(message: string, meta?: LogMetadata): void;
  debug(message: string, meta?: LogMetadata): void;
}

export type LoggerFactory = (context?: string) => AppLogger;

export const LOGGER_FACTORY: InjectionToken = Symbol("LOGGER_FACTORY");

export function createConsoleLoggerFactory(): LoggerFactory {
  return (context?: string) => {
    const prefix = context ? `[${context}]` : "";
    return {
      info: (message, meta) =>
        meta ? console.info(prefix, message, meta) : console.info(prefix, message),
      error: (message, meta) =>
        meta ? console.error(prefix, message, meta) : console.error(prefix, message),
      warn: (message, meta) =>
        meta ? console.warn(prefix, message, meta) : console.warn(prefix, message),
      debug: (message, meta) =>
        meta ? console.debug(prefix, message, meta) : console.debug(prefix, message),
    };
  };
}

