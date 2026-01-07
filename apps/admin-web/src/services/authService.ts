export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: User;
}

export interface LogoutResponse {
  success: boolean;
}

export interface AuthError {
  message: string;
  statusCode?: number;
}

export class AuthService {
  constructor(private apiUrl: string) {}

  async login(email: string, password: string): Promise<User> {
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

    const data: LoginResponse = await response.json();
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
  }

  async checkAuth(): Promise<User> {
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

    const data: LoginResponse = await response.json();
    return data.user;
  }
}
