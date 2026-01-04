import { SettingsRepository } from "../../../domain/settings/SettingsRepository";
import { prisma } from "../prisma/client";

export class SettingsRepositoryPrisma extends SettingsRepository {
  async getSetting(key: string): Promise<string | null> {
    const setting = await prisma.setting.findUnique({
      where: { id: key },
    });
    return setting?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await prisma.setting.upsert({
      where: { id: key },
      update: { value },
      create: { id: key, value },
    });
  }
}

