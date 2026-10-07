import { commitState, defaultState } from "./demo-store";

export { appVersion } from "../../data/app";

/** Restablece la app al estado demo inicial (datos locales). */
export async function resetApp(): Promise<void> {
  commitState(() => defaultState());
}
