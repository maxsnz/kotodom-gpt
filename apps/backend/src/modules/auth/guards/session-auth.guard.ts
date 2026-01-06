import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";

/**
 * Guard that ensures request has authenticated user
 * Must be applied after session middleware loads user
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if (!request.user) {
      throw new UnauthorizedException("Authentication required");
    }

    return true;
  }
}
