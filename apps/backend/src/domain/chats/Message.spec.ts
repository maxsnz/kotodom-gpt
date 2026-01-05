import { Message } from "./Message";

describe("Message", () => {
  describe("constructor and getters", () => {
    it("should create a message with all properties", () => {
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const message = new Message({
        id: 1,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "Hello, world!",
        telegramUpdateId: BigInt(111),
        userMessageId: null,
        createdAt,
      });

      expect(message.id).toBe(1);
      expect(message.chatId).toBe("chat-123");
      expect(message.tgUserId).toBe(BigInt(123456789));
      expect(message.botId).toBe(1);
      expect(message.text).toBe("Hello, world!");
      expect(message.createdAt).toBe(createdAt);
    });

    it("should create a message with null optional fields", () => {
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const message = new Message({
        id: 2,
        chatId: null,
        tgUserId: null,
        botId: null,
        text: "Message without optional fields",
        telegramUpdateId: null,
        userMessageId: null,
        createdAt,
      });

      expect(message.id).toBe(2);
      expect(message.chatId).toBeNull();
      expect(message.tgUserId).toBeNull();
      expect(message.botId).toBeNull();
      expect(message.text).toBe("Message without optional fields");
      expect(message.createdAt).toBe(createdAt);
    });

    it("should handle bigint telegramUpdateId correctly", () => {
      const createdAt = new Date();

      const message1 = new Message({
        id: 3,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "Message with update ID",
        telegramUpdateId: BigInt(222),
        userMessageId: null,
        createdAt,
      });

      const message2 = new Message({
        id: 4,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "Another message",
        telegramUpdateId: BigInt(333),
        userMessageId: null,
        createdAt,
      });

      expect(message1.telegramUpdateId).toBe(BigInt(222));
      expect(message2.telegramUpdateId).toBe(BigInt(333));
    });

    it("should handle bigint values correctly", () => {
      const largeId = BigInt("9007199254740991");
      const message = new Message({
        id: 5,
        chatId: "chat-large",
        tgUserId: largeId,
        botId: 2,
        text: "Message with large user ID",
        telegramUpdateId: BigInt(444),
        userMessageId: null,
        createdAt: new Date(),
      });

      expect(message.tgUserId).toBe(largeId);
      expect(typeof message.tgUserId).toBe("bigint");
    });

    it("should handle userMessageId correctly", () => {
      const message = new Message({
        id: 6,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "Bot response message",
        telegramUpdateId: BigInt(555),
        userMessageId: 100,
        createdAt: new Date(),
      });

      expect(message.userMessageId).toBe(100);
      message.setUserMessageId(200);
      expect(message.userMessageId).toBe(200);
    });

    it("should handle empty text", () => {
      const message = new Message({
        id: 7,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "",
        telegramUpdateId: BigInt(666),
        userMessageId: null,
        createdAt: new Date(),
      });

      expect(message.text).toBe("");
    });
  });
});

