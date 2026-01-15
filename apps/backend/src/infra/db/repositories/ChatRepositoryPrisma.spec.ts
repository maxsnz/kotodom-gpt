import { ChatRepositoryPrisma } from "./ChatRepositoryPrisma";
import { Chat } from "../../../domain/chats/Chat";
import { prisma } from "../prisma/client";

// Mock Prisma client
jest.mock("../prisma/client", () => ({
  prisma: {
    chat: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    tgUser: {
      upsert: jest.fn(),
    },
  },
}));

describe("ChatRepositoryPrisma", () => {
  let repository: ChatRepositoryPrisma;
  let mockPrisma: jest.Mocked<typeof prisma>;
  let prismaChatMock: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    upsert: jest.Mock;
  };
  let prismaTgUserMock: {
    upsert: jest.Mock;
  };

  beforeEach(() => {
    repository = new ChatRepositoryPrisma();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
    prismaChatMock = mockPrisma.chat as unknown as typeof prismaChatMock;
    prismaTgUserMock = mockPrisma.tgUser as unknown as typeof prismaTgUserMock;
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should return chat when found", async () => {
      const prismaChat = {
        id: "chat-1",
        telegramChatId: BigInt(12345678),
        botId: 1,
        tgUserId: BigInt(123456789),
        name: "Test Chat",
        createdAt: new Date("2024-01-01"),
      };

      prismaChatMock.findUnique.mockResolvedValue(prismaChat as any);

      const result = await repository.findById("chat-1");

      expect(result).toBeInstanceOf(Chat);
      expect(result?.id).toBe("chat-1");
      expect(result?.telegramChatId).toBe(BigInt(12345678));
      expect(result?.botId).toBe(1);
      expect(result?.tgUserId).toBe(BigInt(123456789));
      expect(result?.name).toBe("Test Chat");
      expect(prismaChatMock.findUnique).toHaveBeenCalledWith({
        where: { id: "chat-1" },
      });
    });

    it("should return null when chat not found", async () => {
      prismaChatMock.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });

    it("should handle chat with null fields", async () => {
      const prismaChat = {
        id: "chat-2",
        telegramChatId: BigInt(987654321),
        botId: null,
        tgUserId: BigInt(987654321),
        name: null,
        createdAt: new Date("2024-01-02"),
      };

      prismaChatMock.findUnique.mockResolvedValue(prismaChat as any);

      const result = await repository.findById("chat-2");

      expect(result).toBeInstanceOf(Chat);
      expect(result?.id).toBe("chat-2");
      expect(result?.botId).toBeNull();
      expect(result?.name).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return all chats for a user", async () => {
      const tgUserId = BigInt(123456789);
      const prismaChats = [
        {
          id: "chat-1",
          telegramChatId: BigInt(12345678),
          botId: 1,
          tgUserId,
          name: "Chat 1",
          createdAt: new Date("2024-01-01"),
        },
        {
          id: "chat-2",
          telegramChatId: BigInt(12345678),
          botId: 2,
          tgUserId,
          name: "Chat 2",
          createdAt: new Date("2024-01-02"),
        },
      ];

      prismaChatMock.findMany.mockResolvedValue(prismaChats as any);

      const result = await repository.findByUserId(tgUserId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Chat);
      expect(result[0].id).toBe("chat-1");
      expect(result[1].id).toBe("chat-2");
      expect(prismaChatMock.findMany).toHaveBeenCalledWith({
        where: { tgUserId },
      });
    });

    it("should return empty array when no chats found", async () => {
      prismaChatMock.findMany.mockResolvedValue([]);

      const result = await repository.findByUserId(BigInt(999999999));

      expect(result).toEqual([]);
    });
  });

  describe("findByBotId", () => {
    it("should return all chats for a bot", async () => {
      const botId = 1;
      const prismaChats = [
        {
          id: "chat-1",
          telegramChatId: BigInt(111),
          botId,
          tgUserId: BigInt(111),
          name: "Chat 1",
          createdAt: new Date("2024-01-01"),
        },
        {
          id: "chat-2",
          telegramChatId: BigInt(222),
          botId,
          tgUserId: BigInt(222),
          name: "Chat 2",
          createdAt: new Date("2024-01-02"),
        },
      ];

      prismaChatMock.findMany.mockResolvedValue(prismaChats as any);

      const result = await repository.findByBotId(botId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Chat);
      expect(result[0].botId).toBe(botId);
      expect(result[1].botId).toBe(botId);
      expect(prismaChatMock.findMany).toHaveBeenCalledWith({
        where: { botId },
      });
    });

    it("should return empty array when no chats found for bot", async () => {
      prismaChatMock.findMany.mockResolvedValue([]);

      const result = await repository.findByBotId(999);

      expect(result).toEqual([]);
    });
  });

  describe("save", () => {
    it("should create new chat when chat does not exist", async () => {
      const chat = new Chat({
        id: "new-chat",
        telegramChatId: BigInt(12345678),
        botId: 1,
        tgUserId: BigInt(123456789),
        name: "New Chat",
        createdAt: new Date("2024-01-01"),
        lastResponseId: null,
      });

      prismaChatMock.upsert.mockResolvedValue({
        id: "new-chat",
        telegramChatId: BigInt(12345678),
        botId: 1,
        tgUserId: BigInt(123456789),
        name: "New Chat",
        createdAt: new Date("2024-01-01"),
      } as any);

      await repository.save(chat);

      expect(prismaChatMock.upsert).toHaveBeenCalledWith({
        where: { id: "new-chat" },
        create: expect.objectContaining({
          id: "new-chat",
          telegramChatId: BigInt(12345678),
          botId: 1,
          tgUserId: BigInt(123456789),
          name: "New Chat",
        }),
        update: expect.objectContaining({
          id: "new-chat",
          telegramChatId: BigInt(12345678),
          botId: 1,
          tgUserId: BigInt(123456789),
          name: "New Chat",
        }),
      });
    });

    it("should update existing chat", async () => {
      const chat = new Chat({
        id: "existing-chat",
        telegramChatId: BigInt(12345678),
        botId: 1,
        tgUserId: BigInt(123456789),
        name: "Updated Chat",
        createdAt: new Date("2024-01-01"),
        lastResponseId: null,
      });

      prismaChatMock.upsert.mockResolvedValue({
        id: "existing-chat",
        telegramChatId: BigInt(12345678),
        botId: 1,
        tgUserId: BigInt(123456789),
        name: "Updated Chat",
        createdAt: new Date("2024-01-01"),
      } as any);

      await repository.save(chat);

      expect(prismaChatMock.upsert).toHaveBeenCalledWith({
        where: { id: "existing-chat" },
        create: expect.any(Object),
        update: expect.objectContaining({
          name: "Updated Chat",
        }),
      });
    });

    it("should handle chat with null fields", async () => {
      const chat = new Chat({
        id: "null-chat",
        telegramChatId: BigInt(123456789),
        botId: null,
        tgUserId: BigInt(123456789),
        name: null,
        lastResponseId: null,
        createdAt: new Date("2024-01-01"),
      });

      prismaChatMock.upsert.mockResolvedValue({
        id: "null-chat",
        telegramChatId: BigInt(123456789),
        botId: null,
        tgUserId: BigInt(123456789),
        name: null,
        createdAt: new Date("2024-01-01"),
      } as any);

      await repository.save(chat);

      expect(prismaChatMock.upsert).toHaveBeenCalledWith({
        where: { id: "null-chat" },
        create: expect.objectContaining({
          botId: null,
          name: null,
        }),
        update: expect.objectContaining({
          botId: null,
          name: null,
        }),
      });
    });
  });

  describe("findOrCreateChat", () => {
    it("should return existing chat when found", async () => {
      const chatId = "chat-1";
      const tgUserId = BigInt(123456789);
      const botId = 1;
      const telegramChatId = BigInt(12345678);

      const existingChat = {
        id: chatId,
        telegramChatId,
        botId,
        tgUserId,
        name: "Existing Chat",
        createdAt: new Date("2024-01-01"),
      };

      prismaChatMock.upsert.mockResolvedValue(existingChat as any);

      const result = await repository.findOrCreateChat(
        chatId,
        tgUserId,
        botId,
        telegramChatId
      );

      expect(result).toBeInstanceOf(Chat);
      expect(result.id).toBe(chatId);
      expect(result.telegramChatId).toBe(telegramChatId);
      expect(prismaChatMock.upsert).toHaveBeenCalledWith({
        where: { id: chatId },
        create: {
          id: chatId,
          telegramChatId,
          tgUserId,
          botId,
          name: null,
        },
        update: {},
      });
    });

    it("should create new chat when not found", async () => {
      const chatId = "new-chat";
      const tgUserId = BigInt(123456789);
      const botId = 1;
      const telegramChatId = BigInt(12345678);

      const newChat = {
        id: chatId,
        telegramChatId,
        botId,
        tgUserId,
        name: null,
        createdAt: new Date("2024-01-01"),
      };

      prismaChatMock.upsert.mockResolvedValue(newChat as any);

      const result = await repository.findOrCreateChat(
        chatId,
        tgUserId,
        botId,
        telegramChatId
      );

      expect(result).toBeInstanceOf(Chat);
      expect(result.id).toBe(chatId);
      expect(result.telegramChatId).toBe(telegramChatId);
      expect(result.botId).toBe(botId);
      expect(result.tgUserId).toBe(tgUserId);
      expect(result.name).toBeNull();
      expect(prismaChatMock.upsert).toHaveBeenCalledWith({
        where: { id: chatId },
        create: {
          id: chatId,
          telegramChatId,
          tgUserId,
          botId,
          name: null,
        },
        update: {},
      });
    });
  });

  describe("findOrCreateUser", () => {
    it("should return existing user when found", async () => {
      const tgUserId = BigInt(123456789);
      const existingUser = {
        id: tgUserId,
        username: "existing_user",
        name: "existing_user",
        fullName: "John Doe",
        createdAt: new Date("2024-01-01"),
      };

      prismaTgUserMock.upsert.mockResolvedValue(existingUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "existing_user",
        firstName: "John",
        lastName: "Doe",
      });

      expect(result).toEqual(existingUser);
      expect(prismaTgUserMock.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "existing_user",
          name: "existing_user",
          fullName: "John Doe",
        },
        update: {
          username: "existing_user",
          name: "existing_user",
          fullName: "John Doe",
        },
      });
    });

    it("should create new user when not found", async () => {
      const tgUserId = BigInt(987654321);
      const newUser = {
        id: tgUserId,
        username: "new_user",
        name: "new_user",
        fullName: "Jane Smith",
        createdAt: new Date("2024-01-01"),
      };

      prismaTgUserMock.upsert.mockResolvedValue(newUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "new_user",
        firstName: "Jane",
        lastName: "Smith",
      });

      expect(result).toEqual(newUser);
      expect(prismaTgUserMock.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "new_user",
          name: "new_user",
          fullName: "Jane Smith",
        },
        update: {
          username: "new_user",
          name: "new_user",
          fullName: "Jane Smith",
        },
      });
    });

    it("should handle user with only firstName", async () => {
      const tgUserId = BigInt(111111111);
      const newUser = {
        id: tgUserId,
        username: null,
        name: null,
        fullName: "Alice",
        createdAt: new Date("2024-01-01"),
      };

      prismaTgUserMock.upsert.mockResolvedValue(newUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        firstName: "Alice",
      });

      expect(result).toEqual(newUser);
      expect(prismaTgUserMock.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: null,
          name: null,
          fullName: "Alice",
        },
        update: {
          username: null,
          name: null,
          fullName: "Alice",
        },
      });
    });

    it("should handle user with only lastName", async () => {
      const tgUserId = BigInt(222222222);
      const newUser = {
        id: tgUserId,
        username: "bob",
        name: "bob",
        fullName: "Brown",
        createdAt: new Date("2024-01-01"),
      };

      prismaTgUserMock.upsert.mockResolvedValue(newUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "bob",
        lastName: "Brown",
      });

      expect(result).toEqual(newUser);
      expect(prismaTgUserMock.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "bob",
          name: "bob",
          fullName: "Brown",
        },
        update: {
          username: "bob",
          name: "bob",
          fullName: "Brown",
        },
      });
    });

    it("should handle user with no name fields", async () => {
      const tgUserId = BigInt(333333333);
      const newUser = {
        id: tgUserId,
        username: "username_only",
        name: "username_only",
        fullName: null,
        createdAt: new Date("2024-01-01"),
      };

      prismaTgUserMock.upsert.mockResolvedValue(newUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "username_only",
      });

      expect(result).toEqual(newUser);
      expect(prismaTgUserMock.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "username_only",
          name: "username_only",
          fullName: null,
        },
        update: {
          username: "username_only",
          name: "username_only",
          fullName: null,
        },
      });
    });

    it("should update existing user with new data", async () => {
      const tgUserId = BigInt(444444444);
      const updatedUser = {
        id: tgUserId,
        username: "new_username",
        name: "new_username",
        fullName: "New Name",
        createdAt: new Date("2024-01-01"),
      };

      prismaTgUserMock.upsert.mockResolvedValue(updatedUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "new_username",
        firstName: "New",
        lastName: "Name",
      });

      expect(result).toEqual(updatedUser);
      expect(prismaTgUserMock.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "new_username",
          name: "new_username",
          fullName: "New Name",
        },
        update: {
          username: "new_username",
          name: "new_username",
          fullName: "New Name",
        },
      });
    });

    it("should save name as username, fullName as firstName + lastName", async () => {
      const tgUserId = BigInt(555555555);
      const testUser = {
        id: tgUserId,
        username: "testuser123",
        name: "testuser123",
        fullName: "Test User",
        createdAt: new Date("2024-01-01"),
      };

      prismaTgUserMock.upsert.mockResolvedValue(testUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "testuser123",
        firstName: "Test",
        lastName: "User",
      });

      expect(result).toEqual(testUser);
      expect(prismaTgUserMock.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "testuser123",
          name: "testuser123", // name should be username
          fullName: "Test User", // fullName should be firstName + lastName
        },
        update: {
          username: "testuser123",
          name: "testuser123", // name should be username
          fullName: "Test User", // fullName should be firstName + lastName
        },
      });
    });
  });

  describe("mapping", () => {
    it("should map Prisma model to domain model correctly", async () => {
      const prismaChat = {
        id: "mapped-chat",
        telegramChatId: BigInt(999999999),
        botId: 42,
        tgUserId: BigInt(999999999),
        name: "Mapped Chat",
        createdAt: new Date("2024-01-15"),
      };

      prismaChatMock.findUnique.mockResolvedValue(prismaChat as any);

      const result = await repository.findById("mapped-chat");

      expect(result).toBeInstanceOf(Chat);
      expect(result?.id).toBe("mapped-chat");
      expect(result?.telegramChatId).toBe(BigInt(999999999));
      expect(result?.botId).toBe(42);
      expect(result?.tgUserId).toBe(BigInt(999999999));
      expect(result?.name).toBe("Mapped Chat");
    });

    it("should map domain model to Prisma model correctly", async () => {
      const chat = new Chat({
        id: "domain-chat",
        telegramChatId: BigInt(888888888),
        botId: 99,
        tgUserId: BigInt(888888888),
        name: "Domain Chat",
        createdAt: new Date("2024-01-20"),
        lastResponseId: null,
      });

      prismaChatMock.upsert.mockResolvedValue({
        id: "domain-chat",
        telegramChatId: BigInt(888888888),
        botId: 99,
        tgUserId: BigInt(888888888),
        name: "Domain Chat",
        createdAt: new Date("2024-01-20"),
      } as any);

      await repository.save(chat);

      expect(prismaChatMock.upsert).toHaveBeenCalledWith({
        where: { id: "domain-chat" },
        create: expect.objectContaining({
          id: "domain-chat",
          telegramChatId: BigInt(888888888),
          botId: 99,
          tgUserId: BigInt(888888888),
          name: "Domain Chat",
        }),
        update: expect.objectContaining({
          id: "domain-chat",
          telegramChatId: BigInt(888888888),
          botId: 99,
          tgUserId: BigInt(888888888),
          name: "Domain Chat",
        }),
      });
    });
  });
});
