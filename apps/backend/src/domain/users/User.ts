import { UserRole, UserStatus } from "./types";

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User domain entity representing an admin panel user
 */
export class User {
  constructor(private readonly props: UserProps) {}

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Check if user account is active
   */
  isActive(): boolean {
    return this.props.status === "ACTIVE";
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    return this.props.role === "ADMIN";
  }
}
