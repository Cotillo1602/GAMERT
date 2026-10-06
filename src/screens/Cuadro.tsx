import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Avatar, SectionTitle } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { getPlayer } from "../data/players";
import { getGame, type GameId } from "../data/games";
import { organizerName } from "../data/app";
import { championOf } from "../lib/bracket";
import type { Match } from "../lib/bracket";
import { useApp } from "../store/AppContext";
import { formatDate } from "../lib/utils";
import "../styles/screens.css";

/**
 * Cuadro completo del torneo. La app genera la semilla por ELO al iniciar,
 * por lo que aquí no hay "armar cuadro": sólo seguir la actualización.
 */
export function Cuadro() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { tournamentById, bracketOf, userId, eloDeltaFor, confirmResult, resolveDispute } =
    useApp();

  const t = tournamentById(id);
  const matches = bracketOf(id);

  if (!t) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Cuadro" />
        <div className="screen__body--pad screen__scroll">
          <div className="empty">
            <span className="empty__icon">
              <Icon name="alertTriangle" size={26} />
            </span>
            <p className="empty__text">No encontramos este torneo.</p>
          </div>
        </div>
      </Screen>
    );
  }

  const g = getGame(t.gameId);
  const champion = championOf(matches);
  const rounds = groupByRound(matches);

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Cuadro" subtitle={t.name} />

      <div className="screen__body--pad screen__scroll bracket">
        <div className="managednote">
          <Icon name="layers" size={18} />
          <div>
            <strong>Cuadro generado por la app</strong>
            <p>
              {organizerName(t.organizerId)} definió el formato; GAMERT sembró por ELO de{" "}
              {g?.name ?? t.gameId} y actualiza solo los resultados.
            </p>
          </div>
        </div>

        {champion && (
          <div className="champbanner">
            <Icon name="trophy" size={22} />
            <div>
              <strong>Campeón: {getPlayer(champion)?.name}</strong>
              <span>Final confirmada · ELO de {t.gameId.toUpperCase()} actualizado</span>
            </div>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="empty">
            <span className="empty__icon">
              <Icon name="clock" size={26} />
            </span>
            <p className="empty__text">
              El cuadro se arma solo cuando llega la hora de inicio ({t.time} {t.timezone} del{" "}
              {formatDate(t.date)}).
            </p>
          </div>
        ) : (
          rounds.map(([roundLabel, list]) => (
            <section key={roundLabel}>
              <SectionTitle>{roundLabel}</SectionTitle>
              <div className="stack">
                {list.map((m) => (
                  <MatchCard
                    key={m.id}
                    m={m}
                    game={t.gameId}
                    me={userId}
                    onReport={() => navigate(`/torneo/${t.id}/resultado/${m.id}`)}
                    onConfirm={() => confirmResult(m.id)}
                    onDispute={() => navigate(`/torneo/${t.id}/resultado/${m.id}?disputa=1`)}
                    delta={eloDeltaFor(m.id)}
                    onResolve={() => resolveDispute(m.id, m.a ?? "")}
                    onResolveB={() => resolveDispute(m.id, m.b ?? "")}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <div className="actionbar">
        <div className="actionbar__info">
          <span className="actionbar__label">Formato</span>
          <span className="actionbar__value">Al mejor de {t.rules.bestOf}</span>
        </div>
        <Button
          size="md"
          variant="surface"
          iconLeft="chart"
          onClick={() => navigate(`/torneo/${t.id}/clasificacion`)}
        >
          Clasificación
        </Button>
      </div>
    </Screen>
  );
}

function MatchCard({
  m,
  game,
  me,
  onReport,
  onConfirm,
  onDispute,
  onResolve,
  onResolveB,
  delta,
}: {
  m: Match;
  game: GameId;
  me: string;
  onReport: () => void;
  onConfirm: () => void;
  onDispute: () => void;
  onResolve: () => void;
  onResolveB: () => void;
  delta: { winnerDelta: number; loserDelta: number } | null;
}) {
  const statusLabel: Record<Match["status"], string> = {
    pending: "Pendiente",
    ready: "Listo para jugar",
    live: "En vivo",
    reported: "Esperando confirmación",
    confirmed: "Confirmado",
    disputed: "En disputa",
  };
  const g = getGame(game);

  const a = m.a ? getPlayer(m.a) : null;
  const b = m.b ? getPlayer(m.b) : null;
  const bye = (m.a === null) !== (m.b === null);
  const winner =
    m.status === "confirmed" && m.scoreA !== null && m.scoreB !== null
      ? m.scoreA > m.scoreB
        ? m.a
        : m.b
      : null;

  return (
    <div className={m.status === "live" ? "matchcard is-live" : "matchcard"}>
      <div className="matchcard__head">
        <span className={`matchstate matchstate--${m.status}`}>{statusLabel[m.status]}</span>
        <span className="matchcard__time">
          <Icon name="clock" size={12} />
          {new Date(m.startsAt).toLocaleString("es", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <Side player={a} score={m.scoreA} isWinner={winner === m.a} isMe={m.a === me} bye={bye} />

      <Side player={b} score={m.scoreB} isWinner={winner === m.b} isMe={m.b === me} bye={bye} />

      {bye && (
        <p className="matchcard__note">
          <Icon name="checkCircle" size={13} /> Bye: pasa directo a la siguiente ronda.
        </p>
      )}

      {delta && (
        <p className="matchcard__elo">
          <Icon name="chart" size={13} /> +{delta.winnerDelta} / {delta.loserDelta} ELO de{" "}
          {g?.short ?? game}
        </p>
      )}

      {(m.a === me || m.b === me) && !bye && m.status !== "pending" && (
        <div className="matchcard__actions">
          {m.status === "reported" ? (
            <>
              <Button size="sm" block iconLeft="check" onClick={onConfirm}>
                Confirmar resultado
              </Button>
              <Button size="sm" block variant="ghost" iconLeft="alertTriangle" onClick={onDispute}>
                Impugnar
              </Button>
            </>
          ) : m.status === "disputed" ? (
            <>
              <p className="matchcard__note">
                <Icon name="alertTriangle" size={13} /> El ELO quedó congelado hasta resolver la
                disputa.
              </p>
              <Button size="sm" block variant="surface" onClick={onResolve} disabled={m.a === null}>
                Gana {getPlayer(m.a ?? "")?.name ?? "A"}
              </Button>
              <Button
                size="sm"
                block
                variant="surface"
                onClick={onResolveB}
                disabled={m.b === null}
              >
                Gana {getPlayer(m.b ?? "")?.name ?? "B"}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              block
              disabled={m.status === "confirmed"}
              iconLeft="edit"
              onClick={onReport}
            >
              {m.status === "confirmed" ? "Partida finalizada" : "Reportar resultado"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Side({
  player,
  score,
  isWinner,
  isMe,
  bye,
}: {
  player: ReturnType<typeof getPlayer> | null;
  score: number | null;
  isWinner: boolean;
  isMe: boolean;
  bye: boolean;
}) {
  return (
    <div className={isWinner ? "matchside is-winner" : "matchside"}>
      <Avatar name={player?.name ?? "?"} size={28} />
      <span className="matchside__name">
        {player?.name ?? (bye ? "Bye" : "Por definir")}
        {isMe && <span className="standrow__you">Tú</span>}
      </span>
      {score !== null && <span className="matchside__score">{score}</span>}
      {isWinner && (
        <Icon name="trophySmall" size={14} className="standrow__medal standrow__medal--gold" />
      )}
    </div>
  );
}

function groupByRound(matches: Match[]): [string, Match[]][] {
  const map = new Map<string, Match[]>();
  for (const m of matches) {
    const list = map.get(m.roundLabel) ?? [];
    list.push(m);
    map.set(m.roundLabel, list);
  }
  return [...map.entries()];
}
