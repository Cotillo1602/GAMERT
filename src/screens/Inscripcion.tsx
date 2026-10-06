import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { SectionTitle, Divider, Badge } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { getGame } from "../data/games";
import { organizerName } from "../data/app";
import { rulesText } from "../data/tournaments";
import { formatDate, money } from "../lib/utils";
import { eloTier } from "../lib/elo";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

/**
 * Inscripción: no se cobra nada. El jugador declara su cuenta de juego y la
 * app lo siembra por ELO cuando arranca el torneo.
 */
export function Inscripcion() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { tournamentById, joinTournament, eloOf, userId, isJoined } = useApp();
  const toast = useToast();

  const t = tournamentById(id);

  if (!t) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Inscripción" />
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

  if (isJoined(t.id)) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Inscripción" />
        <div className="screen__body--pad screen__scroll">
          <div className="donecard">
            <Icon name="checkCircle" size={30} />
            <h1 className="donecard__title">Ya estás inscripto</h1>
            <p className="donecard__text">
              La app te siembra por ELO cuando arranque {t.name}. Te avisamos por notificación.
            </p>
          </div>
          <Button
            block
            size="md"
            onClick={() => navigate(`/torneo/${t.id}/cuadro`)}
            iconRight="arrowRight"
          >
            Ver cuadro
          </Button>
        </div>
      </Screen>
    );
  }

  const g = getGame(t.gameId);
  const elo = eloOf(userId, t.gameId);
  const meets = elo.rating >= t.rules.minElo;

  function onJoin() {
    joinTournament(t!.id);
    toast.success("Inscripción confirmada");
    navigate(`/torneo/${t!.id}/confirmacion`);
  }

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Confirmar inscripción" subtitle={t.name} />

      <div className="screen__body--pad screen__scroll">
        <div className="matchhead">
          <span className="matchhead__round">{formatDate(t.date)}</span>
          <span className="matchhead__game">
            <Icon name={g?.icon ?? "gamepad"} size={13} />
            {g?.name ?? t.gameId}
          </span>
        </div>

        <div className="donecard donecard--muted">
          <Icon name="wallet" size={26} />
          <h1 className="donecard__title">Inscripción gratuita</h1>
          <p className="donecard__text">
            {t.prize.amount > 0
              ? `No se cobra entrada. El premio de ${money(t.prize.amount)} lo aporta ${organizerName(t.organizerId)}.`
              : `${organizerName(t.organizerId)} organiza este torneo sin premio en efectivo.`}
          </p>
        </div>

        <section>
          <SectionTitle>Tu perfil de juego</SectionTitle>
          <div className="stack">
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name={g?.icon ?? "gamepad"} size={16} />
              </span>
              <span className="inforow__label">Juego</span>
              <span className="inforow__value">{g?.name ?? t.gameId}</span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="chart" size={16} />
              </span>
              <span className="inforow__label">Tu ELO</span>
              <span className={meets ? "inforow__value is-ok" : "inforow__value is-bad"}>
                {elo.rating} · {eloTier(elo.rating).label}
              </span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="trophy" size={16} />
              </span>
              <span className="inforow__label">Mínimo requerido</span>
              <span className="inforow__value">{t.rules.minElo}</span>
            </div>
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>Lo que acepta la plataforma</SectionTitle>
          <p className="rules">{rulesText(t)}</p>
          <ul className="rulelist">
            <li>
              <Icon name="check" size={14} /> La app genera el cuadro por orden de ELO.
            </li>
            <li>
              <Icon name="check" size={14} /> Cada partida se reporta y el rival la confirma.
            </li>
            <li>
              <Icon name="check" size={14} /> Desconexión:{" "}
              {t.rules.autoForfeitOnDisconnect
                ? "la partida se da al rival."
                : "se revisa manualmente."}
            </li>
            <li>
              <Icon name="check" size={14} /> Ventana de impugnación: {t.rules.disputeWindowMin}{" "}
              minutos.
            </li>
          </ul>
        </section>

        {!meets && (
          <Badge tone="danger" icon="alertTriangle">
            Te faltan {t.rules.minElo - elo.rating} ELO en {g?.short ?? t.gameId} para inscribirte.
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
