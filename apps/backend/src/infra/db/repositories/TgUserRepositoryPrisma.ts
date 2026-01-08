import {
  TgUserRepository,
  UpdateTgUserData,
} from "../../../domain/tg-users/TgUserRepository";
import { TgUser as DomainTgUser } from "../../../domain/tg-users/TgUser";
import type { TgUser as PrismaTgUser } from "../prisma/generated/client";
import { prisma } from "../prisma/client";

/**
 * Prisma implementation of TgUserRepository
 */
export class TgUserRepositoryPrisma extends TgUserRepository {
  async findById(id: bigint): Promise<DomainTgUser | null> {
    const row = await prisma.tgUser.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<DomainTgUser[]> {
    const rows = await prisma.tgUser.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async update(id: bigint, data: UpdateTgUserData): Promise<DomainTgUser> {
    const row = await prisma.tgUser.update({
      where: { id },
      data: {
        ...(data.username !== undefined && { username: data.username }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.fullName !== undefined && { fullName: data.fullName }),
      },
    });
    return this.toDomain(row);
  }

  async delete(id: bigint): Promise<void> {
    await prisma.tgUser.delete({ where: { id } });
  }

  private toDomain(row: PrismaTgUser): DomainTgUser {
    return new DomainTgUser({
      id: row.id,
      username: row.username,
      name: row.name,
      fullName: row.fullName,
      createdAt: row.createdAt,
    });
  }
}