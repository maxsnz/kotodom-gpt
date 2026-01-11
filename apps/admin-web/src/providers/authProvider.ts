import type { AuthProvider } from "@refinedev/core";
import { AuthService } from "../services/authService";
import type { LoginResponse } from "@shared/contracts/auth";
import { config } from "../../config";

interface LoginParams {
  email: string;
  password: string;
}

export const createAuthProvider = (apiUrl: string): AuthProvider => {
  const authService = new AuthService(apiUrl);

  // Store authenticated user in memory (for this session)
  let currentUser: LoginResponse["user"] | null = null;

  return {
    login: async (params: LoginParams) => {
      try {
        const { email, password } = params;
        const user = await authService.login(email, password);
        currentUser = user;
        return {
          success: true,
          redirectTo: config.basePath,
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Login failed";
        return {
          success: false,
          error: {
            message,
            name: "Login Error",
          },
        };
      }
    },

    logout: async () => {
      try {
        await authService.logout();
        currentUser = null;
        return {
          success: true,
          redirectTo: `${config.basePath}/login`,
        };
      } catch (error: any) {
        // Even if logout fails, clear local state and redirect
        currentUser = null;
        return {
          success: true,
          redirectTo: `${config.basePath}/login`,
        };
      }
    },

    check: async () => {
      try {
        // Check if we have a valid session
        const user = await authService.checkAuth();
        currentUser = user;
        return {
          authenticated: true,
        };
      } catch (error) {
        currentUser = null;
        return {
          authenticated: false,
          redirectTo: `${config.basePath}/login`,
        };
      }
    },

    getIdentity: async () => {
      if (!currentUser) {
        return null;
      }

      return {
        id: currentUser.id,
        name: currentUser.email,
        avatar: undefined,
      };
    },

    onError: async (error) => {
      // Handle auth-related errors
      if (error?.statusCode === 401 || error?.status === 401) {
        currentUser = null;
        return {
          redirectTo: `${config.basePath}/login`,
          logout: true,
        };
      }

      return {};
    },

    // Optional: register method if needed in the future
    register: async () => {
      return {
        success: false,
        error: {
          message: "Registration not implemented",
          name: "Not Implemented",
        },
      };
    },

    // Optional: forgotPassword method if needed in the future
    forgotPassword: async () => {
      return {
        success: false,
        error: {
          message: "Forgot password not implemented",
          name: "Not Implemented",
        },
      };
    },

    // Optional: updatePassword method if needed in the future
    updatePassword: async () => {
      return {
        success: false,
        error: {
          message: "Update password not implemented",
          name: "Not Implemented",
        },
      };
    },
  };
};
