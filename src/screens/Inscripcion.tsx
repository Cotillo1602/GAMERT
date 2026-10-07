import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { SectionTitle, Divider, Badge } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { formatDate, money } from "../lib/utils";
import { eloTier } from "../lib/elo";
import {
  useAllPlayers,
  useElo,
  useGame,
  useIsJoined,
  useJoinTournament,
  useTournament,
  useUserId,
} from "../lib/api/hooks";
import { rulesText } from "../lib/api/tournaments";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

/**
 * Inscripción: no se cobra nada. El jugador declara su cuenta de juego y la
 * app lo siembra por ELO cuando arranca el torneo.
 */
export function Inscripcion() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const userId = useUserId();
  const toast = useToast();

  const { data: t, isLoading } = useTournament(id);
  const { data: players = [] } = useAllPlayers();
  const organizer = (playerId: string) => players.find((p) => p.id === playerId)?.name ?? "?";
  const { data: joined = false } = useIsJoined(id, userId);
  const { data: game } = useGame(t?.gameId ?? "");
  const { data: elo } = useElo(userId, t?.gameId ?? "");
  const join = useJoinTournament();

  if (t === undefined) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Inscripción" />
        <div className="screen__body--pad screen__scroll">
          <div className="empty">
            <span className="empty__icon">
              <Icon name="alertTriangle" size={26} />
            </span>
            <p className="empty__text">
              {isLoading ? "Cargando torneo..." : "No encontramos este torneo."}
            </p>
          </div>
        </div>
      </Screen>
    );
  }

  const torneo = t;

  if (joined) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Inscripción" />
        <div className="screen__body--pad screen__scroll">
          <div className="donecard">
            <Icon name="checkCircle" size={30} />
            <h1 className="donecard__title">Ya estás inscripto</h1>
            <p className="donecard__text">
              La app te siembra por ELO cuando arranque {torneo.name}. Te avisamos por notificación.
            </p>
          </div>
          <Button
            block
            size="md"
            onClick={() => navigate(`/torneo/${torneo.id}/cuadro`)}
            iconRight="arrowRight"
          >
            Ver cuadro
          </Button>
        </div>
      </Screen>
    );
  }

  const meets = (elo?.rating ?? 0) >= torneo.rules.minElo;
  const rating = elo?.rating ?? 0;

  function onJoin() {
    void join.mutateAsync({ tournamentId: torneo.id, userId }).then((res) => {
      if (res.ok) {
        toast.success("Inscripción confirmada");
        navigate(`/torneo/${torneo.id}/confirmacion`);
      } else {
        toast.warning(res.error ?? "No pudimos inscribirte");
      }
    });
  }

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Confirmar inscripción" subtitle={torneo.name} />

      <div className="screen__body--pad screen__scroll">
        <div className="matchhead">
          <span className="matchhead__round">{formatDate(torneo.date)}</span>
          <span className="matchhead__game">
            <Icon name={game?.icon ?? "gamepad"} size={13} />
            {game?.name ?? torneo.gameId}
          </span>
        </div>

        <div className="donecard donecard--muted">
          <Icon name="wallet" size={26} />
          <h1 className="donecard__title">Inscripción gratuita</h1>
          <p className="donecard__text">
            {torneo.prize.amount > 0
              ? `No se cobra entrada. El premio de ${money(torneo.prize.amount)} lo aporta ${organizer(torneo.organizerId)}.`
              : `${organizer(torneo.organizerId)} organiza este torneo sin premio en efectivo.`}
          </p>
        </div>

        <section>
          <SectionTitle>Tu perfil de juego</SectionTitle>
          <div className="stack">
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name={game?.icon ?? "gamepad"} size={16} />
              </span>
              <span className="inforow__label">Juego</span>
              <span className="inforow__value">{game?.name ?? torneo.gameId}</span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="chart" size={16} />
              </span>
              <span className="inforow__label">Tu ELO</span>
              <span className={meets ? "inforow__value is-ok" : "inforow__value is-bad"}>
                {rating} · {eloTier(rating).label}
              </span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="trophy" size={16} />
              </span>
              <span className="inforow__label">Mínimo requerido</span>
              <span className="inforow__value">{torneo.rules.minElo}</span>
            </div>
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>Lo que acepta la plataforma</SectionTitle>
          <p className="rules">{rulesText(torneo)}</p>
          <ul className="rulelist">
            <li>
              <Icon name="check" size={14} /> La app genera el cuadro por orden de ELO.
            </li>
            <li>
              <Icon name="check" size={14} /> Cada partida se reporta y el rival la confirma.
            </li>
            <li>
              <Icon name="check" size={14} /> Desconexión:{" "}
              {torneo.rules.autoForfeitOnDisconnect
                ? "la partida se da al rival."
                : "se revisa manualmente."}
            </li>
            <li>
              <Icon name="check" size={14} /> Ventana de impugnación:{" "}
              {torneo.rules.disputeWindowMin} minutos.
            </li>
          </ul>
        </section>

        {!meets && (
          <Badge tone="danger" icon="alertTriangle">
            Te faltan {torneo.rules.minElo - rating} ELO en {game?.short ?? torneo.gameId} para
            inscribirte.
          </Badge>
        )}
      </div>

      <div className="actionbar">
        <div className="actionbar__info">
          <span className="actionbar__label">Costo</span>
          <span className="actionbar__value">Gratis</span>
        </div>
        <Button size="md" disabled={!meets} onClick={onJoin} iconRight="check">
          {meets ? "Inscribirme" : "ELO insuficiente"}
        </Button>
      </div>
    </Screen>
  );
}
