import {
  UserRepository,
  CreateUserData,
  UpdateUserData,
} from "../../../domain/users/UserRepository";
import { User as DomainUser } from "../../../domain/users/User";
import { UserRole, UserStatus } from "../../../domain/users/types";
import type { User as PrismaUser } from "../prisma/generated/client";
import { prisma } from "../prisma/client";

/**
 * Prisma implementation of UserRepository
 */
export class UserRepositoryPrisma extends UserRepository {
  async findById(id: string): Promise<DomainUser | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<DomainUser | null> {
    const row = await prisma.user.findUnique({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<DomainUser[]> {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async create(data: CreateUserData): Promise<DomainUser> {
    const row = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        status: data.status ?? "ACTIVE",
      },
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateUserData): Promise<DomainUser> {
    const row = await prisma.user.update({
      where: { id },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.passwordHash !== undefined && {
          passwordHash: data.passwordHash,
        }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  async save(user: DomainUser): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        status: user.status,
      },
    });
  }

  private toDomain(row: PrismaUser): DomainUser {
    return new DomainUser({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as UserRole,
      status: row.status as UserStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
