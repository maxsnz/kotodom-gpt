/**
 * Tests for environment configuration
 * 
 * Note: These tests need to be run in isolation because they modify process.env
 */

// Mock dotenv to prevent loading .env file
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("env config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear module cache and reset env
    jest.resetModules();
    // Create a fresh copy of env vars
    process.env = {};
    // Copy only non-test related vars
    Object.keys(originalEnv).forEach((key) => {
      if (!key.startsWith("TEST_")) {
        process.env[key] = originalEnv[key];
      }
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should validate required environment variables", () => {
    // Set required vars
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.OPENAI_API_KEY = "test-api-key";
    process.env.COOKIE_SECRET = "test-secret";

    // Re-import to trigger validation
    const { env } = require("./env");

    expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/test");
    expect(env.OPENAI_API_KEY).toBe("test-api-key");
    expect(env.COOKIE_SECRET).toBe("test-secret");
  });

  it("should throw error when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    process.env.OPENAI_API_KEY = "test-api-key";
    process.env.COOKIE_SECRET = "test-secret";

    expect(() => {
      require("./env");
    }).toThrow("Missing required environment variables: DATABASE_URL");
  });

  it("should throw error when OPENAI_API_KEY is missing", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    delete process.env.OPENAI_API_KEY;
    process.env.COOKIE_SECRET = "test-secret";

    expect(() => {
      require("./env");
    }).toThrow("Missing required environment variables: OPENAI_API_KEY");
  });

  it("should throw error when COOKIE_SECRET is missing", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.OPENAI_API_KEY = "test-api-key";
    delete process.env.COOKIE_SECRET;

    expect(() => {
      require("./env");
    }).toThrow("Missing required environment variables: COOKIE_SECRET");
  });

  it("should throw error when multiple required vars are missing", () => {
    delete process.env.DATABASE_URL;
    delete process.env.OPENAI_API_KEY;
    process.env.COOKIE_SECRET = "test-secret";

    expect(() => {
      require("./env");
    }).toThrow(/Missing required environment variables: (DATABASE_URL, OPENAI_API_KEY|OPENAI_API_KEY, DATABASE_URL)/);
  });

  it("should use default value for NODE_ENV when not set", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.OPENAI_API_KEY = "test-api-key";
    process.env.COOKIE_SECRET = "test-secret";
    delete process.env.NODE_ENV;

    const { env } = require("./env");

    expect(env.NODE_ENV).toBe("development");
  });

  it("should use provided NODE_ENV value", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.OPENAI_API_KEY = "test-api-key";
    process.env.COOKIE_SECRET = "test-secret";
    process.env.NODE_ENV = "production";

    const { env } = require("./env");

    expect(env.NODE_ENV).toBe("production");
  });

  it("should return correct config structure", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.OPENAI_API_KEY = "test-api-key";
    process.env.COOKIE_SECRET = "test-secret";
    process.env.SERVER_PORT = "3000";
    process.env.LOGTAIL_TOKEN = "logtail-token";
    process.env.LOGTAIL_SOURCE = "logtail-source";

    const { env } = require("./env");

    expect(env).toHaveProperty("NODE_ENV");
    expect(env).toHaveProperty("DATABASE_URL");
    expect(env).toHaveProperty("SERVER_PORT");
    expect(env).toHaveProperty("OPENAI_API_KEY");
    expect(env).toHaveProperty("COOKIE_SECRET");
    expect(env).toHaveProperty("LOGTAIL_TOKEN");
    expect(env).toHaveProperty("LOGTAIL_SOURCE");
  });

  it("should handle optional SERVER_PORT", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.OPENAI_API_KEY = "test-api-key";
    process.env.COOKIE_SECRET = "test-secret";
    process.env.SERVER_PORT = "8080";

    const { env } = require("./env");

    expect(env.SERVER_PORT).toBe("8080");
  });

  it("should handle optional LOGTAIL_TOKEN", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/test";
    process.env.OPENAI_API_KEY = "test-api-key";
    process.env.COOKIE_SECRET = "test-secret";
    process.env.LOGTAIL_TOKEN = "custom-token";

    const { env } = require("./env");

    expect(env.LOGTAIL_TOKEN).toBe("custom-token");
  });
});

