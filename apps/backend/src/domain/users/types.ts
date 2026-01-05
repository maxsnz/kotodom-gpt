/**
 * User roles for RBAC
 */
export type UserRole = "ADMIN" | "MANAGER" | "USER";

/**
 * User account status
 */
export type UserStatus = "ACTIVE" | "DISABLED";

/**
 * Session data stored in session store
 */
export interface SessionData {
  userId: string;
  role: UserRole;
  createdAt: number; // Unix timestamp
}

/**
 * Authenticated user context attached to request
 */
export interface AuthUser {
  id: string;
  role: UserRole;
}


