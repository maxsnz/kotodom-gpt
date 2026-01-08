import { TgUser } from "./TgUser";

export interface UpdateTgUserData {
  username?: string | null;
  name?: string | null;
  fullName?: string | null;
}

/**
 * Abstract repository for TgUser persistence
 */
export abstract class TgUserRepository {
  abstract findById(id: bigint): Promise<TgUser | null>;
  abstract findAll(): Promise<TgUser[]>;
  abstract update(id: bigint, data: UpdateTgUserData): Promise<TgUser>;
  abstract delete(id: bigint): Promise<void>;
}
