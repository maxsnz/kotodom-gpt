// Mock pg-boss before importing modules that use it
jest.mock("pg-boss", () => ({}));

import { registerWorkers } from "./registerWorkers";
import { PgBossClient } from "./index";
import { JOBS, BotHandleUpdatePayload } from "./jobs";

describe("registerWorkers", () => {
  let mockPgBossClient: jest.Mocked<PgBossClient>;
  let mockProcessBotUpdate: jest.Mock;
  let mockLog: {
    info: jest.Mock;
    error: jest.Mock;
  };

  beforeEach(() => {
    mockPgBossClient = {
      register: jest.fn(),
      publish: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    } as any;

    mockProcessBotUpdate = jest.fn();

    mockLog = {
      info: jest.fn(),
      error: jest.fn(),
    };

    jest.clearAllMocks();
  });

  it("should register worker successfully", async () => {
    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
    });

    expect(mockPgBossClient.register).toHaveBeenCalledWith(
      JOBS.BOT_HANDLE_UPDATE,
      expect.any(Function),
      expect.objectContaining({
        teamSize: expect.any(Number),
      })
    );
  });

  it("should call processBotUpdate with correct payload", async () => {
    let handler: any;

    mockPgBossClient.register.mockImplementation(async (name, registeredHandler) => {
      handler = registeredHandler;
    });

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
    });

    const payload: BotHandleUpdatePayload = {
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      userId: 789,
      messageId: 1,
      text: "Test message",
      kind: "message",
      raw: {},
    };

    const job = {
      id: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
    } as any;

    // Call handler with payload and job (as it's called in registerWorkers)
    await handler(payload, job);

    expect(mockProcessBotUpdate).toHaveBeenCalledWith(payload);
  });

  it("should log job start and completion", async () => {
    let handler: any;

    mockPgBossClient.register.mockImplementation(async (name, registeredHandler) => {
      handler = registeredHandler;
    });

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      log: mockLog,
    });

    const payload: BotHandleUpdatePayload = {
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      kind: "message",
      raw: {},
    };

    const job = {
      id: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
    } as any;

    await handler(payload, job);

    expect(mockLog.info).toHaveBeenCalledWith("Job start: BOT_HANDLE_UPDATE", {
      jobId: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      kind: "message",
    });

    expect(mockLog.info).toHaveBeenCalledWith("Job done: BOT_HANDLE_UPDATE", {
      jobId: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      kind: "message",
    });
  });

  it("should log errors correctly", async () => {
    let handler: any;

    mockPgBossClient.register.mockImplementation(async (name, registeredHandler) => {
      handler = registeredHandler;
    });

    const error = new Error("Processing failed");
    mockProcessBotUpdate.mockRejectedValue(error);

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      log: mockLog,
    });

    const payload: BotHandleUpdatePayload = {
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      kind: "message",
      raw: {},
    };

    const job = {
      id: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
    } as any;

    await expect(handler(payload, job)).rejects.toThrow("Processing failed");

    expect(mockLog.error).toHaveBeenCalledWith("Job failed: BOT_HANDLE_UPDATE", {
      jobId: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      kind: "message",
      error: {
        message: "Processing failed",
        stack: expect.any(String),
      },
    });
  });

  it("should re-throw errors for pg-boss retry mechanism", async () => {
    let handler: any;

    mockPgBossClient.register.mockImplementation(async (name, registeredHandler) => {
      handler = registeredHandler;
    });

    const error = new Error("Retryable error");
    mockProcessBotUpdate.mockRejectedValue(error);

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
    });

    const payload: BotHandleUpdatePayload = {
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      kind: "message",
      raw: {},
    };

    const job = {
      id: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
    } as any;

    await expect(handler(payload, job)).rejects.toThrow("Retryable error");
  });

  it("should use default console logger when log not provided", async () => {
    const consoleSpy = jest.spyOn(console, "info").mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    let handler: any;

    mockPgBossClient.register.mockImplementation(async (name, registeredHandler) => {
      handler = registeredHandler;
    });

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
    });

    const payload: BotHandleUpdatePayload = {
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      kind: "message",
      raw: {},
    };

    const job = {
      id: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
    } as any;

    await handler(payload, job);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should use custom teamSize when provided", async () => {
    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      teamSize: 10,
    });

    expect(mockPgBossClient.register).toHaveBeenCalledWith(
      JOBS.BOT_HANDLE_UPDATE,
      expect.any(Function),
      expect.objectContaining({
        teamSize: 10,
      })
    );
  });

  it("should use default teamSize from env when not provided", async () => {
    const originalEnv = process.env.JOBS_CONCURRENCY;
    process.env.JOBS_CONCURRENCY = "7";

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
    });

    expect(mockPgBossClient.register).toHaveBeenCalledWith(
      JOBS.BOT_HANDLE_UPDATE,
      expect.any(Function),
      expect.objectContaining({
        teamSize: 7,
      })
    );

    if (originalEnv) {
      process.env.JOBS_CONCURRENCY = originalEnv;
    } else {
      delete process.env.JOBS_CONCURRENCY;
    }
  });

  it("should handle non-Error objects in error logging", async () => {
    let handler: any;

    mockPgBossClient.register.mockImplementation(async (name, registeredHandler) => {
      handler = registeredHandler;
    });

    const nonError = { code: "CUSTOM_ERROR", message: "Something went wrong" };
    mockProcessBotUpdate.mockRejectedValue(nonError);

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      log: mockLog,
    });

    const payload: BotHandleUpdatePayload = {
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      kind: "message",
      raw: {},
    };

    const job = {
      id: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
    } as any;

    await expect(handler(payload, job)).rejects.toEqual(nonError);

    expect(mockLog.error).toHaveBeenCalledWith("Job failed: BOT_HANDLE_UPDATE", {
      jobId: "job-123",
      name: JOBS.BOT_HANDLE_UPDATE,
      botId: "test-bot-id",
      telegramUpdateId: 123,
      chatId: 456,
      kind: "message",
      error: nonError,
    });
  });
});

