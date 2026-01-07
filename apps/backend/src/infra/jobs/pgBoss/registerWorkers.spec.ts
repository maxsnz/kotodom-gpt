// Mock pg-boss before importing modules that use it
jest.mock("pg-boss", () => ({}));

import { registerWorkers } from "./registerWorkers";
import { PgBossClient } from "./index";
import { JOBS, BotHandleUpdatePayload } from "./jobs";

describe("registerWorkers", () => {
  let mockPgBossClient: jest.Mocked<PgBossClient>;
  let mockProcessBotUpdate: jest.Mock;
  let mockProcessMessageTrigger: jest.Mock;
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
    mockProcessMessageTrigger = jest.fn();

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
      processMessageTrigger: mockProcessMessageTrigger,
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
    let registeredHandler: any;

    mockPgBossClient.register.mockImplementation(async (name, handler) => {
      if (name === JOBS.BOT_HANDLE_UPDATE) {
        registeredHandler = handler;
      }
    });

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      processMessageTrigger: mockProcessMessageTrigger,
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
      data: payload,
    } as any;

    // Call registered handler directly with (payload, job) as it's called in registerWorkers
    await registeredHandler(payload, job);

    expect(mockProcessBotUpdate).toHaveBeenCalledWith(payload);
  });

  it("should log job start and completion", async () => {
    let registeredHandler: any;

    mockPgBossClient.register.mockImplementation(async (name, handler) => {
      if (name === JOBS.BOT_HANDLE_UPDATE) {
        registeredHandler = handler;
      }
    });

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      processMessageTrigger: mockProcessMessageTrigger,
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
      data: payload,
    } as any;

    await registeredHandler(payload, job);

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
    let registeredHandler: any;

    mockPgBossClient.register.mockImplementation(async (name, handler) => {
      if (name === JOBS.BOT_HANDLE_UPDATE) {
        registeredHandler = handler;
      }
    });

    const error = new Error("Processing failed");
    mockProcessBotUpdate.mockRejectedValue(error);

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      processMessageTrigger: mockProcessMessageTrigger,
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
      data: payload,
      retryCount: 0,
    } as any;

    await expect(registeredHandler(payload, job)).rejects.toThrow(
      "Processing failed"
    );

    expect(mockLog.error).toHaveBeenCalledWith(
      "Job failed: BOT_HANDLE_UPDATE",
      {
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
        retryCount: 0,
        isLastRetry: false,
      }
    );
  });

  it("should re-throw errors for pg-boss retry mechanism", async () => {
    let registeredHandler: any;

    mockPgBossClient.register.mockImplementation(async (name, handler) => {
      if (name === JOBS.BOT_HANDLE_UPDATE) {
        registeredHandler = handler;
      }
    });

    const error = new Error("Retryable error");
    mockProcessBotUpdate.mockRejectedValue(error);

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      processMessageTrigger: mockProcessMessageTrigger,
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
      data: payload,
    } as any;

    await expect(registeredHandler(payload, job)).rejects.toThrow(
      "Retryable error"
    );
  });

  it("should use default console logger when log not provided", async () => {
    const consoleSpy = jest.spyOn(console, "info").mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    let registeredHandler: any;

    mockPgBossClient.register.mockImplementation(async (name, handler) => {
      if (name === JOBS.BOT_HANDLE_UPDATE) {
        registeredHandler = handler;
      }
    });

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      processMessageTrigger: mockProcessMessageTrigger,
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
      data: payload,
    } as any;

    await registeredHandler(payload, job);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should use custom teamSize when provided", async () => {
    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      processMessageTrigger: mockProcessMessageTrigger,
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

  it("should handle non-Error objects in error logging", async () => {
    let registeredHandler: any;

    mockPgBossClient.register.mockImplementation(async (name, handler) => {
      if (name === JOBS.BOT_HANDLE_UPDATE) {
        registeredHandler = handler;
      }
    });

    const nonError = { code: "CUSTOM_ERROR", message: "Something went wrong" };
    mockProcessBotUpdate.mockRejectedValue(nonError);

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      processMessageTrigger: mockProcessMessageTrigger,
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
      data: payload,
      retryCount: 0,
    } as any;

    await expect(registeredHandler(payload, job)).rejects.toEqual(nonError);

    expect(mockLog.error).toHaveBeenCalledWith(
      "Job failed: BOT_HANDLE_UPDATE",
      {
        jobId: "job-123",
        name: JOBS.BOT_HANDLE_UPDATE,
        botId: "test-bot-id",
        telegramUpdateId: 123,
        chatId: 456,
        kind: "message",
        error: nonError,
        retryCount: 0,
        isLastRetry: false,
      }
    );
  });

  it("should call onJobFailed on last retry", async () => {
    let registeredHandler: any;
    const mockOnJobFailed = jest.fn();

    mockPgBossClient.register.mockImplementation(async (name, handler) => {
      if (name === JOBS.BOT_HANDLE_UPDATE) {
        registeredHandler = handler;
      }
    });

    const error = new Error("Retryable error");
    mockProcessBotUpdate.mockRejectedValue(error);

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      processMessageTrigger: mockProcessMessageTrigger,
      log: mockLog,
      onJobFailed: mockOnJobFailed,
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
      data: payload,
      retryCount: 4, // 0-indexed, so 4 is the 5th attempt (last retry)
    } as any;

    await expect(registeredHandler(payload, job)).rejects.toThrow(
      "Retryable error"
    );

    expect(mockOnJobFailed).toHaveBeenCalledWith(
      expect.stringContaining("Job job-123 failed after 5 retries"),
      "retries-exhausted:test-bot-id:123"
    );
  });

  it("should not call onJobFailed before last retry", async () => {
    let registeredHandler: any;
    const mockOnJobFailed = jest.fn();

    mockPgBossClient.register.mockImplementation(async (name, handler) => {
      if (name === JOBS.BOT_HANDLE_UPDATE) {
        registeredHandler = handler;
      }
    });

    const error = new Error("Retryable error");
    mockProcessBotUpdate.mockRejectedValue(error);

    await registerWorkers({
      boss: mockPgBossClient,
      processBotUpdate: mockProcessBotUpdate,
      processMessageTrigger: mockProcessMessageTrigger,
      log: mockLog,
      onJobFailed: mockOnJobFailed,
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
      data: payload,
      retryCount: 2, // Not the last retry
    } as any;

    await expect(registeredHandler(payload, job)).rejects.toThrow(
      "Retryable error"
    );

    expect(mockOnJobFailed).not.toHaveBeenCalled();
  });
});
