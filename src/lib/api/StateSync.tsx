import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { autoStartDue } from "./scheduler";
import { onStateChanged } from "./demo-store";

/**
 * Sincroniza la caché de queries con el demo-store: cada `commitState`
 * publica `gamert:state-changed` y aquí invalidamos las lecturas para que
 * cualquier pantalla refleje el estado vivo al instante (mismo comportamiento
 * que tenía el AppContext al rehidratarse). También dispara el auto-start de
 * torneos vencidos (siembra + cuadro), que antes vivía en el AppContext.
 */
export function StateSync(): null {
  const qc = useQueryClient();
  useEffect(() => {
    const off = onStateChanged(() => {
      autoStartDue();
      qc.invalidateQueries();
    });
    autoStartDue();
    return off;
  }, [qc]);
  return null;
}
