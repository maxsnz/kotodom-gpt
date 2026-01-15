import { Chat } from "./Chat";

describe("Chat", () => {
  describe("constructor and getters", () => {
    it("should create a chat with all properties", () => {
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const chat = new Chat({
        id: "chat-123",
        telegramChatId: BigInt(12345678),
        botId: 1,
        tgUserId: BigInt(123456789),
        name: "Test Chat",
        createdAt,
        lastResponseId: null,
      });

      expect(chat.id).toBe("chat-123");
      expect(chat.telegramChatId).toBe(BigInt(12345678));
      expect(chat.botId).toBe(1);
      expect(chat.tgUserId).toBe(BigInt(123456789));
      expect(chat.name).toBe("Test Chat");
      expect(chat.createdAt).toBe(createdAt);
    });

    it("should create a chat with null optional fields", () => {
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const chat = new Chat({
        id: "chat-456",
        telegramChatId: BigInt(987654321),
        botId: null,
        tgUserId: BigInt(987654321),
        name: null,
        createdAt,
        lastResponseId: null,
      });

      expect(chat.id).toBe("chat-456");
      expect(chat.telegramChatId).toBe(BigInt(987654321));
      expect(chat.botId).toBeNull();
      expect(chat.tgUserId).toBe(BigInt(987654321));
      expect(chat.name).toBeNull();
      expect(chat.createdAt).toBe(createdAt);
    });

    it("should handle bigint values correctly", () => {
      const largeId = BigInt("9007199254740991");
      const chat = new Chat({
        id: "chat-large",
        telegramChatId: largeId,
        botId: 2,
        tgUserId: largeId,
        name: "Large Chat",
        createdAt: new Date(),
        lastResponseId: null,
      });

      expect(chat.tgUserId).toBe(largeId);
      expect(chat.telegramChatId).toBe(largeId);
      expect(typeof chat.tgUserId).toBe("bigint");
      expect(typeof chat.telegramChatId).toBe("bigint");
    });
  });

  describe("updateName", () => {
    it("should update name", () => {
      const chat = new Chat({
        id: "chat-123",
        telegramChatId: BigInt(123456789),
        botId: 1,
        tgUserId: BigInt(123456789),
        name: "Old Name",
        createdAt: new Date(),
        lastResponseId: null,
      });

      chat.updateName("New Name");
      expect(chat.name).toBe("New Name");
    });

    it("should set name to null", () => {
      const chat = new Chat({
        id: "chat-123",
        telegramChatId: BigInt(123456789),
        botId: 1,
        tgUserId: BigInt(123456789),
        name: "Old Name",
        createdAt: new Date(),
        lastResponseId: null,
      });

      chat.updateName(null);
      expect(chat.name).toBeNull();
    });
  });
});
