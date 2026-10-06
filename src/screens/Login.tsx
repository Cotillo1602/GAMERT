import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Logo, Screen } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { PasswordInput } from "../components/ui/Input";
import { Icon } from "../components/ui/Icon";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useApp();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError("Ingresa tu correo electrónico");
    if (password.length < 4) return setError("La contraseña debe tener al menos 4 caracteres");
    setError(undefined);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      signIn();
      toast.success("Bienvenido de nuevo");
      navigate("/home", { replace: true });
    }, 900);
  }

  return (
    <Screen className="auth" scroll={false}>
      <AppBar borderless logo={false} onBack={() => navigate(-1)} />

      <div className="auth__head">
        <Logo size={56} />
        <h1 className="auth__title">Inicia sesión</h1>
        <p className="auth__sub">Entra a tu cuenta para seguir compitiendo.</p>
      </div>

      <form className="auth__form" onSubmit={submit} noValidate>
        <PasswordInput
          label="Correo electrónico"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="auth__error">
            <Icon name="alertCircle" size={16} />
            {error}
          </p>
        )}

        <Button type="submit" size="lg" block loading={loading}>
          Iniciar sesión
        </Button>

        <button type="button" className="auth__forgot">
          ¿Olvidaste tu contraseña?
        </button>

        <div className="auth__divider">
          <span>o continúa con</span>
        </div>

        <div className="auth__socials">
          <button className="socialbtn" type="button" aria-label="Continuar con Google">
            <Icon name="google" size={19} />
          </button>
          <button className="socialbtn" type="button" aria-label="Continuar con Facebook">
            <Icon name="facebook" size={19} />
          </button>
          <button className="socialbtn" type="button" aria-label="Continuar con Apple">
            <Icon name="apple" size={19} />
          </button>
        </div>
      </form>

      <p className="auth__foot">
        ¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </Screen>
  );
}
