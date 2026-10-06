import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Input, PasswordInput, Checkbox } from "../components/ui/Input";
import { Icon } from "../components/ui/Icon";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

const GAMES = ["FIFA26", "VALORANT", "LOL", "MINECRAFT", "FORTNITE", "TEKKEN 8", "E FOOTBALL"];

export function Registro() {
  const navigate = useNavigate();
  const { signIn } = useApp();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [games, setGames] = useState<string[]>([]);
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  function toggleGame(g: string) {
    setGames((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function next() {
    if (step === 1) {
      if (name.trim().length < 2) return setError("Escribe tu nombre de usuario");
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Ingresa un correo válido");
      setError(undefined);
      setStep(2);
      return;
    }
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    if (games.length === 0) return setError("Selecciona al menos un juego");
    if (!accept) return setError("Debes aceptar los términos y condiciones");
    setError(undefined);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      signIn();
      toast.success("¡Cuenta creada! Bienvenido a GAMERT");
      navigate("/home", { replace: true });
    }, 1000);
  }

  return (
    <Screen className="auth" scroll={false}>
      <AppBar
        borderless
        onBack={() => (step === 1 ? navigate(-1) : setStep(1))}
        title={step === 1 ? "Crear cuenta" : "Tus juegos"}
      />

      <div className="steps" aria-label={`Paso ${step} de 2`}>
        <span className="steps__bar">
          <span className="steps__fill" style={{ width: step === 1 ? "50%" : "100%" }} />
        </span>
        <span className="steps__label">Paso {step} de 2</span>
      </div>

      {step === 1 ? (
        <div className="auth__form">
          <Input
            label="Nombre de usuario"
            placeholder="Ej. T1 COTILLO"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="nickname"
          />
          <Input
            label="Alias"
            placeholder="@alias"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          {error && (
            <p className="auth__error">
              <Icon name="alertCircle" size={16} />
              {error}
            </p>
          )}

          <Button size="lg" block onClick={next}>
            Continuar
          </Button>
        </div>
      ) : (
        <div className="auth__form">
          <p className="auth__sub u-center">Elige los juegos que quieres competir en.</p>

          <div className="gameselect">
            {GAMES.map((g) => (
              <button
                key={g}
                type="button"
                className={games.includes(g) ? "gameselect__item is-on" : "gameselect__item"}
                onClick={() => toggleGame(g)}
              >
                <span className="gameselect__icon">
                  <Icon name="gamepad" size={18} />
                </span>
                <span className="gameselect__name">{g}</span>
                {games.includes(g) && <Icon name="check" size={16} strokeWidth={3} />}
              </button>
            ))}
          </div>

          <Checkbox
            checked={accept}
            onChange={setAccept}
            label={
              <>
                Acepto los <span className="u-link">términos y condiciones</span> y la{" "}
                <span className="u-link">política de privacidad</span>.
              </>
            }
          />

          {error && (
            <p className="auth__error">
              <Icon name="alertCircle" size={16} />
              {error}
            </p>
          )}

          <Button size="lg" block loading={loading} onClick={next}>
            Crear cuenta
          </Button>
        </div>
      )}

      <p className="auth__foot">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </Screen>
  );
}
