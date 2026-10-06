import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Cover, Badge, SectionTitle, Stat, Divider } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { getGame } from "../data/games";
import { organizerName } from "../data/app";
import { rulesText } from "../data/tournaments";
import { formatDate, money } from "../lib/utils";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

export function DetalleTorneo() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { tournamentById, bracketOf, isJoined, eloOf, userId, myOrganizedTournaments } = useApp();
  const toast = useToast();

  const found = tournamentById(id);

  if (!found) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Torneo" />
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

  const t = found;
  const g = getGame(t.gameId);
  const joined = isJoined(t.id);
  const full = t.enrolled >= t.slots;
  const started = bracketOf(t.id).length > 0;
  const myElo = eloOf(userId, t.gameId);
  const meetsElo = myElo.rating >= t.rules.minElo;
  const iOrganize = myOrganizedTournaments.some((x) => x.id === t.id);
  const canJoin = !joined && !full && !started && meetsElo;

  function onPrimary() {
    if (joined) {
      navigate(`/torneo/${t.id}/cuadro`);
      return;
    }
    if (!canJoin) {
      toast.warning(
        full
          ? "No quedan cupas disponibles"
          : started
            ? "El torneo ya comenzó"
            : `Necesitas ${t.rules.minElo} ELO en ${g?.name ?? t.gameId}`,
      );
      return;
    }
    navigate(`/torneo/${t.id}/inscripcion`);
  }

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title={g?.name ?? t.gameId} />

      <div className="screen__body--pad screen__scroll detail">
        <Cover label={t.name} height={180} radius={16} className="detail__cover">
          {t.status === "live" && (
            <span className="tcard__live">
              <Badge tone="live">En vivo</Badge>
            </span>
          )}
        </Cover>

        <div className="detail__title">
          <h1 className="detail__name">{t.name}</h1>
          <p className="detail__org">
            <Icon name="users" size={14} />
            {organizerName(t.organizerId)}
            {t.publisherTier === "editorial" && <Badge tone="primary">Editorial</Badge>}
          </p>
        </div>

        <div className="detail__badges">
          <Badge
            tone={t.modality === "Virtual" ? "primary" : "warning"}
            icon={t.modality === "Virtual" ? "globe" : "users"}
          >
            {t.modality}
          </Badge>
          <Badge tone="neutral" icon="calendar">
            {formatDate(t.date)}
          </Badge>
          <Badge tone="neutral" icon="clock">
            {t.time} {t.timezone}
          </Badge>
        </div>

        <div className="stats4">
          <Stat
            label="Premio"
            value={t.prize.amount > 0 ? money(t.prize.amount) : "Sin premio"}
            icon="coin"
          />
          <Stat label="Formato" value={`Bo${t.rules.bestOf}`} icon="layers" />
          <Stat label="ELO mínimo" value={t.rules.minElo} icon="chart" />
          <Stat label="Cupas" value={`${t.enrolled}/${t.slots}`} icon="users" />
        </div>

        {/* La app no cobra inscripción: el premio es el incentivo. */}
        <div className="managednote">
          <Icon name="wallet" size={18} />
          <div>
            <strong>Inscripción gratuita</strong>
            <p>
              {t.prize.amount > 0
                ? `El premio de ${money(t.prize.amount)} se reparte ${t.prize.split[0]}/${t.prize.split[1]}/${t.prize.split[2]} entre 1º, 2º y 3º.`
                : "Este torneo no tiene premio en efectivo."}
            </p>
          </div>
        </div>

        {t.phase && (
          <div className="phase">
            <Icon name="layers" size={16} />
            <span className="u-uppercase">{t.phase}</span>
          </div>
        )}

        <section>
          <SectionTitle>Reglas del torneo</SectionTitle>
          <p className="rules">{rulesText(t)}</p>
        </section>

        <section>
          <SectionTitle>Información</SectionTitle>
          <div className="stack">
            <InfoRow icon="calendar" label="Fecha" value={formatDate(t.date)} />
            <InfoRow icon="clock" label="Hora de inicio" value={`${t.time} ${t.timezone}`} />
            <InfoRow icon="users" label="Modalidad" value={t.modality} />
            <InfoRow icon="layers" label="Formato" value={`Al mejor de ${t.rules.bestOf}`} />
            <InfoRow icon="wallet" label="Organizador" value={organizerName(t.organizerId)} />
            <InfoRow
              icon="alertTriangle"
              label="Impugnación"
              value={
                t.rules.requireConfirmation ? `${t.rules.disputeWindowMin} min` : "Sin confirmar"
              }
            />
          </div>
        </section>

        <Divider />

        <button className="linkrow" onClick={() => navigate(`/torneo/${t.id}/cuadro`)}>
          <Icon name="layers" size={18} />
          <span>Ver cuadro del torneo</span>
          <Icon name="chevronRight" size={18} />
        </button>

        <button className="linkrow" onClick={() => navigate(`/torneo/${t.id}/clasificacion`)}>
          <Icon name="chart" size={18} />
          <span>Ver clasificación del torneo</span>
          <Icon name="chevronRight" size={18} />
        </button>

        {iOrganize && (
          <button className="linkrow" onClick={() => navigate("/organizar")}>
            <Icon name="edit" size={18} />
            <span>Gestionar desde Organizar</span>
            <Icon name="chevronRight" size={18} />
          </button>
        )}
      </div>

      {/* Barra de acción fija */}
      <div className="actionbar">
        <div className="actionbar__info">
          <span className="actionbar__label">{joined ? "Inscrito" : "Inscripción"}</span>
          <span className="actionbar__value">
            {joined
              ? "Confirmada"
              : full
                ? "Completo"
                : meetsElo
                  ? `${myElo.rating} ELO ✓`
                  : `Faltan ${t.rules.minElo - myElo.rating} ELO`}
          </span>
        </div>
        <Button
          size="md"
          onClick={onPrimary}
          disabled={!joined && !canJoin}
          iconRight={joined ? "arrowRight" : "check"}
        >
          {joined ? "Ver mi cuadro" : full ? "Completo" : started ? "En curso" : "Inscribirme"}
        </Button>
      </div>
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: "calendar" | "clock" | "users" | "wallet" | "layers" | "alertTriangle";
  label: string;
  value: string;
}) {
  return (
    <div className="inforow">
      <Icon name={icon} size={16} className="inforow__icon" />
      <span className="inforow__label">{label}</span>
      <span className="inforow__value">{value}</span>
    </div>
  );
}
