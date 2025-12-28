import pino, { Logger } from "pino";
import env from "../config/env";
import packageJson from "../../package.json";

const isProd = env.NODE_ENV === "production";

const targets = [];

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

export const logger: Logger = pino(
  {
    level: isProd ? "info" : "debug",
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      app: packageJson.name,
      version: packageJson.version,
      env: env.NODE_ENV,
    },
  },
  pino.transport({
    targets,
  })
);
