import { SessionData } from "../../../domain/users/types";

/**
 * Interface for session storage backends
 */
export interface SessionStore {
  /**
   * Get session data by session ID
   */
  get(sessionId: string): Promise<SessionData | null>;

  /**
   * Store session data with TTL
   */
  set(sessionId: string, data: SessionData, ttlSeconds: number): Promise<void>;

  /**
   * Delete session by ID
   */
  delete(sessionId: string): Promise<void>;
}


