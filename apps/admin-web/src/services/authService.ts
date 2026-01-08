import {
  LoginResponseSchema,
  LogoutResponseSchema,
} from "@shared/contracts/auth";
import { validateResponse } from "../utils/validateResponse";
import { LoginResponse } from "@shared/contracts/auth";

export class AuthService {
  constructor(private apiUrl: string) {}

  async login(email: string, password: string): Promise<LoginResponse["user"]> {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for session management
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Login failed: ${response.statusText}`
      );
    }

    const rawData = await response.json();
    const data = validateResponse(LoginResponseSchema, rawData);
    return data.user;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.apiUrl}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Logout failed: ${response.statusText}`
      );
    }

    const rawData = await response.json().catch(() => ({}));
    if (Object.keys(rawData).length > 0) {
      validateResponse(LogoutResponseSchema, rawData);
    }
  }

  async checkAuth(): Promise<LoginResponse["user"]> {
    const response = await fetch(`${this.apiUrl}/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Authentication check failed: ${response.statusText}`
      );
    }

    const rawData = await response.json();
    const data = validateResponse(LoginResponseSchema, rawData);
    return data.user;
  }
}
