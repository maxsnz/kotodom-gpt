export abstract class SettingsRepository {
  abstract getSetting(key: string): Promise<string | null>;
  abstract setSetting(key: string, value: string): Promise<void>;
}

