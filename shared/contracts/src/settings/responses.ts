/**
 * Setting item type
 */
export interface SettingItem {
  id: string;
  value: string;
}

/**
 * Response type for GET /api/settings
 */
export interface SettingsResponse {
  data: SettingItem[];
}
