import { Injectable, Inject } from "@nestjs/common";
import { TgUserRepository, UpdateTgUserData } from "../../domain/tg-users/TgUserRepository";
import { TgUser } from "../../domain/tg-users/TgUser";

export interface UpdateTgUserInput {
  username?: string | null;
  name?: string | null;
  fullName?: string | null;
}

/**
 * Service for TgUser management
 */
@Injectable()
export class TgUsersService {
  constructor(
    @Inject(TgUserRepository)
    private readonly tgUserRepository: TgUserRepository
  ) {}

  /**
   * Find TgUser by ID
   */
  async findById(id: bigint): Promise<TgUser | null> {
    return this.tgUserRepository.findById(id);
  }

  /**
   * Find all TgUsers
   */
  async findAll(): Promise<TgUser[]> {
    return this.tgUserRepository.findAll();
  }

  /**
   * Update TgUser properties
   */
  async updateTgUser(id: bigint, data: UpdateTgUserInput): Promise<TgUser> {
    const updateData: UpdateTgUserData = {
      ...(data.username !== undefined && { username: data.username }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.fullName !== undefined && { fullName: data.fullName }),
    };

    return this.tgUserRepository.update(id, updateData);
  }

  /**
   * Delete TgUser by ID
   */
  async deleteTgUser(id: bigint): Promise<void> {
    return this.tgUserRepository.delete(id);
  }
}