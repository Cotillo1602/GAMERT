import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onStateChanged } from "./demo-store";

/**
 * Sincroniza la caché de queries con el demo-store: cada `commitState`
 * publica `gamert:state-changed` y aquí invalidamos las lecturas para que
 * cualquier pantalla refleje el estado vivo al instante (mismo comportamiento
 * que tenía el AppContext al rehidratarse).
 */
export function StateSync(): null {
  const qc = useQueryClient();
  useEffect(
    () =>
      onStateChanged(() => {
        qc.invalidateQueries();
      }),
    [qc],
  );
  return null;
}
