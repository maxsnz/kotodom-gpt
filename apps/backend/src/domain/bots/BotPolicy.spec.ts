import { BotPolicy } from "./BotPolicy";
import { Bot } from "./Bot";
import { AuthUser } from "../users/types";

describe("BotPolicy", () => {
  const createMockBot = (ownerUserId: string | null): Bot => {
    return new Bot({
      id: "1",
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

  describe("canManage", () => {
    it("should return true for ADMIN regardless of ownership", () => {
      const user: AuthUser = { id: "admin-1", role: "ADMIN" };
      const bot = createMockBot("other-user");

      expect(BotPolicy.canManage(user, bot)).toBe(true);
    });

    it("should return true for MANAGER regardless of ownership", () => {
      const user: AuthUser = { id: "manager-1", role: "MANAGER" };
      const bot = createMockBot("other-user");

      expect(BotPolicy.canManage(user, bot)).toBe(true);
    });

    it("should return true for USER who owns the bot", () => {
      const user: AuthUser = { id: "user-1", role: "USER" };
      const bot = createMockBot("user-1");

      expect(BotPolicy.canManage(user, bot)).toBe(true);
    });

    it("should return false for USER who does not own the bot", () => {
      const user: AuthUser = { id: "user-1", role: "USER" };
      const bot = createMockBot("other-user");

      expect(BotPolicy.canManage(user, bot)).toBe(false);
    });

    it("should return false for USER when bot has no owner", () => {
      const user: AuthUser = { id: "user-1", role: "USER" };
      const bot = createMockBot(null);

      expect(BotPolicy.canManage(user, bot)).toBe(false);
    });

    it("should return true for ADMIN when bot has no owner", () => {
      const user: AuthUser = { id: "admin-1", role: "ADMIN" };
      const bot = createMockBot(null);

      expect(BotPolicy.canManage(user, bot)).toBe(true);
    });
  });

  describe("canView", () => {
    it("should use same rules as canManage", () => {
      const user: AuthUser = { id: "user-1", role: "USER" };
      const ownBot = createMockBot("user-1");
      const otherBot = createMockBot("other-user");

      expect(BotPolicy.canView(user, ownBot)).toBe(true);
      expect(BotPolicy.canView(user, otherBot)).toBe(false);
    });
  });
});

