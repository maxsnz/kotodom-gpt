import { createClient, RedisClientType } from "redis";
import { SessionStore } from "./session-store";
import { SessionData } from "../../../domain/users/types";

/**
 * Redis-backed session store
 * Uses @redis/client for Redis operations
 */
export class RedisSessionStore implements SessionStore {
  private client: RedisClientType;
  private prefix = "session:";
  private isConnected = false;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });

    this.client.on("error", (err) => {
      console.error("[RedisSessionStore] Redis client error:", err);
    });

    this.client.on("connect", () => {
      console.info("[RedisSessionStore] Connected to Redis");
      this.isConnected = true;
    });

    this.client.on("disconnect", () => {
      console.warn("[RedisSessionStore] Disconnected from Redis");
      this.isConnected = false;
    });
  }

  /**
   * Connect to Redis
   * Should be called before using the store
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  /**
   * Disconnect from Redis
   * Should be called on application shutdown
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  /**
   * Get session data by session ID
   */
  async get(sessionId: string): Promise<SessionData | null> {
    const data = await this.client.get(this.prefix + sessionId);
    if (!data) {
      return null;
    }

    try {
      const parsed = JSON.parse(data);
      // Restore Date object for createdAt
      if (parsed.createdAt) {
        parsed.createdAt = new Date(parsed.createdAt);
      }
      return parsed as SessionData;
    } catch {
      console.error("[RedisSessionStore] Failed to parse session data:", sessionId);
      return null;
    }
  }

  /**
   * Store session data with TTL
   */
  async set(sessionId: string, data: SessionData, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(data);
    await this.client.setEx(this.prefix + sessionId, ttlSeconds, serialized);
  }

  /**
   * Delete session by ID
   */
  async delete(sessionId: string): Promise<void> {
    await this.client.del(this.prefix + sessionId);
  }

  /**
   * Check if connected to Redis
   */
  isReady(): boolean {
    return this.isConnected;
  }
}

