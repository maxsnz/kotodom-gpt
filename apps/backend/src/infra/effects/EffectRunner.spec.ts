// Mock pg-boss before importing modules that use it
jest.mock("../jobs/pgBoss", () => ({
  PgBossClient: jest.fn(),
}));

// Mock env
jest.mock("../../config/env", () => ({
  env: {
    BASE_URL: "https://api.example.com",
  },
}));

import { EffectRunner } from "./EffectRunner";
import {
  TelegramClient,
  TelegramClientFactory,
} from "../telegram/telegramClient";
import { PgBossClient } from "../jobs/pgBoss";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";
import { Effect } from "../../domain/effects/Effect";
import { TelegramPollingWorker } from "@/workers/telegram-polling.worker";

describe("EffectRunner", () => {
  let runner: EffectRunner;
  let mockTelegramClientFactory: jest.Mocked<TelegramClientFactory>;
  let mockTelegramClient: jest.Mocked<TelegramClient>;
  let mockPgBossClient: jest.Mocked<PgBossClient>;
  let mockSettingsRepository: jest.Mocked<SettingsRepository>;
  let mockSetWebhook: jest.MockedFunction<any>;
  let mockRemoveWebhook: jest.MockedFunction<any>;
  let mockSendMessage: jest.MockedFunction<any>;
  let mockTelegramPollingWorker: jest.Mocked<TelegramPollingWorker>;

  beforeEach(() => {
    mockSetWebhook = jest.fn();
    mockRemoveWebhook = jest.fn();
    mockSendMessage = jest.fn();

    mockTelegramClient = {
      setWebhook: mockSetWebhook,
      removeWebhook: mockRemoveWebhook,
      sendMessage: mockSendMessage,
      editMessageText: jest.fn(),
      deleteMessage: jest.fn(),
      answerCallbackQuery: jest.fn(),
      raw: {} as any,
    } as any;

    mockTelegramClientFactory = {
      createClient: jest.fn().mockReturnValue(mockTelegramClient),
    } as jest.Mocked<TelegramClientFactory>;

    mockTelegramPollingWorker = {
      refreshBotPolling: jest.fn(),
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<TelegramPollingWorker>;

    mockPgBossClient = {
      publish: jest.fn(),
      register: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    } as any;

    mockSettingsRepository = {
      getSetting: jest.fn(),
      setSetting: jest.fn(),
    } as any;

    runner = new EffectRunner(
      mockTelegramClientFactory,
      mockPgBossClient,
      mockSettingsRepository,
      mockTelegramPollingWorker
    );
  });

  describe("run", () => {
    it("should execute telegram.ensureWebhook effect", async () => {
      const effect: Effect = {
        type: "telegram.ensureWebhook",
        botId: "test-bot-id",
        botToken: "test-bot-token",
      };

      await runner.run(effect);

      expect(mockTelegramClientFactory.createClient).toHaveBeenCalledWith(
        "test-bot-token"
      );
      expect(mockSetWebhook).toHaveBeenCalledWith(
        "https://api.example.com/telegram/webhook/test-bot-id"
      );
    });

    it("should execute telegram.removeWebhook effect", async () => {
      const effect: Effect = {
        type: "telegram.removeWebhook",
        botToken: "test-bot-token",
      };

      await runner.run(effect);

      expect(mockTelegramClientFactory.createClient).toHaveBeenCalledWith(
        "test-bot-token"
      );
      expect(mockRemoveWebhook).toHaveBeenCalled();
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
        botToken: "test-bot-token",
      };

      mockSetWebhook.mockRejectedValue(new Error("Webhook setup failed"));

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
          botToken: "token-1",
        },
        {
          type: "jobs.publish",
          name: "job-1",
          payload: { data: "test1" },
        },
        {
          type: "telegram.ensureWebhook",
          botId: "bot-2",
          botToken: "token-2",
        },
      ];

      mockPgBossClient.publish.mockResolvedValue("job-id");

      await runner.runAll(effects);

      expect(mockTelegramClientFactory.createClient).toHaveBeenCalledWith(
        "token-1"
      );
      expect(mockTelegramClientFactory.createClient).toHaveBeenCalledWith(
        "token-2"
      );
      expect(mockSetWebhook).toHaveBeenCalledTimes(2);
      expect(mockSetWebhook).toHaveBeenNthCalledWith(
        1,
        "https://api.example.com/telegram/webhook/bot-1"
      );
      expect(mockSetWebhook).toHaveBeenNthCalledWith(
        2,
        "https://api.example.com/telegram/webhook/bot-2"
      );
      expect(mockPgBossClient.publish).toHaveBeenCalledTimes(1);
      expect(mockPgBossClient.publish).toHaveBeenCalledWith(
        "job-1",
        { data: "test1" },
        undefined
      );
    });

    it("should stop on first error", async () => {
      mockSetWebhook.mockRejectedValue(new Error("First effect failed"));

      const effects: Effect[] = [
        {
          type: "telegram.ensureWebhook",
          botId: "bot-1",
          botToken: "token-1",
        },
        {
          type: "jobs.publish",
          name: "job-1",
          payload: { data: "test1" },
        },
      ];

      await expect(runner.runAll(effects)).rejects.toThrow(
        "First effect failed"
      );

      expect(mockPgBossClient.publish).not.toHaveBeenCalled();
    });

    it("should handle empty effects array", async () => {
      await runner.runAll([]);

      expect(mockPgBossClient.publish).not.toHaveBeenCalled();
    });
  });

  describe("notification.adminAlert", () => {
    it("should skip notification when settings are not configured", async () => {
      mockSettingsRepository.getSetting.mockResolvedValue(null);

      const effect: Effect = {
        type: "notification.adminAlert",
        message: "Test notification",
      };

      // Should not throw
      await runner.run(effect);

      expect(mockSettingsRepository.getSetting).toHaveBeenCalled();
    });

    it("should send notification when settings are configured", async () => {
      mockSettingsRepository.getSetting.mockImplementation(async (key) => {
        if (key === "admin_notify_bot_token") return "test-bot-token";
        if (key === "admin_notify_chat_id") return "123456";
        return null;
      });

      const effect: Effect = {
        type: "notification.adminAlert",
        message: "Test notification",
      };

      await runner.run(effect);

      expect(mockTelegramClientFactory.createClient).toHaveBeenCalledWith(
        "test-bot-token"
      );
      expect(mockSendMessage).toHaveBeenCalledWith({
        chatId: 123456,
        text: "Test notification",
      });
    });
  });
});
