import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../../domain/users/types";

/**
 * Metadata key for roles
 */
export const ROLES_KEY = "roles";

/**
 * Decorator to specify required roles for a route or controller
 *
 * @example
 * ```typescript
 * @Roles("ADMIN", "MANAGER")
 * @Get()
 * async listUsers() { ... }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

