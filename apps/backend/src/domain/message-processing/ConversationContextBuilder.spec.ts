import { ConversationContextBuilder } from "./ConversationContextBuilder";
import { MessageRepository } from "../chats/MessageRepository";
import { SettingsRepository } from "../settings/SettingsRepository";
import { Message } from "../chats/Message";
import { encoding_for_model, get_encoding } from "tiktoken";

// Mock tiktoken
jest.mock("tiktoken", () => ({
  encoding_for_model: jest.fn(),
  get_encoding: jest.fn(),
}));

describe("ConversationContextBuilder", () => {
  let builder: ConversationContextBuilder;
  let mockMessageRepository: jest.Mocked<MessageRepository>;
  let mockSettingsRepository: jest.Mocked<SettingsRepository>;
  let mockEncodingForModel: jest.MockedFunction<typeof encoding_for_model>;
  let mockGetEncoding: jest.MockedFunction<typeof get_encoding>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMessageRepository = {
      findByChatId: jest.fn(),
    } as any;

    mockSettingsRepository = {
      getSetting: jest.fn(),
    } as any;

    mockEncodingForModel = encoding_for_model as jest.MockedFunction<
      typeof encoding_for_model
    >;
    mockGetEncoding = get_encoding as jest.MockedFunction<typeof get_encoding>;

    builder = new ConversationContextBuilder(
      mockMessageRepository,
      mockSettingsRepository
    );
  });

  const createUserMessage = (
    id: number,
    text: string,
    createdAt: Date
  ): Message => {
    return new Message({
      id,
      chatId: "chat-1",
      tgUserId: BigInt(123),
      botId: null,
      text,
      telegramUpdateId: BigInt(id),
      userMessageId: null,
      createdAt,
    });
  };

  const createBotMessage = (
    id: number,
    text: string,
    createdAt: Date,
    botId: number = 1
  ): Message => {
    return new Message({
      id,
      chatId: "chat-1",
      tgUserId: null,
      botId,
      text,
      telegramUpdateId: null,
      userMessageId: null,
      createdAt,
    });
  };

  const createAdminMessage = (
    id: number,
    text: string,
    createdAt: Date
  ): Message => {
    return new Message({
      id,
      chatId: "chat-1",
      tgUserId: null,
      botId: null,
      text,
      telegramUpdateId: null,
      userMessageId: null,
      createdAt,
    });
  };

  const createMockEncoding = (tokenCount: number) => {
    return {
      encode: jest.fn().mockReturnValue(new Array(tokenCount).fill(0)),
      free: jest.fn(),
    };
  };

  describe("buildContext", () => {
    it("should return empty array when no messages exist", async () => {
      mockMessageRepository.findByChatId.mockResolvedValue([]);
      mockSettingsRepository.getSetting.mockResolvedValue("");

      const result = await builder.buildContext("chat-1", "gpt-4o-mini");

      expect(result).toEqual([]);
      expect(mockMessageRepository.findByChatId).toHaveBeenCalledWith("chat-1");
    });

    it("should build context from user and bot messages", async () => {
      const messages = [
        createUserMessage(1, "Hello", new Date("2024-01-01T10:00:00Z")),
        createBotMessage(2, "Hi there!", new Date("2024-01-01T10:01:00Z")),
        createUserMessage(3, "How are you?", new Date("2024-01-01T10:02:00Z")),
      ];

      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("");
      mockEncodingForModel.mockReturnValue(createMockEncoding(5) as any);

      const result = await builder.buildContext("chat-1", "gpt-4o-mini");

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ role: "user", content: "Hello" });
      expect(result[1]).toEqual({ role: "assistant", content: "Hi there!" });
      expect(result[2]).toEqual({ role: "user", content: "How are you?" });
    });

    it("should exclude specified message from context", async () => {
      const messages = [
        createUserMessage(1, "Hello", new Date("2024-01-01T10:00:00Z")),
        createBotMessage(2, "Hi there!", new Date("2024-01-01T10:01:00Z")),
        createUserMessage(3, "How are you?", new Date("2024-01-01T10:02:00Z")),
      ];

      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("");
      mockEncodingForModel.mockReturnValue(createMockEncoding(5) as any);

      const result = await builder.buildContext("chat-1", "gpt-4o-mini", 3);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ role: "user", content: "Hello" });
      expect(result[1]).toEqual({ role: "assistant", content: "Hi there!" });
      expect(result.find((m) => m.content === "How are you?")).toBeUndefined();
    });

    it("should skip admin messages", async () => {
      const messages = [
        createUserMessage(1, "Hello", new Date("2024-01-01T10:00:00Z")),
        createAdminMessage(2, "Admin message", new Date("2024-01-01T10:01:00Z")),
        createBotMessage(3, "Hi there!", new Date("2024-01-01T10:02:00Z")),
      ];

      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("");
      mockEncodingForModel.mockReturnValue(createMockEncoding(5) as any);

      const result = await builder.buildContext("chat-1", "gpt-4o-mini");

      expect(result).toHaveLength(2);
      expect(result.find((m) => m.content === "Admin message")).toBeUndefined();
    });

    it("should sort messages from newest to oldest when building context", async () => {
      const messages = [
        createUserMessage(1, "First", new Date("2024-01-01T10:00:00Z")),
        createBotMessage(2, "Second", new Date("2024-01-01T10:01:00Z")),
        createUserMessage(3, "Third", new Date("2024-01-01T10:02:00Z")),
      ];

      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("");
      mockEncodingForModel.mockReturnValue(createMockEncoding(5) as any);

      const result = await builder.buildContext("chat-1", "gpt-4o-mini");

      // Should be in chronological order (oldest first) in result
      expect(result[0].content).toBe("First");
      expect(result[1].content).toBe("Second");
      expect(result[2].content).toBe("Third");
    });

    it("should limit context by token count from settings", async () => {
      const messages = [
        createUserMessage(1, "Message 1", new Date("2024-01-01T10:00:00Z")),
        createBotMessage(2, "Message 2", new Date("2024-01-01T10:01:00Z")),
        createUserMessage(3, "Message 3", new Date("2024-01-01T10:02:00Z")),
        createBotMessage(4, "Message 4", new Date("2024-01-01T10:03:00Z")),
      ];

      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("15"); // 15 tokens max
      // Each message has 5 tokens, so only 3 messages should fit (15 tokens)
      // Messages are processed from newest to oldest, so Message 4, 3, 2 will be added
      mockEncodingForModel.mockReturnValue(createMockEncoding(5) as any);

      const result = await builder.buildContext("chat-1", "gpt-4o-mini");

      // Should include only 3 messages (15 tokens total)
      // Result is in chronological order (oldest first) due to unshift
      expect(result).toHaveLength(3);
      expect(result[0].content).toBe("Message 2"); // Oldest of the 3 included
      expect(result[1].content).toBe("Message 3");
      expect(result[2].content).toBe("Message 4"); // Newest of the 3 included
      // Message 1 should be excluded as it would exceed the limit
    });

    it("should use default max context tokens when setting is not found", async () => {
      const messages = [
        createUserMessage(1, "Message 1", new Date("2024-01-01T10:00:00Z")),
        createBotMessage(2, "Message 2", new Date("2024-01-01T10:01:00Z")),
      ];

      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue(""); // Empty string = not found
      mockEncodingForModel.mockReturnValue(createMockEncoding(5) as any);

      const result = await builder.buildContext("chat-1", "gpt-4o-mini");

      expect(result).toHaveLength(2);
      expect(mockSettingsRepository.getSetting).toHaveBeenCalledWith(
        "MAX_CONTEXT_TOKENS"
      );
    });

    it("should use default max context tokens when setting is invalid", async () => {
      const messages = [
        createUserMessage(1, "Message 1", new Date("2024-01-01T10:00:00Z")),
        createBotMessage(2, "Message 2", new Date("2024-01-01T10:01:00Z")),
      ];

      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("invalid-number");
      mockEncodingForModel.mockReturnValue(createMockEncoding(5) as any);

      const result = await builder.buildContext("chat-1", "gpt-4o-mini");

      expect(result).toHaveLength(2);
    });

    it("should use custom max context tokens from settings", async () => {
      const messages = [
        createUserMessage(1, "Message 1", new Date("2024-01-01T10:00:00Z")),
        createBotMessage(2, "Message 2", new Date("2024-01-01T10:01:00Z")),
        createUserMessage(3, "Message 3", new Date("2024-01-01T10:02:00Z")),
      ];

      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("10"); // 10 tokens max
      mockEncodingForModel.mockReturnValue(createMockEncoding(5) as any);

      const result = await builder.buildContext("chat-1", "gpt-4o-mini");

      // Only 2 messages should fit (10 tokens)
      expect(result).toHaveLength(2);
    });
  });

  describe("countTokens", () => {
    it("should use encoding_for_model when model is supported", async () => {
      const messages = [
        createUserMessage(1, "Test message", new Date("2024-01-01T10:00:00Z")),
      ];

      const mockEncoding = createMockEncoding(10);
      mockEncodingForModel.mockReturnValue(mockEncoding as any);
      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("");

      await builder.buildContext("chat-1", "gpt-4o-mini");

      expect(mockEncodingForModel).toHaveBeenCalledWith("gpt-4o-mini");
      expect(mockEncoding.encode).toHaveBeenCalledWith("Test message");
      expect(mockEncoding.free).toHaveBeenCalled();
    });

    it("should fallback to get_encoding when model is not supported", async () => {
      const messages = [
        createUserMessage(1, "Test message", new Date("2024-01-01T10:00:00Z")),
      ];

      const mockEncoding = createMockEncoding(8);
      mockEncodingForModel.mockImplementation(() => {
        throw new Error("Model not supported");
      });
      mockGetEncoding.mockReturnValue(mockEncoding as any);
      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("");

      await builder.buildContext("chat-1", "unsupported-model");

      expect(mockEncodingForModel).toHaveBeenCalledWith("unsupported-model");
      expect(mockGetEncoding).toHaveBeenCalledWith("cl100k_base");
      expect(mockEncoding.encode).toHaveBeenCalledWith("Test message");
      expect(mockEncoding.free).toHaveBeenCalled();
    });

    it("should fallback to estimation when tiktoken fails completely", async () => {
      const messages = [
        createUserMessage(
          1,
          "Test message with 30 characters",
          new Date("2024-01-01T10:00:00Z")
        ),
      ];

      mockEncodingForModel.mockImplementation(() => {
        throw new Error("Model not supported");
      });
      mockGetEncoding.mockImplementation(() => {
        throw new Error("Encoding failed");
      });
      mockMessageRepository.findByChatId.mockResolvedValue(messages);
      mockSettingsRepository.getSetting.mockResolvedValue("");

      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = await builder.buildContext("chat-1", "unsupported-model");

      // Should use fallback estimation: 30 chars / 4 = 8 tokens (rounded up)
      expect(result).toHaveLength(1);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });
});