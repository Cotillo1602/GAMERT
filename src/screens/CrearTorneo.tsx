import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Input, Toggle } from "../components/ui/Input";
import { Icon, type IconName } from "../components/ui/Icon";
import { Chip } from "../components/ui/Display";
import { useCreateTournament, useElo, useGames, useProfile } from "../lib/api/hooks";
import type { GameId } from "../lib/api/games";
import {
  FORMAT_LABELS,
  todayISO,
  type Format,
  type Prize,
  type Rules,
} from "../lib/api/tournaments";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/layout/Toast";
import { eloTier } from "../lib/elo";
import "../styles/screens.css";
import "../styles/organizer.css";

/* ============================================================
   El organizador declara: qué torneo, con qué reglas y qué premio.
   La app se ocupa de la siembra, el cuadro, los horarios y el ELO.
   ============================================================ */

const FORMATS: Format[] = ["eliminacion", "grupos", "suizo", "doble_eliminacion"];

export function CrearTorneo() {
  const navigate = useNavigate();
  const { userId } = useApp();
  const toast = useToast();

  const { data: me } = useProfile(userId);
  const { data: games = [] } = useGames();
  const create = useCreateTournament();

  const myOrganizer = me?.organizer;
  const verified = myOrganizer?.verifiedPrizes ?? false;

  const [name, setName] = useState("");
  const [gameId, setGameId] = useState<GameId>("fifa26");
  const [format, setFormat] = useState<Format>("eliminacion");
  const [modality, setModality] = useState<"Virtual" | "Presencial">("Virtual");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("20:00");
  const [slots, setSlots] = useState(16);

  const [prizeKind, setPrizeKind] = useState<Prize["kind"]>("ninguno");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [split, setSplit] = useState<[number, number, number]>([60, 25, 15]);

  const [minElo, setMinElo] = useState(1200);
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [disputeWindow, setDisputeWindow] = useState(24);
  const [autoForfeit, setAutoForfeit] = useState(true);
  const [bestOf, setBestOf] = useState<1 | 3 | 5>(3);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<string[]>([]);

  const amount = Number(prizeAmount) || 0;
  const prizeTotal = Math.round((amount * split[0]) / 100);
  const cashBlocked = prizeKind === "efectivo" && amount > 0 && !verified;

  const { data: suggestedElo } = useElo(userId, gameId);
  const eloRating = suggestedElo?.rating ?? 0;

  function validateStep1(): string[] {
    const e: string[] = [];
    if (name.trim().length < 4) e.push("El nombre del torneo debe tener al menos 4 caracteres.");
    if (!date) e.push("Elegí una fecha.");
    if (slots < 4 || slots > 64) e.push("Las cupas deben estar entre 4 y 64.");
    if (cashBlocked) e.push("Tu cuenta no está habilitada para premios en efectivo.");
    return e;
  }

  function validateStep2(): string[] {
    const e: string[] = [];
    if (prizeKind !== "ninguno" && amount <= 0)
      e.push("Indicá el monto del premio o elegí «Sin premio».");
    const sum = split[0] + split[1] + split[2];
    if (prizeKind !== "ninguno" && amount > 0 && sum !== 100)
      e.push(`El reparto debe sumar 100% (actual: ${sum}%).`);
    if (minElo > eloRating) {
      e.push(
        `Tu ELO en ${gameId.toUpperCase()} es ${eloRating}; un mínimo de ${minElo} te dejaría sin jugadores elegibles.`,
      );
    }
    return e;
  }

  function next() {
    const e = validateStep1();
    setErrors(e);
    if (e.length === 0) setStep(2);
  }

  function publish() {
    const e = validateStep2();
    setErrors(e);
    if (e.length > 0) return;

    const rules: Rules = {
      minElo,
      maxParticipants: slots,
      requireConfirmation,
      disputeWindowMin: disputeWindow,
      autoForfeitOnDisconnect: autoForfeit,
      bestOf,
      notes: notes.trim(),
    };

    const prize: Prize =
      prizeKind === "ninguno" || amount <= 0
        ? { amount: 0, currency: "USD", kind: "ninguno", split: [0, 0, 0] }
        : { amount, currency: "USD", kind: prizeKind, split };

    create.mutate(
      { name, gameId, format, modality, date, time, slots, prize, rules },
      {
        onSuccess: (id) => {
          toast.success("Torneo publicado. La app gestiona el cuadro.");
          navigate(`/torneo/${id}`);
        },
      },
    );
  }

  return (
    <Screen padded={false} scroll={false}>
      <AppBar
        onBack={() => (step === 1 ? navigate(-1) : setStep(1))}
        title="Nuevo torneo"
        subtitle={`Paso ${step} de 2`}
      />

      <div className="stepper">
        <span className={step >= 1 ? "stepper__dot is-on" : "stepper__dot"}>1</span>
        <span className={step === 1 ? "stepper__line is-on" : "stepper__line"} />
        <span className={step >= 2 ? "stepper__dot is-on" : "stepper__dot"}>2</span>
      </div>

      <div className="screen__body--pad screen__scroll">
        {step === 1 ? (
          <>
            <Input
              label="Nombre del torneo"
              placeholder="Ej. TORNEO NOCTURNO"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="field">
              <span className="field__label">Juego</span>
              <div className="gameselect">
                {games.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={gameId === g.id ? "gameselect__item is-on" : "gameselect__item"}
                    onClick={() => setGameId(g.id)}
                  >
                    <span className="gameselect__icon" style={{ color: g.accent }}>
                      <Icon name={g.icon} size={18} />
                    </span>
                    <span className="gameselect__name">{g.name}</span>
                    {gameId === g.id && <Icon name="check" size={16} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="field__label">Formato</span>
              <div className="chips">
                {FORMATS.map((f) => (
                  <Chip key={f} active={format === f} onClick={() => setFormat(f)}>
                    {FORMAT_LABELS[f]}
                  </Chip>
                ))}
              </div>
              <p className="field__msg">La app arma el cuadro y los horarios según el formato.</p>
            </div>

            <div className="field">
              <span className="field__label">Modalidad</span>
              <div className="chips">
                {(["Virtual", "Presencial"] as const).map((m) => (
                  <Chip key={m} active={modality === m} onClick={() => setModality(m)}>
                    {m}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="grid2">
              <Input
                label="Fecha"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                label="Hora"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <Input
              label="Cupas"
              type="number"
              min={4}
              max={64}
              value={String(slots)}
              onChange={(e) => setSlots(Number(e.target.value))}
              hint="La app siembra por ELO: los mejores contra los mejores."
            />
          </>
        ) : (
          <>
            <section className="rulescard">
              <div className="rulescard__head">
                <Icon name="trophy" size={18} />
                <span className="u-uppercase">Premio</span>
              </div>

              <div className="chips">
                {(["ninguno", "creditos", "efectivo"] as const).map((k) => (
                  <Chip key={k} active={prizeKind === k} onClick={() => setPrizeKind(k)}>
                    {k === "ninguno" ? "Sin premio" : k === "creditos" ? "Créditos" : "Efectivo"}
                  </Chip>
                ))}
              </div>

              {!verified && (
                <p className="rulescard__note">
                  <Icon name="alertTriangle" size={15} />
                  Tu cuenta es de comunidad: podés crear torneos con premios en{" "}
                  <strong>créditos</strong>. El pago en efectivo requiere verificación (ELO alto +
                  historial sin disputas).
                </p>
              )}

              {prizeKind !== "ninguno" && (
                <>
                  <Input
                    label="Monto total"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={prizeAmount}
                    onChange={(e) => setPrizeAmount(e.target.value)}
                    hint={
                      !verified && prizeKind === "efectivo" ? "Requiere verificación" : undefined
                    }
                  />

                  <div className="field">
                    <span className="field__label">Reparto</span>
                    <div className="splitrow">
                      {(["1º puesto", "2º puesto", "3º puesto"] as const).map((label, i) => (
                        <label key={label} className="splitrow__cell">
                          <span className="splitrow__label">{label}</span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={split[i]}
                            onChange={(e) => {
                              const next = [...split] as [number, number, number];
                              next[i] = Number(e.target.value);
                              setSplit(next);
                            }}
                          />
                          <span className="splitrow__pct">%</span>
                        </label>
                      ))}
                    </div>
                    {amount > 0 && (
                      <p className="field__msg">
                        El ganador se lleva {prizeKind === "efectivo" ? "$" : ""}
                        {prizeTotal} de ${amount}
                      </p>
                    )}
                  </div>
                </>
              )}
            </section>

            <section className="rulescard">
              <div className="rulescard__head">
                <Icon name="shield" size={18} />
                <span className="u-uppercase">Reglas</span>
              </div>

              <div className="field">
                <span className="field__label">
                  ELO mínimo ·{" "}
                  <span style={{ color: "var(--c-secondary)" }}>tu ELO es {eloRating}</span>
                </span>
                <input
                  type="range"
                  min={100}
                  max={2400}
                  step={50}
                  value={minElo}
                  onChange={(e) => setMinElo(Number(e.target.value))}
                  className="slider"
                />
                <p className="field__msg">
                  Tu nivel actual: <strong>{eloTier(eloRating).label}</strong>
                </p>
              </div>

              <div className="field">
                <span className="field__label">Formato de partida</span>
                <div className="chips">
                  {([1, 3, 5] as const).map((b) => (
                    <Chip key={b} active={bestOf === b} onClick={() => setBestOf(b)}>
                      Al mejor de {b}
                    </Chip>
                  ))}
                </div>
              </div>

              <RuleToggle
                icon="checkCircle"
                label="Confirmación de resultados"
                caption="El rival debe confirmar antes de que el ELO se mueva"
                checked={requireConfirmation}
                onChange={setRequireConfirmation}
              />
              <RuleToggle
                icon="clock"
                label="Ventana de impugnación"
                caption={`El resultado se confirma solo a las ${disputeWindow}h`}
                checked={requireConfirmation}
                onChange={() => {}}
                disabled
              >
                <div className="chips chips--tight">
                  {[12, 24, 48].map((h) => (
                    <Chip key={h} active={disputeWindow === h} onClick={() => setDisputeWindow(h)}>
                      {h}h
                    </Chip>
                  ))}
                </div>
              </RuleToggle>
              <RuleToggle
                icon="alertTriangle"
                label="Forfeit por desconexión"
                caption="Si un jugador se desconecta, la app da la partida al rival"
                checked={autoForfeit}
                onChange={setAutoForfeit}
              />

              <div className="field">
                <span className="field__label">Notas adicionales</span>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Ej. Prohibido el uso de smurfs. Grabación de partida obligatoria."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </section>

            <div className="managednote">
              <Icon name="layers" size={18} />
              <div>
                <strong>La app gestiona el resto</strong>
                <p>
                  Siembra por ELO, emparejamientos, horarios, cuadro, confirmación de resultados,
                  disputas y cálculo de premios. Vos solo definís las reglas y el premio.
                </p>
              </div>
            </div>
          </>
        )}

        {errors.length > 0 && (
          <div className="errbox">
            {errors.map((e) => (
              <p key={e}>
                <Icon name="alertCircle" size={15} />
                {e}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="actionbar">
        <Button
          block
          size="md"
          onClick={step === 1 ? next : publish}
          iconRight={step === 1 ? "arrowRight" : "trophy"}
        >
          {step === 1 ? "Continuar" : "Publicar torneo"}
        </Button>
      </div>
    </Screen>
  );
}

function RuleToggle({
  icon,
  label,
  caption,
  checked,
  onChange,
  disabled,
  children,
}: {
  icon: IconName;
  label: string;
  caption: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="ruleline">
      <div className="ruleline__head">
        <Icon name={icon} size={18} />
        <div className="ruleline__body">
          <span className="ruleline__label">{label}</span>
          <span className="ruleline__caption">{caption}</span>
        </div>
        <Toggle checked={checked} onChange={onChange} label={label} />
      </div>
      {children && !disabled && <div className="ruleline__extra">{children}</div>}
    </div>
  );
}
