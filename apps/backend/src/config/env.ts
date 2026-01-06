import * as dotenv from "dotenv";

dotenv.config();

interface EnvironmentConfig {
  NODE_ENV: string;
  DATABASE_URL: string;
  SERVER_PORT: string;
  BASE_URL: string;
  OPENAI_API_KEY: string;
  COOKIE_SECRET: string;
  LOGTAIL_TOKEN: string;
  LOGTAIL_SOURCE: string;
  REDIS_URL: string | undefined;
}

function validateEnv(): EnvironmentConfig {
  const requiredVars = [
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "COOKIE_SECRET",
    "BASE_URL",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  const config: EnvironmentConfig = {
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    COOKIE_SECRET: process.env.COOKIE_SECRET!,
    SERVER_PORT: process.env.SERVER_PORT || "3000",
    BASE_URL: process.env.BASE_URL!,
    LOGTAIL_TOKEN: process.env.LOGTAIL_TOKEN!,
    LOGTAIL_SOURCE: process.env.LOGTAIL_SOURCE!,
    REDIS_URL: process.env.REDIS_URL || undefined,
  };

  return config;
}

export const env = validateEnv();
export default env;
