import { SessionStore } from "./session-store";
import { MemorySessionStore } from "./memory-session-store";
import { RedisSessionStore } from "./redis-session-store";

/**
 * Factory to create the appropriate session store based on configuration
 * Uses Redis if REDIS_URL is provided, otherwise falls back to Memory store
 */
export function createSessionStore(redisUrl?: string): SessionStore {
  if (redisUrl) {
    console.info("[SessionStore] Using Redis session store");
    return new RedisSessionStore(redisUrl);
  }

  console.info("[SessionStore] Using in-memory session store");
  return new MemorySessionStore();
}

/**
 * Type guard to check if a session store is a RedisSessionStore
 */
export function isRedisSessionStore(store: SessionStore): store is RedisSessionStore {
  return store instanceof RedisSessionStore;
}

