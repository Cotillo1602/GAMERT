import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Avatar, SectionTitle, Divider, Badge } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { getPlayer } from "../data/players";
import { getGame } from "../data/games";
import { eloTier } from "../lib/elo";
import type { EloRecord } from "../lib/elo";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

/**
 * Reporte de resultado: el jugador que ganó reporta, el rival confirma.
 * Si no confirma dentro de la ventana de impugnación, la app lo confirma solo.
 */
export function Resultado() {
  const { id = "", matchId = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { tournamentById, brackets, reportResult, disputeResult, eloOf, userId } = useApp();
  const toast = useToast();

  const t = tournamentById(id);
  const match = brackets[id]?.find((m) => m.id === matchId);

  const [mine, setMine] = useState<"a" | "b" | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"report" | "dispute">(
    params.get("disputa") === "1" ? "dispute" : "report",
  );

  if (!t || !match) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Resultado" />
        <div className="screen__body--pad screen__scroll">
          <div className="empty">
            <span className="empty__icon">
              <Icon name="alertTriangle" size={26} />
            </span>
            <p className="empty__text">No encontramos esta partida.</p>
          </div>
        </div>
      </Screen>
    );
  }

  const g = getGame(t.gameId);
  const iAmA = match.a === userId;
  const iAmB = match.b === userId;
  const amParticipant = iAmA || iAmB;

  const bestOf = t.rules.bestOf;
  const need = Math.floor(bestOf / 2) + 1;
  const aWins = scoreA >= need;
  const bWins = scoreB >= need;
  /* El marcador siempre va orientado al cuadro (a = columnA), sin importar
     desde qué lado reporte el jugador. El ganador tiene que coincidir con
     el score, si no el bracket avanzaría al jugador equivocado. */
  const validScore =
    (aWins || bWins) && scoreA !== scoreB && mine !== null && (mine === "a") === aWins;

  function setScore(side: "a" | "b", value: number) {
    if (side === "a") setScoreA(value);
    else setScoreB(value);
    const nextA = (side === "a" ? value : scoreA) >= need;
    const nextB = (side === "b" ? value : scoreB) >= need;
    if (nextA !== nextB) setMine(nextA ? "a" : "b");
  }

  /** Elegir ganador deja el marcador en un resultado válido y listo para enviar. */
  function pickWinner(side: "a" | "b") {
    setMine(side);
    const own = side === "a" ? scoreA : scoreB;
    if (own >= need) return;
    const rival = Math.min(side === "a" ? scoreB : scoreA, need - 1);
    if (side === "a") {
      setScoreA(need);
      setScoreB(rival);
    } else {
      setScoreB(need);
      setScoreA(rival);
    }
  }

  function onReport() {
    if (mine === null) return toast.warning("Indicá quién ganó la partida");
    if (!validScore) return toast.warning(`En un Bo${bestOf} se gana con ${need} tantos`);
    reportResult({ matchId, scoreA, scoreB, reportedBy: userId });
    toast.success("Resultado enviado. Tu rival tiene que confirmarlo");
    navigate(`/torneo/${t!.id}/cuadro`);
  }

  function onDispute() {
    if (reason.trim().length < 10)
      return toast.warning("Contanos el motivo (mínimo 10 caracteres)");
    disputeResult(matchId, reason.trim());
    toast.success("Impugnación enviada");
    navigate(`/torneo/${t!.id}/cuadro`);
  }

  const myElo = eloOf(userId, t.gameId);

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Resultado" subtitle={t.name} />

      <div className="screen__body--pad screen__scroll">
        <div className="matchhead">
          <span className="matchhead__round">{match.roundLabel}</span>
          <span className="matchhead__game">
            <Icon name={g?.icon ?? "gamepad"} size={13} />
            {g?.name ?? t.gameId} · Bo{bestOf}
          </span>
        </div>

        <div className="versus">
          <Player name={getPlayer(match.a ?? "")?.name ?? "Por definir"} me={iAmA} score={scoreA} />
          <span className="versus__x">VS</span>
          <Player name={getPlayer(match.b ?? "")?.name ?? "Por definir"} me={iAmB} score={scoreB} />
        </div>

        {!amParticipant ? (
          <Badge tone="neutral" icon="eye">
            Sos espectador: podés ver el cuadro pero no reportar.
          </Badge>
        ) : (
          <div className="segmented">
            <button
              className={mode === "report" ? "segmented__item is-on" : "segmented__item"}
              onClick={() => setMode("report")}
            >
              Reportar
            </button>
            <button
              className={mode === "dispute" ? "segmented__item is-on" : "segmented__item"}
              onClick={() => setMode("dispute")}
            >
              Impugnar
            </button>
          </div>
        )}

        {mode === "report" && amParticipant && (
          <>
            <section>
              <SectionTitle>¿Quién ganó?</SectionTitle>
              <div className="winnerpick">
                <button
                  className={mine === "a" ? "winnerpick__btn is-on" : "winnerpick__btn"}
                  disabled={!iAmA && !iAmB}
                  onClick={() => pickWinner("a")}
                >
                  <Avatar name={getPlayer(match.a ?? "")?.name ?? "?"} size={44} />
                  <span>{getPlayer(match.a ?? "")?.name ?? "Por definir"}</span>
                </button>
                <button
                  className={mine === "b" ? "winnerpick__btn is-on" : "winnerpick__btn"}
                  disabled={!iAmA && !iAmB}
                  onClick={() => pickWinner("b")}
                >
                  <Avatar name={getPlayer(match.b ?? "")?.name ?? "?"} size={44} />
                  <span>{getPlayer(match.b ?? "")?.name ?? "Por definir"}</span>
                </button>
              </div>
            </section>

            <section>
              <SectionTitle>Marcador</SectionTitle>
              <div className="scorer">
                <Stepper
                  label={getPlayer(match.a ?? "")?.name ?? "A"}
                  value={scoreA}
                  onChange={(v) => setScore("a", Math.min(v, bestOf))}
                />
                <span className="scorer__x">–</span>
                <Stepper
                  label={getPlayer(match.b ?? "")?.name ?? "B"}
                  value={scoreB}
                  onChange={(v) => setScore("b", Math.min(v, bestOf))}
                />
              </div>
              <p className="rules rules--soft">
                Al mejor de {bestOf}: se gana con {need} tantos. El ELO del juego{" "}
                {g?.short ?? t.gameId} se actualiza al confirmar.
              </p>
            </section>

            <Divider />

            <EloPreview
              elo={myElo}
              delta={mine === null ? null : eloDeltaPreview(scoreA, scoreB, mine)}
              tier={eloTier(myElo.rating).label}
            />

            <Button
              block
              size="md"
              onClick={onReport}
              iconRight="check"
              disabled={match.status === "confirmed"}
            >
              {match.status === "confirmed" ? "Partida ya confirmada" : "Enviar resultado"}
            </Button>
          </>
        )}

        {mode === "dispute" && (
          <>
            <section>
              <SectionTitle>Motivo de la impugnación</SectionTitle>
              <textarea
                className="textarea"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describí qué pasó en la partida…"
              />
              <p className="rules rules--soft">
                La app da {t.rules.disputeWindowMin} minutos para impugnar. Si nadie responde, el
                resultado se confirma automáticamente.
              </p>
            </section>

            <Button block size="md" variant="danger" iconLeft="alertTriangle" onClick={onDispute}>
              Enviar impugnación
            </Button>

            {match.status === "reported" && (
              <Button
                block
                size="md"
                variant="surface"
                onClick={() => navigate(`/torneo/${t!.id}/cuadro`)}
              >
                Volver al cuadro
              </Button>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}

function Player({ name, me, score }: { name: string; me: boolean; score: number }) {
  return (
    <div className={me ? "versus__side is-me" : "versus__side"}>
      <Avatar name={name} size={54} ring={me} />
      <span className="versus__name">{name}</span>
      {me && <Badge tone="primary">Tú</Badge>}
      <span className="versus__score">{score}</span>
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="sstep">
      <span className="sstep__label">{label}</span>
      <div className="sstep__controls">
        <button
          className="sstep__btn"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label="Restar"
        >
          <Icon name="x" size={14} />
        </button>
        <span className="sstep__value">{value}</span>
        <button className="sstep__btn" onClick={() => onChange(value + 1)} aria-label="Sumar">
          <Icon name="plus" size={14} />
        </button>
      </div>
    </div>
  );
}

function EloPreview({ elo, delta, tier }: { elo: EloRecord; delta: number | null; tier: string }) {
  return (
    <div className="managednote">
      <Icon name="chart" size={18} />
      <div>
        <strong>
          {elo.rating} → {delta === null ? elo.rating : elo.rating + delta} ELO
        </strong>
        <p>
          {delta === null
            ? `Elegí al ganador para ver el impacto. Ahora sos ${tier}.`
            : `Sumás ${delta > 0 ? `${delta}` : delta} ELO. El ELO es por juego y sólo cambia cuando el rival confirma.`}
        </p>
      </div>
    </div>
  );
}

/** Estimación del delta para la vista previa (K=24, factor best-of). */
function eloDeltaPreview(scoreA: number, scoreB: number, winner: "a" | "b"): number {
  const winnerGoals = winner === "a" ? scoreA : scoreB;
  const loserGoals = winner === "a" ? scoreB : scoreA;
  const expected = winnerGoals / (winnerGoals + loserGoals || 1);
  const margin = Math.min(1, Math.abs(winnerGoals - loserGoals) / 3);
  return Math.round(24 * (0.5 + (expected - 0.5)) * (0.6 + margin * 0.8));
}
