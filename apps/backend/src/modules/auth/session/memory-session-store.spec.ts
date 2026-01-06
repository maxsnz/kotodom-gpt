import { MemorySessionStore } from "./memory-session-store";
import { SessionData } from "../../../domain/users/types";

describe("MemorySessionStore", () => {
  let store: MemorySessionStore;

  beforeEach(() => {
    store = new MemorySessionStore();
  });

  afterEach(() => {
    store.destroy();
  });

  const createSessionData = (): SessionData => ({
    userId: "user-123",
    role: "ADMIN",
    createdAt: Date.now(),
  });

  describe("set and get", () => {
    it("should store and retrieve session data", async () => {
      const sessionId = "session-abc";
      const data = createSessionData();

      await store.set(sessionId, data, 3600);
      const result = await store.get(sessionId);

      expect(result).toEqual(data);
    });

    it("should return null for non-existent session", async () => {
      const result = await store.get("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete session", async () => {
      const sessionId = "session-abc";
      const data = createSessionData();

      await store.set(sessionId, data, 3600);
      await store.delete(sessionId);
      const result = await store.get(sessionId);

      expect(result).toBeNull();
    });

    it("should not throw when deleting non-existent session", async () => {
      await expect(store.delete("non-existent")).resolves.not.toThrow();
    });
  });

  describe("TTL expiration", () => {
    it("should return null for expired session", async () => {
      const sessionId = "session-abc";
      const data = createSessionData();

      // Set with 0 TTL (immediate expiration)
      await store.set(sessionId, data, 0);

      // Wait a bit to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await store.get(sessionId);

      expect(result).toBeNull();
    });

    it("should return data for non-expired session", async () => {
      const sessionId = "session-abc";
      const data = createSessionData();

      // Set with 1 hour TTL
      await store.set(sessionId, data, 3600);

      const result = await store.get(sessionId);

      expect(result).toEqual(data);
    });
  });

  describe("overwrite", () => {
    it("should overwrite existing session", async () => {
      const sessionId = "session-abc";
      const data1 = createSessionData();
      const data2: SessionData = {
        userId: "user-456",
        role: "USER",
        createdAt: Date.now(),
      };

      await store.set(sessionId, data1, 3600);
      await store.set(sessionId, data2, 3600);
      const result = await store.get(sessionId);

      expect(result).toEqual(data2);
    });
  });
});



