import { Injectable, Inject } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { SessionStore } from "./session/session-store";
import {
  SESSION_STORE,
  SESSION_TTL_SECONDS,
} from "./session/session.constants";
import { SessionData, AuthUser } from "../../domain/users/types";
import { User } from "../../domain/users/User";

/**
 * Service for session management
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(SESSION_STORE)
    private readonly sessionStore: SessionStore
  ) {}

  /**
   * Create a new session for user
   * @returns Session ID to be stored in cookie
   */
  async createSession(user: User): Promise<string> {
    const sessionId = randomUUID();
    const sessionData: SessionData = {
      userId: user.id,
      role: user.role,
      createdAt: Date.now(),
    };

    await this.sessionStore.set(sessionId, sessionData, SESSION_TTL_SECONDS);

    return sessionId;
  }

  /**
   * Validate session and get auth user
   * @returns AuthUser if session is valid, null otherwise
   */
  async validateSession(sessionId: string): Promise<AuthUser | null> {
    const sessionData = await this.sessionStore.get(sessionId);

    if (!sessionData) {
      return null;
    }

    return {
      id: sessionData.userId,
      role: sessionData.role,
    };
  }

  /**
   * Destroy session (logout)
   */
  async destroySession(sessionId: string): Promise<void> {
    await this.sessionStore.delete(sessionId);
  }
}
