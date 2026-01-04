// Mock pg-boss before importing modules that use it
jest.mock("../../infra/jobs/pgBoss", () => ({
  PgBossClient: jest.fn(),
  JOBS: {
    BOT_HANDLE_UPDATE: "bot.handle-update",
  },
}));

import { TelegramUpdateHandler } from "./telegram-update.handler";
import { BotRepository } from "../../domain/bots/BotRepository";
import { PgBossClient } from "../../infra/jobs/pgBoss";
import { Bot } from "../../domain/bots/Bot";
import { JOBS } from "../../infra/jobs/pgBoss/jobs";

describe("TelegramUpdateHandler", () => {
  let handler: TelegramUpdateHandler;
  let mockBotRepository: jest.Mocked<BotRepository>;
  let mockPgBossClient: jest.Mocked<PgBossClient>;

  beforeEach(() => {
    mockBotRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findPollingBots: jest.fn(),
    } as any;

    mockPgBossClient = {
      publish: jest.fn(),
      register: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    } as any;

    handler = new TelegramUpdateHandler(mockBotRepository, mockPgBossClient);
  });

  describe("handle", () => {
    const enabledBot = new Bot({
      id: "1",
      enabled: true,
      telegramMode: "webhook",
      token: "test-token",
    });

    it("should parse and publish message update", async () => {
      const update = {
        update_id: 123,
        message: {
          message_id: 1,
          date: 1234567890,
          chat: { id: 12345, type: "private" },
          from: { id: 67890 },
          text: "Hello",
        },
      };

      mockBotRepository.findById.mockResolvedValue(enabledBot);
      mockPgBossClient.publish.mockResolvedValue("job-id");

      await handler.handle("1", update);

      expect(mockBotRepository.findById).toHaveBeenCalledWith("1");
      expect(mockPgBossClient.publish).toHaveBeenCalledWith(
        JOBS.BOT_HANDLE_UPDATE,
        {
          botId: "1",
          telegramUpdateId: 123,
          chatId: 12345,
          userId: 67890,
          messageId: 1,
          text: "Hello",
          kind: "message",
          raw: update,
        },
        expect.any(Object)
      );
    });

    it("should parse and publish edited_message update", async () => {
      const update = {
        update_id: 124,
        edited_message: {
          message_id: 2,
          date: 1234567891,
          chat: { id: 12345, type: "private" },
          from: { id: 67890 },
          text: "Edited text",
        },
      };

      mockBotRepository.findById.mockResolvedValue(enabledBot);
      mockPgBossClient.publish.mockResolvedValue("job-id");

      await handler.handle("1", update);

      expect(mockPgBossClient.publish).toHaveBeenCalledWith(
        JOBS.BOT_HANDLE_UPDATE,
        {
          botId: "1",
          telegramUpdateId: 124,
          chatId: 12345,
          userId: 67890,
          messageId: 2,
          text: "Edited text",
          kind: "edited_message",
          raw: update,
        },
        expect.any(Object)
      );
    });

    it("should parse and publish callback_query update", async () => {
      const update = {
        update_id: 125,
        callback_query: {
          id: "callback-id",
          from: { id: 67890 },
          message: {
            message_id: 3,
            date: 1234567892,
            chat: { id: 12345, type: "private" },
          },
          data: "button_data",
        },
      };

      mockBotRepository.findById.mockResolvedValue(enabledBot);
      mockPgBossClient.publish.mockResolvedValue("job-id");

      await handler.handle("1", update);

      expect(mockPgBossClient.publish).toHaveBeenCalledWith(
        JOBS.BOT_HANDLE_UPDATE,
        {
          botId: "1",
          telegramUpdateId: 125,
          chatId: 12345,
          userId: 67890,
          messageId: 3,
          callbackData: "button_data",
          kind: "callback_query",
          raw: update,
        },
        expect.any(Object)
      );
    });

    it("should handle callback_query without message", async () => {
      const update = {
        update_id: 126,
        callback_query: {
          id: "callback-id",
          from: { id: 67890 },
          data: "button_data",
        },
      };

      mockBotRepository.findById.mockResolvedValue(enabledBot);
      mockPgBossClient.publish.mockResolvedValue("job-id");

      await handler.handle("1", update);

      expect(mockPgBossClient.publish).toHaveBeenCalledWith(
        JOBS.BOT_HANDLE_UPDATE,
        expect.objectContaining({
          botId: "1",
          telegramUpdateId: 126,
          chatId: 0,
          userId: 67890,
          callbackData: "button_data",
          kind: "callback_query",
        }),
        expect.any(Object)
      );
    });

    it("should skip processing when bot not found", async () => {
      const update = {
        update_id: 123,
        message: {
          message_id: 1,
          date: 1234567890,
          chat: { id: 12345, type: "private" },
        },
      };

      mockBotRepository.findById.mockResolvedValue(null);

      await handler.handle("1", update);

      expect(mockPgBossClient.publish).not.toHaveBeenCalled();
    });

    it("should skip processing when bot is disabled", async () => {
      const disabledBot = new Bot({
        id: "1",
        enabled: false,
        telegramMode: "webhook",
        token: "test-token",
      });

      const update = {
        update_id: 123,
        message: {
          message_id: 1,
          date: 1234567890,
          chat: { id: 12345, type: "private" },
        },
      };

      mockBotRepository.findById.mockResolvedValue(disabledBot);

      await handler.handle("1", update);

      expect(mockPgBossClient.publish).not.toHaveBeenCalled();
    });

    it("should skip processing when update type is unknown", async () => {
      const update = {
        update_id: 123,
        // No message, edited_message, or callback_query
      };

      mockBotRepository.findById.mockResolvedValue(enabledBot);

      await handler.handle("1", update);

      expect(mockPgBossClient.publish).not.toHaveBeenCalled();
    });

    it("should skip processing when update is not an object", async () => {
      mockBotRepository.findById.mockResolvedValue(enabledBot);

      await handler.handle("1", null);
      await handler.handle("1", "string");
      await handler.handle("1", 123);

      expect(mockPgBossClient.publish).not.toHaveBeenCalled();
    });

    it("should skip processing when update_id is missing", async () => {
      const update = {
        message: {
          message_id: 1,
          date: 1234567890,
          chat: { id: 12345, type: "private" },
        },
      };

      mockBotRepository.findById.mockResolvedValue(enabledBot);

      await handler.handle("1", update);

      expect(mockPgBossClient.publish).not.toHaveBeenCalled();
    });

    it("should handle errors during job publishing", async () => {
      const update = {
        update_id: 123,
        message: {
          message_id: 1,
          date: 1234567890,
          chat: { id: 12345, type: "private" },
        },
      };

      mockBotRepository.findById.mockResolvedValue(enabledBot);
      mockPgBossClient.publish.mockRejectedValue(new Error("Publish failed"));

      await expect(handler.handle("1", update)).rejects.toThrow("Publish failed");
    });

    it("should handle message without from field", async () => {
      const update = {
        update_id: 123,
        message: {
          message_id: 1,
          date: 1234567890,
          chat: { id: 12345, type: "private" },
          text: "Message without user",
        },
      };

      mockBotRepository.findById.mockResolvedValue(enabledBot);
      mockPgBossClient.publish.mockResolvedValue("job-id");

      await handler.handle("1", update);

      expect(mockPgBossClient.publish).toHaveBeenCalledWith(
        JOBS.BOT_HANDLE_UPDATE,
        expect.objectContaining({
          userId: undefined,
          text: "Message without user",
        }),
        expect.any(Object)
      );
    });
  });
});

