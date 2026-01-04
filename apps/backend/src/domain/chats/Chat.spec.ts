import { Chat } from "./Chat";

describe("Chat", () => {
  describe("constructor and getters", () => {
    it("should create a chat with all properties", () => {
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const chat = new Chat({
        id: "chat-123",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "thread-abc",
        name: "Test Chat",
        createdAt,
      });

      expect(chat.id).toBe("chat-123");
      expect(chat.botId).toBe(1);
      expect(chat.tgUserId).toBe(BigInt(123456789));
      expect(chat.threadId).toBe("thread-abc");
      expect(chat.name).toBe("Test Chat");
      expect(chat.createdAt).toBe(createdAt);
    });

    it("should create a chat with null optional fields", () => {
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const chat = new Chat({
        id: "chat-456",
        botId: null,
        tgUserId: BigInt(987654321),
        threadId: null,
        name: null,
        createdAt,
      });

      expect(chat.id).toBe("chat-456");
      expect(chat.botId).toBeNull();
      expect(chat.tgUserId).toBe(BigInt(987654321));
      expect(chat.threadId).toBeNull();
      expect(chat.name).toBeNull();
      expect(chat.createdAt).toBe(createdAt);
    });

    it("should handle bigint values correctly", () => {
      const largeId = BigInt("9007199254740991");
      const chat = new Chat({
        id: "chat-large",
        botId: 2,
        tgUserId: largeId,
        threadId: "thread-large",
        name: "Large Chat",
        createdAt: new Date(),
      });

      expect(chat.tgUserId).toBe(largeId);
      expect(typeof chat.tgUserId).toBe("bigint");
    });
  });

  describe("setThreadId", () => {
    it("should update threadId", () => {
      const chat = new Chat({
        id: "chat-123",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "old-thread",
        name: "Test Chat",
        createdAt: new Date(),
      });

      chat.setThreadId("new-thread");
      expect(chat.threadId).toBe("new-thread");
    });

    it("should set threadId to null", () => {
      const chat = new Chat({
        id: "chat-123",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "old-thread",
        name: "Test Chat",
        createdAt: new Date(),
      });

      chat.setThreadId(null);
      expect(chat.threadId).toBeNull();
    });
  });

  describe("updateName", () => {
    it("should update name", () => {
      const chat = new Chat({
        id: "chat-123",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "thread-abc",
        name: "Old Name",
        createdAt: new Date(),
      });

      chat.updateName("New Name");
      expect(chat.name).toBe("New Name");
    });

    it("should set name to null", () => {
      const chat = new Chat({
        id: "chat-123",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "thread-abc",
        name: "Old Name",
        createdAt: new Date(),
      });

      chat.updateName(null);
      expect(chat.name).toBeNull();
    });
  });
});

