import { RedisSessionStore } from "./redis-session-store";
import { SessionData } from "../../../domain/users/types";

// Mock the redis client
const mockRedisClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue(undefined),
  get: jest.fn(),
  setEx: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(1),
  on: jest.fn(),
};

jest.mock("redis", () => ({
  createClient: jest.fn(() => mockRedisClient),
}));

describe("RedisSessionStore", () => {
  let store: RedisSessionStore;
  const testSessionData: SessionData = {
    userId: "user-123",
    role: "USER",
    createdAt: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = new RedisSessionStore("redis://localhost:6379");
  });

  describe("constructor", () => {
    it("should register event handlers", () => {
      expect(mockRedisClient.on).toHaveBeenCalledWith(
        "error",
        expect.any(Function)
      );
      expect(mockRedisClient.on).toHaveBeenCalledWith(
        "connect",
        expect.any(Function)
      );
      expect(mockRedisClient.on).toHaveBeenCalledWith(
        "disconnect",
        expect.any(Function)
      );
    });
  });

  describe("connect", () => {
    it("should connect to Redis", async () => {
      await store.connect();
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    it("should disconnect from Redis when connected", async () => {
      // Simulate connection
      const connectHandler = mockRedisClient.on.mock.calls.find(
        (call) => call[0] === "connect"
      )?.[1];
      connectHandler?.();

      await store.disconnect();
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("should return session data when found", async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testSessionData));

      const result = await store.get("session-123");

      expect(mockRedisClient.get).toHaveBeenCalledWith("session:session-123");
      expect(result).toEqual(testSessionData);
    });

    it("should return null when session not found", async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await store.get("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null on parse error", async () => {
      mockRedisClient.get.mockResolvedValue("invalid-json");

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await store.get("bad-session");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("set", () => {
    it("should store session data with TTL", async () => {
      await store.set("session-123", testSessionData, 3600);

      expect(mockRedisClient.setEx).toHaveBeenCalledWith(
        "session:session-123",
        3600,
        JSON.stringify(testSessionData)
      );
    });
  });

  describe("delete", () => {
    it("should delete session by ID", async () => {
      await store.delete("session-123");

      expect(mockRedisClient.del).toHaveBeenCalledWith("session:session-123");
    });
  });

  describe("isReady", () => {
    it("should return false initially", () => {
      expect(store.isReady()).toBe(false);
    });

    it("should return true after connect event", () => {
      // Find and call the connect handler
      const connectHandler = mockRedisClient.on.mock.calls.find(
        (call) => call[0] === "connect"
      )?.[1];
      connectHandler?.();

      expect(store.isReady()).toBe(true);
    });
  });
});
