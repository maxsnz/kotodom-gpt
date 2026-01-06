import pino from "pino";

import { env } from "../../config/env";
import packageJson from "../../../../../package.json";
import { AppLogger, LoggerFactory } from "./logger.types";

const isProd = env.NODE_ENV === "production";

function buildTransport(): pino.TransportMultiOptions {
  const targets: pino.TransportTargetOptions[] = [];

  if (env.LOGTAIL_TOKEN) {
    targets.push({
      target: "@logtail/pino",
      options: {
        sourceToken: env.LOGTAIL_TOKEN,
        options: {
          endpoint: env.LOGTAIL_SOURCE,
        },
      },
      level: "info",
    });
  }

  targets.push({
    target: "pino-pretty",
    level: isProd ? "error" : "debug",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname",
    },
  });

  return {
    targets,
    options: {
      level: isProd ? "info" : "debug",
      base: {
        app: packageJson.name,
        version: packageJson.version,
        env: env.NODE_ENV,
      },
    },
  };
}

function createRootPino() {
  return pino({
    transport: buildTransport(),
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
