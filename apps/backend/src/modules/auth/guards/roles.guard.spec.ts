import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "../../../domain/users/types";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user?: {
    id: string;
    role: UserRole;
  }): ExecutionContext => {
    const mockRequest = { user };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe("canActivate", () => {
    it("should return true when no roles are required", () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockExecutionContext({ id: "1", role: "USER" });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should return true when roles array is empty", () => {
      reflector.getAllAndOverride.mockReturnValue([]);
      const context = createMockExecutionContext({ id: "1", role: "USER" });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should return true when user has required role", () => {
      reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
      const context = createMockExecutionContext({ id: "1", role: "ADMIN" });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should return true when user has one of multiple required roles", () => {
      reflector.getAllAndOverride.mockReturnValue(["ADMIN", "MANAGER"]);
      const context = createMockExecutionContext({ id: "1", role: "MANAGER" });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should throw ForbiddenException when user lacks required role", () => {
      reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
      const context = createMockExecutionContext({ id: "1", role: "USER" });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        "Access denied. Required roles: ADMIN"
      );
    });

    it("should throw ForbiddenException when user is not authenticated", () => {
      reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        "User not authenticated"
      );
    });

    it("should use ROLES_KEY for metadata lookup", () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockExecutionContext({ id: "1", role: "USER" });
      const handler = jest.fn();
      const classRef = jest.fn();

      jest.spyOn(context, "getHandler").mockReturnValue(handler);
      jest
        .spyOn(context, "getClass")
        .mockReturnValue(
          classRef as unknown as new (...args: unknown[]) => unknown
        );

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        handler,
        classRef,
      ]);
    });
  });
});
