import { Screen } from "../components/layout/Layout";
import { Logo } from "../components/layout/Layout";
import "../styles/screens.css";

export function Cargando() {
  return (
    <Screen padded={false} scroll={false}>
      <div className="cargando">
        <Logo size={64} />
        <span className="cargando__spin" aria-hidden />
        <p className="cargando__text u-uppercase">Generando cuadro</p>
      </div>
    </Screen>
  );
}
