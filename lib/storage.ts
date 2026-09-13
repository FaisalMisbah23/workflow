import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "@workflow_settings";

export interface AppSettings {
  notifications: {
    email: boolean;
    push: boolean;
    taskUpdates: boolean;
    deadlineReminders: boolean;
  };
  darkMode: boolean;
  language: "en" | "es";
}

const defaultSettings: AppSettings = {
  notifications: {
    email: true,
    push: true,
    taskUpdates: true,
    deadlineReminders: true,
  },
  darkMode: false,
  language: "en",
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return { ...defaultSettings, ...JSON.parse(json) };
    }
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
};

export const updateSetting = async <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
): Promise<AppSettings> => {
  const current = await getSettings();
  const updated = { ...current, [key]: value };
  await saveSettings(updated);
  return updated;
};
