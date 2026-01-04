import { Message } from "./Message";
import * as runtime from "@prisma/client/runtime/client";
const { Decimal } = runtime;

describe("Message", () => {
  describe("constructor and getters", () => {
    it("should create a message with all properties", () => {
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const price = new Decimal("10.50");
      const message = new Message({
        id: 1,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "Hello, world!",
        price,
        createdAt,
      });

      expect(message.id).toBe(1);
      expect(message.chatId).toBe("chat-123");
      expect(message.tgUserId).toBe(BigInt(123456789));
      expect(message.botId).toBe(1);
      expect(message.text).toBe("Hello, world!");
      expect(message.price).toBe(price);
      expect(message.createdAt).toBe(createdAt);
    });

    it("should create a message with null optional fields", () => {
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const price = new Decimal("0");
      const message = new Message({
        id: 2,
        chatId: null,
        tgUserId: null,
        botId: null,
        text: "Message without optional fields",
        price,
        createdAt,
      });

      expect(message.id).toBe(2);
      expect(message.chatId).toBeNull();
      expect(message.tgUserId).toBeNull();
      expect(message.botId).toBeNull();
      expect(message.text).toBe("Message without optional fields");
      expect(message.price).toBe(price);
      expect(message.createdAt).toBe(createdAt);
    });

    it("should handle Decimal price correctly", () => {
      const price1 = new Decimal("0.0001");
      const price2 = new Decimal("9999.9999");
      const createdAt = new Date();

      const message1 = new Message({
        id: 3,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "Low price message",
        price: price1,
        createdAt,
      });

      const message2 = new Message({
        id: 4,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "High price message",
        price: price2,
        createdAt,
      });

      expect(message1.price.toString()).toBe("0.0001");
      expect(message2.price.toString()).toBe("9999.9999");
    });

    it("should handle bigint values correctly", () => {
      const largeId = BigInt("9007199254740991");
      const price = new Decimal("5.25");
      const message = new Message({
        id: 5,
        chatId: "chat-large",
        tgUserId: largeId,
        botId: 2,
        text: "Message with large user ID",
        price,
        createdAt: new Date(),
      });

      expect(message.tgUserId).toBe(largeId);
      expect(typeof message.tgUserId).toBe("bigint");
    });

    it("should handle zero price", () => {
      const price = new Decimal("0");
      const message = new Message({
        id: 6,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "Free message",
        price,
        createdAt: new Date(),
      });

      expect(message.price.toString()).toBe("0");
      expect(message.price.toNumber()).toBe(0);
    });

    it("should handle empty text", () => {
      const price = new Decimal("1.00");
      const message = new Message({
        id: 7,
        chatId: "chat-123",
        tgUserId: BigInt(123456789),
        botId: 1,
        text: "",
        price,
        createdAt: new Date(),
      });

      expect(message.text).toBe("");
    });
  });
});

