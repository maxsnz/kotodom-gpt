import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { AuthUser } from "../../../domain/users/types";

/**
 * Parameter decorator to extract authenticated user from request
 *
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@AuthUser() user: AuthUser) {
 *   return { userId: user.id };
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return request.user;
  }
);
