import pino from "pino";

import { env } from "../../config/env";
import packageJson from "../../../../../package.json";
import { AppLogger, LoggerFactory } from "./logger.types";

const isProd = env.NODE_ENV === "production";

// Prod: default JSON-to-stdout transport. Docker captures stdout into
// the container json-file log, Vector tails it and forwards to the
// per-app Better Stack source (see deploy/playbook.yml → vector_source).
// Dev: pino-pretty for readable colourised output.
function createRootPino(): pino.Logger {
  const base = {
    app: packageJson.name,
    version: packageJson.version,
    env: env.NODE_ENV,
  };

  if (isProd) {
    return pino({ level: "info", base });
  }

  return pino({
    level: "debug",
    base,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  });
}

export function createPinoLoggerFactory(): LoggerFactory {
  const root = createRootPino();

  const toAppLogger = (logger: pino.Logger): AppLogger => ({
    info: (message: string, meta?: Record<string, unknown>) =>
      meta ? logger.info(meta, message) : logger.info(message),
    error: (message: string, meta?: Record<string, unknown>) =>
      meta ? logger.error(meta, message) : logger.error(message),
    warn: (message: string, meta?: Record<string, unknown>) =>
      meta ? logger.warn(meta, message) : logger.warn(message),
    debug: (message: string, meta?: Record<string, unknown>) =>
      meta ? logger.debug(meta, message) : logger.debug(message),
  });

  return (context?: string) => {
    const child = context ? root.child({ context }) : root;
    return toAppLogger(child);
  };
}
