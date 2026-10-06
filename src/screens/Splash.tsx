import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Screen, Logo } from "../components/layout/Layout";
import "../styles/screens.css";

export function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const out = window.setTimeout(() => setLeaving(true), 1500);
    const go = window.setTimeout(() => navigate("/login", { replace: true }), 2000);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(go);
    };
  }, [navigate]);

  return (
    <Screen className={leaving ? "is-leaving" : ""}>
      <div className="splash">
        <div className="splash__logo">
          <Logo size={92} />
        </div>
        <p className="splash__tag">Competencias.&nbsp;Comunidad.&nbsp;Gloria.</p>
        <div className="splash__loader" role="progressbar" aria-label="Cargando">
          <span />
        </div>
        <p className="splash__version">v1.0.0</p>
      </div>
    </Screen>
  );
}
