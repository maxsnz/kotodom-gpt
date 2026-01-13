// Mock pg-boss before importing modules that use it
jest.mock("../../infra/jobs/pgBoss", () => ({
  PgBossClient: jest.fn(),
}));

// Mock env
jest.mock("../../config/env", () => ({
  env: {
    BASE_URL: "https://api.example.com",
  },
}));

import { BotsService } from "./bots.service";
import { BotRepository } from "../../domain/bots/BotRepository";
import { Bot } from "../../domain/bots/Bot";
import { EffectRunner } from "../../infra/effects/EffectRunner";
import { AuthUser } from "../../domain/users/types";

describe("BotsService", () => {
  let service: BotsService;
  let mockBotRepo: jest.Mocked<BotRepository>;
  let mockEffectRunner: jest.Mocked<EffectRunner>;

  const createMockBot = (
    overrides: Partial<ConstructorParameters<typeof Bot>[0]> = {}
  ): Bot => {
    return new Bot({
      id: "1",
      name: "Test Bot",
      startMessage: "Hello",
      errorMessage: "Error",
      model: "gpt-4o-mini",
      token: "bot-token",
      enabled: false,
      telegramMode: "webhook",
      error: null,
      ownerUserId: null,
      prompt: "",
      createdAt: new Date(),
      ...overrides,
    });
  };

  beforeEach(() => {
    mockBotRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByOwner: jest.fn(),
      findPollingBots: jest.fn(),
      findWebhookBots: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockEffectRunner = {
      run: jest.fn(),
      runAll: jest.fn(),
    } as any;

    service = new BotsService(mockBotRepo, mockEffectRunner);
  });

  describe("getAll", () => {
    it("should return all bots when no user is provided", async () => {
      const allBots = [createMockBot({ id: "1" }), createMockBot({ id: "2" })];
      mockBotRepo.findAll.mockResolvedValue(allBots);

      const result = await service.getAll();

      expect(mockBotRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual(allBots);
    });

    it("should return all bots", async () => {
      const allBots = [createMockBot({ id: "1" }), createMockBot({ id: "2" })];
      mockBotRepo.findAll.mockResolvedValue(allBots);

      const result = await service.getAll();

      expect(mockBotRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual(allBots);
    });

    it("should return all bots", async () => {
      const allBots = [createMockBot({ id: "1" }), createMockBot({ id: "2" })];
      mockBotRepo.findAll.mockResolvedValue(allBots);

      const result = await service.getAll();

      expect(mockBotRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual(allBots);
    });

    it("should return all bots", async () => {
      const allBots = [createMockBot({ id: "1" }), createMockBot({ id: "2" })];
      mockBotRepo.findAll.mockResolvedValue(allBots);

      const result = await service.getAll();

      expect(mockBotRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual(allBots);
    });
  });

  describe("create", () => {
    it("should create bot with owner", async () => {
      const input = {
        name: "New Bot",
        startMessage: "Hello",
        errorMessage: "Error",
        model: "gpt-4",
        token: "new-token",
        telegramMode: "webhook" as const,
        prompt: "Hello",
      };
      const createdBot = createMockBot({
        id: "2",
        name: "New Bot",
        ownerUserId: "user-1",
      });
      mockBotRepo.create.mockResolvedValue(createdBot);

      const result = await service.create(input, "user-1");

      expect(mockBotRepo.create).toHaveBeenCalledWith({
        ...input,
        name: "New Bot",
        ownerUserId: "user-1",
      });
      expect(result).toEqual(createdBot);
    });

    it("should create bot without owner when not provided", async () => {
      const input = {
        name: "New Bot",
        startMessage: "Hello",
        errorMessage: "Error",
        model: "gpt-4",
        token: "new-token",
        telegramMode: "webhook" as const,
        prompt: "Hello",
      };
      const createdBot = createMockBot({
        id: "2",
        name: "New Bot",
        ownerUserId: null,
      });
      mockBotRepo.create.mockResolvedValue(createdBot);

      const result = await service.create(input);

      expect(mockBotRepo.create).toHaveBeenCalledWith({
        ...input,
        name: "New Bot",
        ownerUserId: null,
      });
      expect(result).toEqual(createdBot);
    });
  });

  describe("enableBot", () => {
    it("should enable bot and execute webhook effect for webhook mode", async () => {
      const bot = createMockBot({ enabled: false, telegramMode: "webhook" });
      mockBotRepo.findById.mockResolvedValue(bot);
      mockBotRepo.save.mockResolvedValue(undefined);
      mockEffectRunner.runAll.mockResolvedValue(undefined);

      const result = await service.enableBot("1");

      expect(result.enabled).toBe(true);
      expect(mockBotRepo.save).toHaveBeenCalledWith(bot);
      expect(mockEffectRunner.runAll).toHaveBeenCalledWith([
        { type: "telegram.ensureWebhook", botId: "1", botToken: "bot-token" },
      ]);
    });

    it("should enable bot and execute startPolling effect for polling mode", async () => {
      const bot = createMockBot({ enabled: false, telegramMode: "polling" });
      mockBotRepo.findById.mockResolvedValue(bot);
      mockBotRepo.save.mockResolvedValue(undefined);
      mockEffectRunner.runAll.mockResolvedValue(undefined);

      const result = await service.enableBot("1");

      expect(result.enabled).toBe(true);
      expect(mockBotRepo.save).toHaveBeenCalledWith(bot);
      expect(mockEffectRunner.runAll).toHaveBeenCalledWith([
        { type: "telegram.startPolling", botId: "1", botToken: "bot-token" },
      ]);
    });

    it("should not generate effects if bot is already enabled", async () => {
      const bot = createMockBot({ enabled: true });
      mockBotRepo.findById.mockResolvedValue(bot);
      mockBotRepo.save.mockResolvedValue(undefined);
      mockEffectRunner.runAll.mockResolvedValue(undefined);

      await service.enableBot("1");

      expect(mockEffectRunner.runAll).toHaveBeenCalledWith([]);
    });

    it("should throw error if bot not found", async () => {
      mockBotRepo.findById.mockResolvedValue(null);

      await expect(service.enableBot("999")).rejects.toThrow(
        "Bot not found: 999"
      );
    });
  });

  describe("disableBot", () => {
    it("should disable bot and execute removeWebhook effect for webhook mode", async () => {
      const bot = createMockBot({ enabled: true, telegramMode: "webhook" });
      mockBotRepo.findById.mockResolvedValue(bot);
      mockBotRepo.save.mockResolvedValue(undefined);
      mockEffectRunner.runAll.mockResolvedValue(undefined);

      const result = await service.disableBot("1");

      expect(result.enabled).toBe(false);
      expect(mockBotRepo.save).toHaveBeenCalledWith(bot);
      expect(mockEffectRunner.runAll).toHaveBeenCalledWith([
        { type: "telegram.removeWebhook", botToken: "bot-token" },
      ]);
    });

    it("should disable bot and execute stopPolling effect for polling mode", async () => {
      const bot = createMockBot({ enabled: true, telegramMode: "polling" });
      mockBotRepo.findById.mockResolvedValue(bot);
      mockBotRepo.save.mockResolvedValue(undefined);
      mockEffectRunner.runAll.mockResolvedValue(undefined);

      const result = await service.disableBot("1");

      expect(result.enabled).toBe(false);
      expect(mockBotRepo.save).toHaveBeenCalledWith(bot);
      expect(mockEffectRunner.runAll).toHaveBeenCalledWith([
        { type: "telegram.stopPolling", botId: "1" },
      ]);
    });

    it("should not change state if bot is already disabled", async () => {
      const bot = createMockBot({ enabled: false });
      mockBotRepo.findById.mockResolvedValue(bot);
      mockBotRepo.save.mockResolvedValue(undefined);
      mockEffectRunner.runAll.mockResolvedValue(undefined);

      await service.disableBot("1");

      // Bot.disable() returns empty effects if already disabled
      expect(mockEffectRunner.runAll).toHaveBeenCalledWith([]);
    });

    it("should throw error if bot not found", async () => {
      mockBotRepo.findById.mockResolvedValue(null);

      await expect(service.disableBot("999")).rejects.toThrow(
        "Bot not found: 999"
      );
    });
  });
});
