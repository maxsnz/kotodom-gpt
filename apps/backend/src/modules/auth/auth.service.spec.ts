import { AuthService } from "./auth.service";
import { SessionStore } from "./session/session-store";
import { User } from "../../domain/users/User";
import { SessionData } from "../../domain/users/types";

describe("AuthService", () => {
  let authService: AuthService;
  let mockSessionStore: jest.Mocked<SessionStore>;

  beforeEach(() => {
    mockSessionStore = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    authService = new AuthService(mockSessionStore);
  });

  const createMockUser = (): User => {
    return new User({
      id: "user-123",
      email: "test@example.com",
      passwordHash: "hash",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe("createSession", () => {
    it("should create session and return session ID", async () => {
      const user = createMockUser();
      mockSessionStore.set.mockResolvedValue();

      const sessionId = await authService.createSession(user);

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");
      expect(sessionId.length).toBeGreaterThan(0);

      expect(mockSessionStore.set).toHaveBeenCalledWith(
        sessionId,
        expect.objectContaining({
          userId: user.id,
          role: user.role,
          createdAt: expect.any(Number),
        }),
        expect.any(Number)
      );
    });

    it("should generate unique session IDs", async () => {
      const user = createMockUser();
      mockSessionStore.set.mockResolvedValue();

      const sessionId1 = await authService.createSession(user);
      const sessionId2 = await authService.createSession(user);

      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe("validateSession", () => {
    it("should return auth user when session is valid", async () => {
      const sessionData: SessionData = {
        userId: "user-123",
        role: "ADMIN",
        createdAt: Date.now(),
      };
      mockSessionStore.get.mockResolvedValue(sessionData);

      const result = await authService.validateSession("session-abc");

      expect(result).toEqual({
        id: "user-123",
        role: "ADMIN",
      });
      expect(mockSessionStore.get).toHaveBeenCalledWith("session-abc");
    });

    it("should return null when session not found", async () => {
      mockSessionStore.get.mockResolvedValue(null);

      const result = await authService.validateSession("invalid-session");

      expect(result).toBeNull();
    });
  });

  describe("destroySession", () => {
    it("should delete session from store", async () => {
      mockSessionStore.delete.mockResolvedValue();

      await authService.destroySession("session-abc");

      expect(mockSessionStore.delete).toHaveBeenCalledWith("session-abc");
    });
  });
});
