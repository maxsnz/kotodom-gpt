// Mock pg-boss before importing modules that use it
jest.mock("../../infra/jobs/pgBoss", () => ({
  PgBossClient: jest.fn(),
}));

import * as runtime from "@prisma/client/runtime/client";

import { ChatsService, TelegramClientFactory } from "./ChatsService";
import { ChatRepository } from "./ChatRepository";
import { MessageRepository } from "./MessageRepository";
import { BotRepository } from "../bots/BotRepository";
import { Chat } from "./Chat";
import { Message } from "./Message";
import { Bot } from "../bots/Bot";
import { TelegramClient } from "../../infra/telegram/telegramClient";

const { Decimal } = runtime;

describe("ChatsService", () => {
  let service: ChatsService;
  let mockChatRepo: jest.Mocked<ChatRepository>;
  let mockMessageRepo: jest.Mocked<MessageRepository>;
  let mockBotRepo: jest.Mocked<BotRepository>;
  let mockTelegramClient: jest.Mocked<TelegramClient>;
  let mockTelegramClientFactory: jest.MockedFunction<TelegramClientFactory>;

  const createMockChat = (
    overrides: Partial<ConstructorParameters<typeof Chat>[0]> = {}
  ): Chat => {
    return new Chat({
      id: "chat-123",
      telegramChatId: BigInt(12345678),
      botId: 1,
      tgUserId: BigInt(123456789),
      threadId: null,
      name: "Test Chat",
      createdAt: new Date("2024-01-01"),
      ...overrides,
    });
  };

  const createMockBot = (
    overrides: Partial<ConstructorParameters<typeof Bot>[0]> = {}
  ): Bot => {
    return new Bot({
      id: "1",
      name: "Test Bot",
      startMessage: "Hello",
      errorMessage: "Error",
      model: "gpt-4o-mini",
      assistantId: "asst_123",
      token: "bot-token-123",
      enabled: true,
      telegramMode: "webhook",
      error: null,
      ownerUserId: null,
      ...overrides,
    });
  };

  const createMockMessage = (
    overrides: Partial<ConstructorParameters<typeof Message>[0]> = {}
  ): Message => {
    return new Message({
      id: 1,
      chatId: "chat-123",
      tgUserId: null,
      botId: 1,
      text: "Hello from admin",
      telegramUpdateId: null,
      userMessageId: null,
      createdAt: new Date("2024-01-01"),
      ...overrides,
    });
  };

  beforeEach(() => {
    mockChatRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      findByBotId: jest.fn(),
      save: jest.fn(),
      findOrCreateChat: jest.fn(),
      findOrCreateUser: jest.fn(),
    } as any;

    mockMessageRepo = {
      findByTelegramUpdate: jest.fn(),
      findUserMessageByTelegramUpdate: jest.fn(),
      findBotResponseForUserMessage: jest.fn(),
      findByChatId: jest.fn(),
      save: jest.fn(),
      createUserMessage: jest.fn(),
      createBotMessage: jest.fn(),
      createAdminMessage: jest.fn(),
    } as any;

    mockBotRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findPollingBots: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockTelegramClient = {
      sendMessage: jest.fn(),
    } as any;

    mockTelegramClientFactory = jest.fn().mockReturnValue(mockTelegramClient);

    service = new ChatsService(
      mockChatRepo,
      mockMessageRepo,
      mockBotRepo,
      mockTelegramClientFactory
    );
  });

  describe("findAll", () => {
    it("should return all chats without filters", async () => {
      const chats = [createMockChat(), createMockChat({ id: "chat-456" })];
      mockChatRepo.findAll.mockResolvedValue(chats);

      const result = await service.findAll();

      expect(result).toEqual(chats);
      expect(mockChatRepo.findAll).toHaveBeenCalledWith(undefined);
    });

    it("should return chats with filters", async () => {
      const chats = [createMockChat()];
      mockChatRepo.findAll.mockResolvedValue(chats);

      const filters = { userId: BigInt(123456789), botId: 1 };
      const result = await service.findAll(filters);

      expect(result).toEqual(chats);
      expect(mockChatRepo.findAll).toHaveBeenCalledWith(filters);
    });

    it("should find all chats", async () => {
      const chats = [createMockChat()];
      mockChatRepo.findAll.mockResolvedValue(chats);

      const result = await service.findAll({});

      expect(result).toEqual(chats);
      expect(mockChatRepo.findAll).toHaveBeenCalledWith({});
    });

    it("should find all chats", async () => {
      const chats = [createMockChat()];
      mockChatRepo.findAll.mockResolvedValue(chats);

      const result = await service.findAll({});

      expect(result).toEqual(chats);
      expect(mockChatRepo.findAll).toHaveBeenCalledWith({});
    });

    it("should find all chats", async () => {
      const chats = [createMockChat()];
      mockChatRepo.findAll.mockResolvedValue(chats);

      const result = await service.findAll({});

      expect(result).toEqual(chats);
      expect(mockChatRepo.findAll).toHaveBeenCalledWith({});
    });
  });

  describe("findById", () => {
    it("should return chat when found", async () => {
      const chat = createMockChat();
      mockChatRepo.findById.mockResolvedValue(chat);

      const result = await service.findById("chat-123");

      expect(result).toEqual(chat);
      expect(mockChatRepo.findById).toHaveBeenCalledWith("chat-123");
    });

    it("should return null when chat not found", async () => {
      mockChatRepo.findById.mockResolvedValue(null);

      const result = await service.findById("non-existent");

      expect(result).toBeNull();
    });

    it("should throw error when id is empty", async () => {
      await expect(service.findById("")).rejects.toThrow(
        "ChatsService.findById: id is required"
      );
    });
  });

  describe("getOrThrow", () => {
    it("should return chat when found", async () => {
      const chat = createMockChat();
      mockChatRepo.findById.mockResolvedValue(chat);

      const result = await service.getOrThrow("chat-123");

      expect(result).toEqual(chat);
    });

    it("should throw error when chat not found", async () => {
      mockChatRepo.findById.mockResolvedValue(null);

      await expect(service.getOrThrow("non-existent")).rejects.toThrow(
        "Chat not found: non-existent"
      );
    });
  });

  describe("getMessages", () => {
    it("should return messages for chat", async () => {
      const chat = createMockChat();
      const messages = [
        createMockMessage({ id: 1, text: "Hello" }),
        createMockMessage({ id: 2, text: "World" }),
      ];
      mockChatRepo.findById.mockResolvedValue(chat);
      mockMessageRepo.findByChatId.mockResolvedValue(messages);

      const result = await service.getMessages("chat-123");

      expect(result).toEqual(messages);
      expect(mockMessageRepo.findByChatId).toHaveBeenCalledWith("chat-123");
    });

    it("should throw error when chat not found", async () => {
      mockChatRepo.findById.mockResolvedValue(null);

      await expect(service.getMessages("non-existent")).rejects.toThrow(
        "Chat not found: non-existent"
      );
    });
  });

  describe("sendAdminMessage", () => {
    it("should send message and create admin message record", async () => {
      const chat = createMockChat();
      const bot = createMockBot();
      const message = createMockMessage();

      mockChatRepo.findById.mockResolvedValue(chat);
      mockBotRepo.findById.mockResolvedValue(bot);
      mockTelegramClient.sendMessage.mockResolvedValue({ messageId: 999 });
      mockMessageRepo.createAdminMessage.mockResolvedValue(message);
      mockMessageRepo.save.mockResolvedValue(undefined);

      const result = await service.sendAdminMessage(
        "chat-123",
        "Hello from admin"
      );

      expect(result.telegramMessageId).toBe(999);
      expect(mockTelegramClientFactory).toHaveBeenCalledWith(bot.token);
      expect(mockTelegramClient.sendMessage).toHaveBeenCalledWith({
        chatId: chat.telegramChatId.toString(),
        text: "Hello from admin",
      });
      expect(mockMessageRepo.createAdminMessage).toHaveBeenCalledWith({
        chatId: chat.id,
        botId: chat.botId,
        text: "Hello from admin",
      });
    });

    it("should throw error when text is empty", async () => {
      await expect(service.sendAdminMessage("chat-123", "")).rejects.toThrow(
        "ChatsService.sendAdminMessage: text is required"
      );
    });

    it("should throw error when text is whitespace only", async () => {
      await expect(service.sendAdminMessage("chat-123", "   ")).rejects.toThrow(
        "ChatsService.sendAdminMessage: text is required"
      );
    });

    it("should throw error when chat not found", async () => {
      mockChatRepo.findById.mockResolvedValue(null);

      await expect(
        service.sendAdminMessage("non-existent", "Hello")
      ).rejects.toThrow("Chat not found: non-existent");
    });

    it("should throw error when chat has no bot", async () => {
      const chat = createMockChat({ botId: null });
      mockChatRepo.findById.mockResolvedValue(chat);

      await expect(
        service.sendAdminMessage("chat-123", "Hello")
      ).rejects.toThrow(
        "ChatsService.sendAdminMessage: chat has no associated bot"
      );
    });

    it("should throw error when bot not found", async () => {
      const chat = createMockChat();
      mockChatRepo.findById.mockResolvedValue(chat);
      mockBotRepo.findById.mockResolvedValue(null);

      await expect(
        service.sendAdminMessage("chat-123", "Hello")
      ).rejects.toThrow("Bot not found: 1");
    });

    it("should trim text before sending", async () => {
      const chat = createMockChat();
      const bot = createMockBot();
      const message = createMockMessage();

      mockChatRepo.findById.mockResolvedValue(chat);
      mockBotRepo.findById.mockResolvedValue(bot);
      mockTelegramClient.sendMessage.mockResolvedValue({ messageId: 999 });
      mockMessageRepo.createAdminMessage.mockResolvedValue(message);
      mockMessageRepo.save.mockResolvedValue(undefined);

      await service.sendAdminMessage("chat-123", "  Hello  ");

      expect(mockTelegramClient.sendMessage).toHaveBeenCalledWith({
        chatId: chat.telegramChatId.toString(),
        text: "Hello",
      });
      expect(mockMessageRepo.createAdminMessage).toHaveBeenCalledWith({
        chatId: chat.id,
        botId: chat.botId,
        text: "Hello",
      });
    });
  });
});
