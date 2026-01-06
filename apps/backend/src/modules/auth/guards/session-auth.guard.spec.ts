import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { SessionAuthGuard } from "./session-auth.guard";

describe("SessionAuthGuard", () => {
  let guard: SessionAuthGuard;

  beforeEach(() => {
    guard = new SessionAuthGuard();
  });

  const createMockExecutionContext = (user?: object): ExecutionContext => {
    const mockRequest = {
      user,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  describe("canActivate", () => {
    it("should return true when user is present", () => {
      const context = createMockExecutionContext({
        id: "user-123",
        role: "ADMIN",
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should throw UnauthorizedException when user is not present", () => {
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        "Authentication required"
      );
    });

    it("should throw UnauthorizedException when user is null", () => {
      const mockRequest = { user: null };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });
});
