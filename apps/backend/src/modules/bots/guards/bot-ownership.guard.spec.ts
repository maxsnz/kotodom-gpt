import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { BotOwnershipGuard } from "./bot-ownership.guard";
import { BotRepository } from "../../../domain/bots/BotRepository";
import { Bot } from "../../../domain/bots/Bot";
import { AuthUser } from "../../../domain/users/types";

describe("BotOwnershipGuard", () => {
  let guard: BotOwnershipGuard;
  let mockBotRepository: jest.Mocked<BotRepository>;

  beforeEach(() => {
    mockBotRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByOwner: jest.fn(),
      findPollingBots: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<BotRepository>;

    guard = new BotOwnershipGuard(mockBotRepository);
  });

  const createMockBot = (id: string, ownerUserId: string | null): Bot => {
    return new Bot({
      id,
      name: "Test Bot",
      startMessage: "Hello",
      errorMessage: "Error",
      model: "gpt-4",
      assistantId: "asst_123",
      token: "token123",
      enabled: true,
      isActive: true,
      telegramMode: "webhook",
      error: null,
      ownerUserId,
    });
  };

  const createMockExecutionContext = (
    user: AuthUser | undefined,
    params: { id?: string }
  ): ExecutionContext => {
    const mockRequest = {
      user,
      params,
      bot: undefined as Bot | undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  describe("canActivate", () => {
    it("should return true for ADMIN user", async () => {
      const user: AuthUser = { id: "admin-1", role: "ADMIN" };
      const bot = createMockBot("1", "other-user");
      mockBotRepository.findById.mockResolvedValue(bot);

      const context = createMockExecutionContext(user, { id: "1" });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should return true for MANAGER user", async () => {
      const user: AuthUser = { id: "manager-1", role: "MANAGER" };
      const bot = createMockBot("1", "other-user");
      mockBotRepository.findById.mockResolvedValue(bot);

      const context = createMockExecutionContext(user, { id: "1" });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should return true for USER who owns the bot", async () => {
      const user: AuthUser = { id: "user-1", role: "USER" };
      const bot = createMockBot("1", "user-1");
      mockBotRepository.findById.mockResolvedValue(bot);

      const context = createMockExecutionContext(user, { id: "1" });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should throw ForbiddenException for USER who does not own the bot", async () => {
      const user: AuthUser = { id: "user-1", role: "USER" };
      const bot = createMockBot("1", "other-user");
      mockBotRepository.findById.mockResolvedValue(bot);

      const context = createMockExecutionContext(user, { id: "1" });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should throw NotFoundException when bot not found", async () => {
      const user: AuthUser = { id: "user-1", role: "USER" };
      mockBotRepository.findById.mockResolvedValue(null);

      const context = createMockExecutionContext(user, { id: "999" });

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw ForbiddenException when user not authenticated", async () => {
      const context = createMockExecutionContext(undefined, { id: "1" });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should throw ForbiddenException when bot ID not provided", async () => {
      const user: AuthUser = { id: "user-1", role: "USER" };
      const context = createMockExecutionContext(user, {});

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should attach bot to request for controller reuse", async () => {
      const user: AuthUser = { id: "admin-1", role: "ADMIN" };
      const bot = createMockBot("1", "someone");
      mockBotRepository.findById.mockResolvedValue(bot);

      const context = createMockExecutionContext(user, { id: "1" });
      const request = context.switchToHttp().getRequest();

      await guard.canActivate(context);

      expect(request.bot).toBe(bot);
    });
  });
});

