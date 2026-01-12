import { SettingsRepository, SettingItem } from "../../../domain/settings/SettingsRepository";
import { prisma } from "../prisma/client";

export class SettingsRepositoryPrisma extends SettingsRepository {
  async getSetting(key: string): Promise<string> {
    const setting = await prisma.setting.findUnique({
      where: { id: key },
    });
    return setting?.value ?? "";
  }

  async setSetting(key: string, value: string): Promise<void> {
    await prisma.setting.upsert({
      where: { id: key },
      update: { value },
      create: { id: key, value },
    });
  }

  async getAllSettings(): Promise<SettingItem[]> {
    const settings = await prisma.setting.findMany();
    return settings.map((setting) => ({
      id: setting.id,
      value: setting.value ?? "",
    }));
  }

  async deleteSetting(key: string): Promise<void> {
    await prisma.setting.delete({
      where: { id: key },
    });
  }
}

