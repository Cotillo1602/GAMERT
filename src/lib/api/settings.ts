import { commitState, loadState, type Settings } from "./demo-store";
import { isDemoMode } from "./utils";

export interface SettingsPatch {
  profile_private?: boolean;
  security_and_password?: boolean;
  sounds?: boolean;
  language?: boolean;
  push_notifications?: boolean;
}

const KEYS: Record<keyof SettingsPatch, keyof Settings> = {
  profile_private: "profilePrivate",
  security_and_password: "securityAndPassword",
  sounds: "sounds",
  language: "language",
  push_notifications: "pushNotifications",
};

export async function getSettings(): Promise<Settings> {
  return loadState().settings;
}

export async function updateSetting(patch: SettingsPatch): Promise<void> {
  if (!isDemoMode()) return;
  commitState((s) => {
    const settings: Settings = { ...s.settings };
    for (const [raw, value] of Object.entries(patch)) {
      const key = KEYS[raw as keyof SettingsPatch];
      if (key && typeof value === "boolean") settings[key] = value;
    }
    return { ...s, settings };
  });
}
