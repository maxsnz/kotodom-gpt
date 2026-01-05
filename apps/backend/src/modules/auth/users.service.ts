import { Injectable, Inject } from "@nestjs/common";
import * as argon2 from "argon2";
import { UserRepository } from "../../domain/users/UserRepository";
import { User } from "../../domain/users/User";
import { UserRole, UserStatus } from "../../domain/users/types";

export interface UpdateUserInput {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * Service for user management and credential validation
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Validate user credentials
   * @returns User if credentials are valid, null otherwise
   */
  async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    // Check if user is active
    if (!user.isActive()) {
      return null;
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  /**
   * Create a new user with hashed password
   */
  async createUser(
    email: string,
    password: string,
    role: UserRole
  ): Promise<User> {
    const passwordHash = await argon2.hash(password);
    return this.userRepository.create({
      email,
      passwordHash,
      role,
    });
  }

  /**
   * Update user properties (email, role, status)
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    return this.userRepository.update(id, data);
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, newPassword: string): Promise<User> {
    const passwordHash = await argon2.hash(newPassword);
    return this.userRepository.update(id, { passwordHash });
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }

  /**
   * Hash a password using argon2
   */
  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }
}
