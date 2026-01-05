import { User } from "./User";
import { UserRole, UserStatus } from "./types";

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: UserRole;
  status?: UserStatus;
}

export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * Abstract repository for User persistence
 */
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract create(data: CreateUserData): Promise<User>;
  abstract update(id: string, data: UpdateUserData): Promise<User>;
  abstract delete(id: string): Promise<void>;
  abstract save(user: User): Promise<void>;
}
