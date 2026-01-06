import { Injectable } from "@nestjs/common";
import { SessionStore } from "./session-store";
import { SessionData } from "../../../domain/users/types";

interface StoredSession {
  data: SessionData;
  expiresAt: number; // Unix timestamp in ms
}

/**
 * In-memory session store with TTL support
 * Suitable for development and single-instance deployments
 */
@Injectable()
export class MemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, StoredSession>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Cleanup expired sessions every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  async get(sessionId: string): Promise<SessionData | null> {
    const stored = this.sessions.get(sessionId);

    if (!stored) {
      return null;
    }

    // Check if session has expired
    if (Date.now() > stored.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return stored.data;
  }

  async set(
    sessionId: string,
    data: SessionData,
    ttlSeconds: number
  ): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.sessions.set(sessionId, { data, expiresAt });
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [sessionId, stored] of this.sessions) {
      if (now > stored.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }
}



