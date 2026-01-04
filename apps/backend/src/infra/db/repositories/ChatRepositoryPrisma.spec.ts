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

  beforeEach(() => {
    repository = new ChatRepositoryPrisma();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should return chat when found", async () => {
      const prismaChat = {
        id: "chat-1",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "thread-123",
        name: "Test Chat",
        createdAt: new Date("2024-01-01"),
      };

      mockPrisma.chat.findUnique.mockResolvedValue(prismaChat as any);

      const result = await repository.findById("chat-1");

      expect(result).toBeInstanceOf(Chat);
      expect(result?.id).toBe("chat-1");
      expect(result?.botId).toBe(1);
      expect(result?.tgUserId).toBe(BigInt(123456789));
      expect(result?.threadId).toBe("thread-123");
      expect(result?.name).toBe("Test Chat");
      expect(mockPrisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: "chat-1" },
      });
    });

    it("should return null when chat not found", async () => {
      mockPrisma.chat.findUnique.mockResolvedValue(null);

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });

    it("should handle chat with null fields", async () => {
      const prismaChat = {
        id: "chat-2",
        botId: null,
        tgUserId: BigInt(987654321),
        threadId: null,
        name: null,
        createdAt: new Date("2024-01-02"),
      };

      mockPrisma.chat.findUnique.mockResolvedValue(prismaChat as any);

      const result = await repository.findById("chat-2");

      expect(result).toBeInstanceOf(Chat);
      expect(result?.id).toBe("chat-2");
      expect(result?.botId).toBeNull();
      expect(result?.threadId).toBeNull();
      expect(result?.name).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return all chats for a user", async () => {
      const tgUserId = BigInt(123456789);
      const prismaChats = [
        {
          id: "chat-1",
          botId: 1,
          tgUserId,
          threadId: "thread-1",
          name: "Chat 1",
          createdAt: new Date("2024-01-01"),
        },
        {
          id: "chat-2",
          botId: 2,
          tgUserId,
          threadId: null,
          name: "Chat 2",
          createdAt: new Date("2024-01-02"),
        },
      ];

      mockPrisma.chat.findMany.mockResolvedValue(prismaChats as any);

      const result = await repository.findByUserId(tgUserId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Chat);
      expect(result[0].id).toBe("chat-1");
      expect(result[1].id).toBe("chat-2");
      expect(mockPrisma.chat.findMany).toHaveBeenCalledWith({
        where: { tgUserId },
      });
    });

    it("should return empty array when no chats found", async () => {
      mockPrisma.chat.findMany.mockResolvedValue([]);

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
          botId,
          tgUserId: BigInt(111),
          threadId: "thread-1",
          name: "Chat 1",
          createdAt: new Date("2024-01-01"),
        },
        {
          id: "chat-2",
          botId,
          tgUserId: BigInt(222),
          threadId: null,
          name: "Chat 2",
          createdAt: new Date("2024-01-02"),
        },
      ];

      mockPrisma.chat.findMany.mockResolvedValue(prismaChats as any);

      const result = await repository.findByBotId(botId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Chat);
      expect(result[0].botId).toBe(botId);
      expect(result[1].botId).toBe(botId);
      expect(mockPrisma.chat.findMany).toHaveBeenCalledWith({
        where: { botId },
      });
    });

    it("should return empty array when no chats found for bot", async () => {
      mockPrisma.chat.findMany.mockResolvedValue([]);

      const result = await repository.findByBotId(999);

      expect(result).toEqual([]);
    });
  });

  describe("save", () => {
    it("should create new chat when chat does not exist", async () => {
      const chat = new Chat({
        id: "new-chat",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "thread-123",
        name: "New Chat",
        createdAt: new Date("2024-01-01"),
      });

      mockPrisma.chat.upsert.mockResolvedValue({
        id: "new-chat",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "thread-123",
        name: "New Chat",
        createdAt: new Date("2024-01-01"),
      } as any);

      await repository.save(chat);

      expect(mockPrisma.chat.upsert).toHaveBeenCalledWith({
        where: { id: "new-chat" },
        create: expect.objectContaining({
          id: "new-chat",
          botId: 1,
          tgUserId: BigInt(123456789),
          threadId: "thread-123",
          name: "New Chat",
        }),
        update: expect.objectContaining({
          id: "new-chat",
          botId: 1,
          tgUserId: BigInt(123456789),
          threadId: "thread-123",
          name: "New Chat",
        }),
      });
    });

    it("should update existing chat", async () => {
      const chat = new Chat({
        id: "existing-chat",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "updated-thread",
        name: "Updated Chat",
        createdAt: new Date("2024-01-01"),
      });

      mockPrisma.chat.upsert.mockResolvedValue({
        id: "existing-chat",
        botId: 1,
        tgUserId: BigInt(123456789),
        threadId: "updated-thread",
        name: "Updated Chat",
        createdAt: new Date("2024-01-01"),
      } as any);

      await repository.save(chat);

      expect(mockPrisma.chat.upsert).toHaveBeenCalledWith({
        where: { id: "existing-chat" },
        create: expect.any(Object),
        update: expect.objectContaining({
          threadId: "updated-thread",
          name: "Updated Chat",
        }),
      });
    });

    it("should handle chat with null fields", async () => {
      const chat = new Chat({
        id: "null-chat",
        botId: null,
        tgUserId: BigInt(123456789),
        threadId: null,
        name: null,
        createdAt: new Date("2024-01-01"),
      });

      mockPrisma.chat.upsert.mockResolvedValue({
        id: "null-chat",
        botId: null,
        tgUserId: BigInt(123456789),
        threadId: null,
        name: null,
        createdAt: new Date("2024-01-01"),
      } as any);

      await repository.save(chat);

      expect(mockPrisma.chat.upsert).toHaveBeenCalledWith({
        where: { id: "null-chat" },
        create: expect.objectContaining({
          botId: null,
          threadId: null,
          name: null,
        }),
        update: expect.objectContaining({
          botId: null,
          threadId: null,
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

      const existingChat = {
        id: chatId,
        botId,
        tgUserId,
        threadId: "thread-123",
        name: "Existing Chat",
        createdAt: new Date("2024-01-01"),
      };

      mockPrisma.chat.upsert.mockResolvedValue(existingChat as any);

      const result = await repository.findOrCreateChat(chatId, tgUserId, botId);

      expect(result).toBeInstanceOf(Chat);
      expect(result.id).toBe(chatId);
      expect(mockPrisma.chat.upsert).toHaveBeenCalledWith({
        where: { id: chatId },
        create: {
          id: chatId,
          tgUserId,
          botId,
          threadId: null,
          name: null,
        },
        update: {},
      });
    });

    it("should create new chat when not found", async () => {
      const chatId = "new-chat";
      const tgUserId = BigInt(123456789);
      const botId = 1;

      const newChat = {
        id: chatId,
        botId,
        tgUserId,
        threadId: null,
        name: null,
        createdAt: new Date("2024-01-01"),
      };

      mockPrisma.chat.upsert.mockResolvedValue(newChat as any);

      const result = await repository.findOrCreateChat(chatId, tgUserId, botId);

      expect(result).toBeInstanceOf(Chat);
      expect(result.id).toBe(chatId);
      expect(result.botId).toBe(botId);
      expect(result.tgUserId).toBe(tgUserId);
      expect(result.threadId).toBeNull();
      expect(result.name).toBeNull();
      expect(mockPrisma.chat.upsert).toHaveBeenCalledWith({
        where: { id: chatId },
        create: {
          id: chatId,
          tgUserId,
          botId,
          threadId: null,
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
        name: "John",
        fullName: "John Doe",
        createdAt: new Date("2024-01-01"),
      };

      mockPrisma.tgUser.upsert.mockResolvedValue(existingUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "existing_user",
        firstName: "John",
        lastName: "Doe",
      });

      expect(result).toEqual(existingUser);
      expect(mockPrisma.tgUser.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "existing_user",
          name: "John",
          fullName: "John Doe",
        },
        update: {
          username: "existing_user",
          name: "John",
          fullName: "John Doe",
        },
      });
    });

    it("should create new user when not found", async () => {
      const tgUserId = BigInt(987654321);
      const newUser = {
        id: tgUserId,
        username: "new_user",
        name: "Jane",
        fullName: "Jane Smith",
        createdAt: new Date("2024-01-01"),
      };

      mockPrisma.tgUser.upsert.mockResolvedValue(newUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "new_user",
        firstName: "Jane",
        lastName: "Smith",
      });

      expect(result).toEqual(newUser);
      expect(mockPrisma.tgUser.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "new_user",
          name: "Jane",
          fullName: "Jane Smith",
        },
        update: {
          username: "new_user",
          name: "Jane",
          fullName: "Jane Smith",
        },
      });
    });

    it("should handle user with only firstName", async () => {
      const tgUserId = BigInt(111111111);
      const newUser = {
        id: tgUserId,
        username: null,
        name: "Alice",
        fullName: "Alice",
        createdAt: new Date("2024-01-01"),
      };

      mockPrisma.tgUser.upsert.mockResolvedValue(newUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        firstName: "Alice",
      });

      expect(result).toEqual(newUser);
      expect(mockPrisma.tgUser.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: null,
          name: "Alice",
          fullName: "Alice",
        },
        update: {
          username: null,
          name: "Alice",
          fullName: "Alice",
        },
      });
    });

    it("should handle user with only lastName", async () => {
      const tgUserId = BigInt(222222222);
      const newUser = {
        id: tgUserId,
        username: "bob",
        name: null,
        fullName: "Brown",
        createdAt: new Date("2024-01-01"),
      };

      mockPrisma.tgUser.upsert.mockResolvedValue(newUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "bob",
        lastName: "Brown",
      });

      expect(result).toEqual(newUser);
      expect(mockPrisma.tgUser.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "bob",
          name: null,
          fullName: "Brown",
        },
        update: {
          username: "bob",
          name: null,
          fullName: "Brown",
        },
      });
    });

    it("should handle user with no name fields", async () => {
      const tgUserId = BigInt(333333333);
      const newUser = {
        id: tgUserId,
        username: "username_only",
        name: null,
        fullName: null,
        createdAt: new Date("2024-01-01"),
      };

      mockPrisma.tgUser.upsert.mockResolvedValue(newUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "username_only",
      });

      expect(result).toEqual(newUser);
      expect(mockPrisma.tgUser.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "username_only",
          name: null,
          fullName: null,
        },
        update: {
          username: "username_only",
          name: null,
          fullName: null,
        },
      });
    });

    it("should update existing user with new data", async () => {
      const tgUserId = BigInt(444444444);
      const updatedUser = {
        id: tgUserId,
        username: "new_username",
        name: "New",
        fullName: "New Name",
        createdAt: new Date("2024-01-01"),
      };

      mockPrisma.tgUser.upsert.mockResolvedValue(updatedUser as any);

      const result = await repository.findOrCreateUser(tgUserId, {
        username: "new_username",
        firstName: "New",
        lastName: "Name",
      });

      expect(result).toEqual(updatedUser);
      expect(mockPrisma.tgUser.upsert).toHaveBeenCalledWith({
        where: { id: tgUserId },
        create: {
          id: tgUserId,
          username: "new_username",
          name: "New",
          fullName: "New Name",
        },
        update: {
          username: "new_username",
          name: "New",
          fullName: "New Name",
        },
      });
    });
  });

  describe("mapping", () => {
    it("should map Prisma model to domain model correctly", async () => {
      const prismaChat = {
        id: "mapped-chat",
        botId: 42,
        tgUserId: BigInt(999999999),
        threadId: "mapped-thread",
        name: "Mapped Chat",
        createdAt: new Date("2024-01-15"),
      };

      mockPrisma.chat.findUnique.mockResolvedValue(prismaChat as any);

      const result = await repository.findById("mapped-chat");

      expect(result).toBeInstanceOf(Chat);
      expect(result?.id).toBe("mapped-chat");
      expect(result?.botId).toBe(42);
      expect(result?.tgUserId).toBe(BigInt(999999999));
      expect(result?.threadId).toBe("mapped-thread");
      expect(result?.name).toBe("Mapped Chat");
    });

    it("should map domain model to Prisma model correctly", async () => {
      const chat = new Chat({
        id: "domain-chat",
        botId: 99,
        tgUserId: BigInt(888888888),
        threadId: "domain-thread",
        name: "Domain Chat",
        createdAt: new Date("2024-01-20"),
      });

      mockPrisma.chat.upsert.mockResolvedValue({
        id: "domain-chat",
        botId: 99,
        tgUserId: BigInt(888888888),
        threadId: "domain-thread",
        name: "Domain Chat",
        createdAt: new Date("2024-01-20"),
      } as any);

      await repository.save(chat);

      expect(mockPrisma.chat.upsert).toHaveBeenCalledWith({
        where: { id: "domain-chat" },
        create: expect.objectContaining({
          id: "domain-chat",
          botId: 99,
          tgUserId: BigInt(888888888),
          threadId: "domain-thread",
          name: "Domain Chat",
        }),
        update: expect.objectContaining({
          id: "domain-chat",
          botId: 99,
          tgUserId: BigInt(888888888),
          threadId: "domain-thread",
          name: "Domain Chat",
        }),
      });
    });
  });
});

