export interface SettingItem {
  id: string;
  value: string;
}

export abstract class SettingsRepository {
  abstract getSetting(key: string): Promise<string>;
  abstract setSetting(key: string, value: string): Promise<void>;
  abstract getAllSettings(): Promise<SettingItem[]>;
}





