import { SettingsRepository } from "../../../domain/settings/SettingsRepository";
import { prisma } from "../prisma/client";

export class SettingsRepositoryPrisma extends SettingsRepository {
  async getSetting(key: string) {
    const setting = await prisma.setting.findUnique({
      where: { id: key },
    });
    return setting?.value ?? "";
  }

  async setSetting(key: string, value: string) {
    await prisma.setting.upsert({
      where: { id: key },
      update: { value },
      create: { id: key, value },
    });
  }

  async getAllSettings() {
    const settings = await prisma.setting.findMany();
    return settings.map((setting) => ({
      id: setting.id,
      value: setting.value ?? "",
    }));
  }

  async deleteSetting(key: string) {
    await prisma.setting.delete({
      where: { id: key },
    });
  }
}

