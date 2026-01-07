import { FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { SESSION_COOKIE_NAME } from "./session/session.constants";
import { AuthUser } from "../../domain/users/types";

// Extend FastifyRequest to include user property
declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

/**
 * Routes that don't require session loading
 */
const PUBLIC_ROUTES = [
  "/auth/login",
  "/health",
  "/webhooks",
  "/bots/webhook", // Telegram webhook endpoint
];

/**
 * Check if route is public (doesn't need session)
 */
function isPublicRoute(url: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => url === route || url.startsWith(route + "/")
  );
}

/**
 * Create session loading hook for Fastify
 * Loads session from cookie and attaches user to request
 */
export function createSessionHook(authService: AuthService) {
  return async (request: FastifyRequest): Promise<void> => {
    // Skip session loading for public routes
    if (isPublicRoute(request.url)) {
      return;
    }

    // Get session ID from signed cookie
    const signedCookie = request.cookies[SESSION_COOKIE_NAME];
    if (!signedCookie) {
      return;
    }

    const unsignedResult = request.unsignCookie(signedCookie);
    if (!unsignedResult.valid) {
      return;
    }

    const sessionId = unsignedResult.value;

    // Validate session and attach user
    const authUser = await authService.validateSession(sessionId);

    if (authUser) {
      request.user = authUser;
    }
  };
}
