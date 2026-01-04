// Mock pg-boss before importing modules that use it
jest.mock("../jobs/pgBoss", () => ({
  PgBossClient: jest.fn(),
}));

import { EffectRunner } from "./EffectRunner";
import { TelegramClient } from "../telegram/telegramClient";
import { PgBossClient } from "../jobs/pgBoss";
import { Effect } from "../../domain/effects/Effect";

describe("EffectRunner", () => {
  let runner: EffectRunner;
  let mockTelegramClient: jest.Mocked<TelegramClient>;
  let mockPgBossClient: jest.Mocked<PgBossClient>;

  beforeEach(() => {
    mockTelegramClient = {
      ensureWebhook: jest.fn(),
      sendMessage: jest.fn(),
      editMessageText: jest.fn(),
      deleteMessage: jest.fn(),
      answerCallbackQuery: jest.fn(),
      raw: {} as any,
    } as any;

    mockPgBossClient = {
      publish: jest.fn(),
      register: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    } as any;

    runner = new EffectRunner(mockTelegramClient, mockPgBossClient);
  });

  describe("run", () => {
    it("should execute telegram.ensureWebhook effect", async () => {
      const effect: Effect = {
        type: "telegram.ensureWebhook",
        botId: "test-bot-id",
      };

      mockTelegramClient.ensureWebhook.mockResolvedValue(undefined);

      await runner.run(effect);

      expect(mockTelegramClient.ensureWebhook).toHaveBeenCalledWith("test-bot-id");
    });

    it("should execute jobs.publish effect", async () => {
      const effect: Effect = {
        type: "jobs.publish",
        name: "test-job",
        payload: { data: "test" },
        options: {
          retryLimit: 3,
          singletonKey: "unique-key",
        },
      };

      mockPgBossClient.publish.mockResolvedValue("job-id");

      await runner.run(effect);

      expect(mockPgBossClient.publish).toHaveBeenCalledWith(
        "test-job",
        { data: "test" },
        {
          retryLimit: 3,
          singletonKey: "unique-key",
        }
      );
    });

    it("should execute jobs.publish effect without options", async () => {
      const effect: Effect = {
        type: "jobs.publish",
        name: "test-job",
        payload: { data: "test" },
      };

      mockPgBossClient.publish.mockResolvedValue("job-id");

      await runner.run(effect);

      expect(mockPgBossClient.publish).toHaveBeenCalledWith(
        "test-job",
        { data: "test" },
        undefined
      );
    });

    it("should throw error for unknown effect type", async () => {
      const effect = {
        type: "unknown.effect",
      } as any;

      await expect(runner.run(effect)).rejects.toThrow("Unknown effect type");
    });

    it("should handle errors during telegram.ensureWebhook", async () => {
      const effect: Effect = {
        type: "telegram.ensureWebhook",
        botId: "test-bot-id",
      };

      mockTelegramClient.ensureWebhook.mockRejectedValue(
        new Error("Webhook setup failed")
      );

      await expect(runner.run(effect)).rejects.toThrow("Webhook setup failed");
    });

    it("should handle errors during jobs.publish", async () => {
      const effect: Effect = {
        type: "jobs.publish",
        name: "test-job",
        payload: { data: "test" },
      };

      mockPgBossClient.publish.mockRejectedValue(new Error("Publish failed"));

      await expect(runner.run(effect)).rejects.toThrow("Publish failed");
    });
  });

  describe("runAll", () => {
    it("should execute multiple effects sequentially", async () => {
      const effects: Effect[] = [
        {
          type: "telegram.ensureWebhook",
          botId: "bot-1",
        },
        {
          type: "jobs.publish",
          name: "job-1",
          payload: { data: "test1" },
        },
        {
          type: "telegram.ensureWebhook",
          botId: "bot-2",
        },
      ];

      mockTelegramClient.ensureWebhook.mockResolvedValue(undefined);
      mockPgBossClient.publish.mockResolvedValue("job-id");

      await runner.runAll(effects);

      expect(mockTelegramClient.ensureWebhook).toHaveBeenCalledTimes(2);
      expect(mockTelegramClient.ensureWebhook).toHaveBeenNthCalledWith(1, "bot-1");
      expect(mockTelegramClient.ensureWebhook).toHaveBeenNthCalledWith(2, "bot-2");
      expect(mockPgBossClient.publish).toHaveBeenCalledTimes(1);
      expect(mockPgBossClient.publish).toHaveBeenCalledWith(
        "job-1",
        { data: "test1" },
        undefined
      );
    });

    it("should stop on first error", async () => {
      const effects: Effect[] = [
        {
          type: "telegram.ensureWebhook",
          botId: "bot-1",
        },
        {
          type: "jobs.publish",
          name: "job-1",
          payload: { data: "test1" },
        },
      ];

      mockTelegramClient.ensureWebhook.mockRejectedValue(
        new Error("First effect failed")
      );

      await expect(runner.runAll(effects)).rejects.toThrow("First effect failed");

      expect(mockTelegramClient.ensureWebhook).toHaveBeenCalledTimes(1);
      expect(mockPgBossClient.publish).not.toHaveBeenCalled();
    });

    it("should handle empty effects array", async () => {
      await runner.runAll([]);

      expect(mockTelegramClient.ensureWebhook).not.toHaveBeenCalled();
      expect(mockPgBossClient.publish).not.toHaveBeenCalled();
    });
  });
});

