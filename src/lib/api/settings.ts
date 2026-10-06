import { isDemoMode } from "./utils";

export interface SettingsPatch {
  profile_private?: boolean;
  security_and_password?: boolean;
  sounds?: boolean;
  language?: boolean;
  push_notifications?: boolean;
}

export async function updateSetting(_patch: SettingsPatch): Promise<void> {
  if (isDemoMode()) return Promise.resolve();
  return Promise.resolve();
}
