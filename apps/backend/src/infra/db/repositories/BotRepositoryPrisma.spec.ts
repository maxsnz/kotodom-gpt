import { BotRepositoryPrisma } from "./BotRepositoryPrisma";
import { Bot } from "../../../domain/bots/Bot";
import { prisma } from "../prisma/client";

// Mock Prisma client
jest.mock("../prisma/client", () => ({
  prisma: {
    bot: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe("BotRepositoryPrisma", () => {
  let repository: BotRepositoryPrisma;
  let mockPrisma: jest.Mocked<typeof prisma>;
  let prismaBotMock: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    upsert: jest.Mock;
  };
  const botProps = {
    id: "1",
    name: "Test Bot",
    startMessage: "Start",
    errorMessage: "Error",
    prompt: "Hello",
    model: "gpt-4o-mini",
    token: "token-1",
    enabled: true,
    telegramMode: "webhook" as const,
    error: null as string | null,
    ownerUserId: null as string | null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    repository = new BotRepositoryPrisma();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
    prismaBotMock = mockPrisma.bot as unknown as typeof prismaBotMock;
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should return bot when found", async () => {
      const prismaBot = {
        id: 1,
        enabled: true,
        telegramMode: "webhook" as const,
        startMessage: "Start",
        errorMessage: "",
        name: "Test Bot",
        model: "gpt-4o-mini",
        createdAt: new Date(),
        error: null,
      };

      prismaBotMock.findUnique.mockResolvedValue(prismaBot as any);

      const result = await repository.findById("1");

      expect(result).toBeInstanceOf(Bot);
      expect(result?.id).toBe("1");
      expect(result?.enabled).toBe(true);
      expect(result?.telegramMode).toBe("webhook");
      expect(result?.token).toBe("test-token");
      expect(mockPrisma.bot.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return null when bot not found", async () => {
      prismaBotMock.findUnique.mockResolvedValue(null);

      const result = await repository.findById("1");

      expect(result).toBeNull();
    });

    it("should return null for invalid bot ID (non-numeric)", async () => {
      const result = await repository.findById("invalid-id");

      expect(result).toBeNull();
      expect(mockPrisma.bot.findUnique).not.toHaveBeenCalled();
    });

    it("should return null for empty string ID", async () => {
      const result = await repository.findById("");

      expect(result).toBeNull();
      expect(mockPrisma.bot.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("findPollingBots", () => {
    it("should return only enabled polling bots", async () => {
      const prismaBots = [
        {
          id: 1,
          enabled: true,
          telegramMode: "polling" as const,
          startMessage: "Start",
          errorMessage: "",
          name: "Bot 1",
          model: "gpt-4o-mini",
          createdAt: new Date(),
          error: null,
        },
        {
          id: 2,
          enabled: true,
          telegramMode: "polling" as const,
          startMessage: "Start",
          errorMessage: "",
          name: "Bot 2",
          model: "gpt-4o-mini",
          createdAt: new Date(),
          error: null,
        },
      ];

      prismaBotMock.findMany.mockResolvedValue(prismaBots as any);

      const result = await repository.findPollingBots();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Bot);
      expect(result[0].telegramMode).toBe("polling");
      expect(result[0].enabled).toBe(true);
      expect(mockPrisma.bot.findMany).toHaveBeenCalledWith({
        where: {
          enabled: true,
          telegramMode: "polling",
        },
      });
    });

    it("should return empty array when no polling bots found", async () => {
      prismaBotMock.findMany.mockResolvedValue([]);

      const result = await repository.findPollingBots();

      expect(result).toEqual([]);
    });
  });

  describe("findWebhookBots", () => {
    it("should return only enabled webhook bots", async () => {
      const prismaBots = [
        {
          id: 1,
          enabled: true,
          telegramMode: "webhook" as const,
          token: "token-1",
          startMessage: "Start",
          errorMessage: "",
          name: "Bot 1",
          model: "gpt-4o-mini",
          createdAt: new Date(),
          error: null,
        },
        {
          id: 2,
          enabled: true,
          telegramMode: "webhook" as const,
          token: "token-2",
          startMessage: "Start",
          errorMessage: "",
          name: "Bot 2",
          model: "gpt-4o-mini",
          createdAt: new Date(),
          error: null,
        },
      ];

      prismaBotMock.findMany.mockResolvedValue(prismaBots as any);

      const result = await repository.findWebhookBots();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Bot);
      expect(result[0].telegramMode).toBe("webhook");
      expect(result[0].enabled).toBe(true);
      expect(mockPrisma.bot.findMany).toHaveBeenCalledWith({
        where: {
          enabled: true,
          telegramMode: "webhook",
        },
      });
    });

    it("should return empty array when no webhook bots found", async () => {
      prismaBotMock.findMany.mockResolvedValue([]);

      const result = await repository.findWebhookBots();

      expect(result).toEqual([]);
    });
  });

  describe("save", () => {
    it("should create new bot when bot does not exist", async () => {
      const bot = new Bot({
        ...botProps,
        token: "new-token",
      });

      prismaBotMock.upsert.mockResolvedValue({
        id: 1,
        enabled: true,
        telegramMode: "webhook",
        token: "new-token",
        startMessage: "Start",
        errorMessage: "",
        name: "Test Bot",
        model: "gpt-4o-mini",
        createdAt: new Date(),
        error: null,
      } as any);

      await repository.save(bot);

      expect(mockPrisma.bot.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        create: expect.objectContaining({
          id: 1,
          enabled: true,
          telegramMode: "webhook",
          token: "new-token",
        }),
        update: expect.objectContaining({
          id: 1,
          enabled: true,
          telegramMode: "webhook",
          token: "new-token",
        }),
      });
    });

    it("should update existing bot", async () => {
      const bot = new Bot({
        ...botProps,
        enabled: false,
        telegramMode: "polling",
        token: "updated-token",
      });

      prismaBotMock.upsert.mockResolvedValue({
        id: 1,
        enabled: false,
        telegramMode: "polling",
        token: "updated-token",
      } as any);

      await repository.save(bot);

      expect(mockPrisma.bot.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        create: expect.any(Object),
        update: expect.objectContaining({
          enabled: false,
          telegramMode: "polling",
          token: "updated-token",
        }),
      });
    });

    it("should throw error for invalid bot ID (non-numeric)", async () => {
      const bot = new Bot({ ...botProps, id: "invalid-id" });

      await expect(repository.save(bot)).rejects.toThrow(
        "Invalid bot id: invalid-id"
      );
      expect(prismaBotMock.upsert).not.toHaveBeenCalled();
    });

    it("should throw error for empty string bot ID", async () => {
      const bot = new Bot({ ...botProps, id: "" });

      await expect(repository.save(bot)).rejects.toThrow("Invalid bot id: ");
      expect(prismaBotMock.upsert).not.toHaveBeenCalled();
    });
  });

  describe("mapping", () => {
    it("should map Prisma model to domain model correctly", async () => {
      const prismaBot = {
        id: 42,
        enabled: true,
        telegramMode: "polling" as const,
        token: "mapped-token",
        startMessage: "Start",
        errorMessage: "",
        name: "Mapped Bot",
        model: "gpt-4o-mini",
        createdAt: new Date(),
        error: null,
      };

      prismaBotMock.findUnique.mockResolvedValue(prismaBot as any);

      const result = await repository.findById("42");

      expect(result).toBeInstanceOf(Bot);
      expect(result?.id).toBe("42");
      expect(result?.enabled).toBe(true);
      expect(result?.telegramMode).toBe("polling");
      expect(result?.token).toBe("mapped-token");
    });

    it("should map domain model to Prisma model correctly", async () => {
      const bot = new Bot({
        ...botProps,
        id: "99",
        enabled: false,
        telegramMode: "webhook",
        token: "domain-token",
        createdAt: new Date(),
      });

      prismaBotMock.upsert.mockResolvedValue({
        id: 99,
        enabled: false,
        telegramMode: "webhook",
        token: "domain-token",
      } as any);

      await repository.save(bot);

      expect(prismaBotMock.upsert).toHaveBeenCalledWith({
        where: { id: 99 },
        create: expect.objectContaining({
          id: 99,
          enabled: false,
          telegramMode: "webhook",
          token: "domain-token",
        }),
        update: expect.objectContaining({
          id: 99,
          enabled: false,
          telegramMode: "webhook",
          token: "domain-token",
        }),
      });
    });
  });
});
