import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Throttle, SkipThrottle } from "@nestjs/throttler";
import { type FastifyRequest, type FastifyReply } from "fastify";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "./session/session.constants";
import { env } from "../../config/env";
import { ZodValidationPipe } from "../../common/pipes";
import { LoginSchema, type LoginDto } from "./dto";

interface UserResponse {
  id: string;
  email: string;
  role: string;
}

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  /**
   * POST /api/auth/login - Authenticate user and create session
   * Rate limited to 5 attempts per minute to prevent brute force attacks
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Req() request: FastifyRequest
  ): Promise<{ user: UserResponse }> {
    const { email, password } = dto;

    const user = await this.usersService.validateCredentials(email, password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Create session
    const sessionId = await this.authService.createSession(user);

    // Set session cookie
    const isProduction = env.NODE_ENV === "production";

    reply.setCookie(SESSION_COOKIE_NAME, sessionId, {
      // httpOnly: true,
      httpOnly: true,
      // secure: isProduction,
      secure: false,
      sameSite: "lax",
      // sameSite: "none",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
      signed: true,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * POST /api/auth/logout - Destroy session
   */
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ): Promise<{ success: boolean }> {
    const sessionId = request.cookies[SESSION_COOKIE_NAME];

    if (sessionId) {
      await this.authService.destroySession(sessionId);
    }

    // Clear session cookie
    reply.clearCookie(SESSION_COOKIE_NAME, {
      path: "/",
    });

    return { success: true };
  }

  /**
   * GET /api/auth/me - Get current authenticated user
   */
  @Get("me")
  @SkipThrottle()
  async me(@Req() request: FastifyRequest): Promise<{ user: UserResponse }> {
    if (!request.user) {
      throw new UnauthorizedException("Not authenticated");
    }

    const user = await this.usersService.findById(request.user.id);

    if (!user || !user.isActive()) {
      throw new UnauthorizedException("User not found or disabled");
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
