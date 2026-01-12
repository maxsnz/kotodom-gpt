import { Injectable, Inject } from "@nestjs/common";
import { SettingsRepository, SettingItem } from "../../domain/settings/SettingsRepository";

/**
 * Service for Settings management
 */
@Injectable()
export class SettingsService {
  constructor(
    @Inject(SettingsRepository)
    private readonly settingsRepository: SettingsRepository
  ) {}

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<SettingItem[]> {
    return this.settingsRepository.getAllSettings();
  }

  /**
   * Create or update multiple settings
   */
  async setSettings(settings: Record<string, string>): Promise<void> {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.settingsRepository.setSetting(key, value)
    );
    await Promise.all(promises);
  }

  /**
   * Get a single setting by key
   */
  async getSetting(key: string): Promise<string> {
    return this.settingsRepository.getSetting(key);
  }

  /**
   * Set a single setting
   */
  async setSetting(key: string, value: string): Promise<void> {
    return this.settingsRepository.setSetting(key, value);
  }

  /**
   * Delete a single setting by key
   */
  async deleteSetting(key: string): Promise<void> {
    return this.settingsRepository.deleteSetting(key);
  }
}
