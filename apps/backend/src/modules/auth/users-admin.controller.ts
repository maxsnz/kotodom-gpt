import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

import { UsersService, UpdateUserInput } from "./users.service";
import { SessionAuthGuard } from "./guards/session-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { Roles } from "./decorators/roles.decorator";
import { UserRole, UserStatus } from "../../domain/users/types";
import { ZodValidationPipe } from "../../common/pipes";
import {
  CreateUserSchema,
  type CreateUserDto,
  UpdateUserSchema,
  type UpdateUserDto,
} from "./dto";

/**
 * User response DTO - hides sensitive passwordHash field
 */
interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

@Controller("api/users")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles("ADMIN")
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/users - List all users
   */
  @Get()
  async listUsers(): Promise<{ users: UserResponse[] }> {
    const users = await this.usersService.findAll();
    return { users: users.map(this.toUserResponse) };
  }

  /**
   * GET /api/users/:id - Get user by ID
   */
  @Get(":id")
  async getUser(@Param("id") id: string): Promise<{ user: UserResponse }> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return { user: this.toUserResponse(user) };
  }

  /**
   * POST /api/users - Create new user
   */
  @Post()
  async createUser(
    @Body(new ZodValidationPipe(CreateUserSchema)) input: CreateUserDto
  ): Promise<{ user: UserResponse }> {
    // Check if email already exists
    const existing = await this.usersService.findByEmail(input.email);
    if (existing) {
      throw new ConflictException("Email already in use");
    }

    const user = await this.usersService.createUser(
      input.email,
      input.password,
      input.role
    );
    return { user: this.toUserResponse(user) };
  }

  /**
   * PUT /api/users/:id - Update user
   */
  @Put(":id")
  async updateUser(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) input: UpdateUserDto
  ): Promise<{ user: UserResponse }> {
    const existingUser = await this.usersService.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // If email is being changed, check for conflicts
    if (input.email && input.email !== existingUser.email) {
      const emailTaken = await this.usersService.findByEmail(input.email);
      if (emailTaken) {
        throw new ConflictException("Email already in use");
      }
    }

    // Update user properties
    const updateData: UpdateUserInput = {};
    if (input.email !== undefined) updateData.email = input.email;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.status !== undefined) updateData.status = input.status;

    let user = existingUser;

    // Update properties if any provided
    if (Object.keys(updateData).length > 0) {
      user = await this.usersService.updateUser(id, updateData);
    }

    // Update password separately if provided (validation is done by Zod schema)
    if (input.password) {
      user = await this.usersService.updatePassword(id, input.password);
    }

    return { user: this.toUserResponse(user) };
  }

  /**
   * DELETE /api/users/:id - Delete user
   */
  @Delete(":id")
  async deleteUser(@Param("id") id: string): Promise<{ success: boolean }> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.usersService.deleteUser(id);
    return { success: true };
  }

  private toUserResponse(user: {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
