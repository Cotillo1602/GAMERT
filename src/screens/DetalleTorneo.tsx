import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Cover, Badge, SectionTitle, Stat, Divider } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { formatDate, money } from "../lib/utils";
import {
  useAllPlayers,
  useBracket,
  useElo,
  useGame,
  useIsJoined,
  useOrganizedBy,
  useTournament,
  useUserId,
} from "../lib/api/hooks";
import { rulesText } from "../lib/api/tournaments";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

export function DetalleTorneo() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const userId = useUserId();
  const toast = useToast();

  const { data: t, isLoading } = useTournament(id);
  const { data: players = [] } = useAllPlayers();
  const organizer = (playerId: string) => players.find((p) => p.id === playerId)?.name ?? "?";

  const { data: game } = useGame(t?.gameId ?? "");
  const { data: joined = false } = useIsJoined(id, userId);
  const { data: bracket = [] } = useBracket(id);
  const { data: myElo } = useElo(userId, t?.gameId ?? "");
  const { data: myOrganized = [] } = useOrganizedBy(userId);

  if (t === undefined) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Torneo" />
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
  const full = torneo.enrolled >= torneo.slots;
  const started = bracket.length > 0;
  const meetsElo = (myElo?.rating ?? 0) >= torneo.rules.minElo;
  const iOrganize = myOrganized.some((x) => x.id === torneo.id);
  const canJoin = !joined && !full && !started && meetsElo;

  function onPrimary() {
    if (joined) {
      navigate(`/torneo/${torneo.id}/cuadro`);
      return;
    }
    if (!canJoin) {
      toast.warning(
        full
          ? "No quedan cupas disponibles"
          : started
            ? "El torneo ya comenzó"
            : `Necesitas ${torneo.rules.minElo} ELO en ${game?.name ?? torneo.gameId}`,
      );
      return;
    }
    navigate(`/torneo/${torneo.id}/inscripcion`);
  }

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title={game?.name ?? torneo.gameId} />

      <div className="screen__body--pad screen__scroll detail">
        <Cover label={torneo.name} height={180} radius={16} className="detail__cover">
          {torneo.status === "live" && (
            <span className="tcard__live">
              <Badge tone="live">En vivo</Badge>
            </span>
          )}
        </Cover>

        <div className="detail__title">
          <h1 className="detail__name">{torneo.name}</h1>
          <p className="detail__org">
            <Icon name="users" size={14} />
            {organizer(torneo.organizerId)}
            {torneo.publisherTier === "editorial" && <Badge tone="primary">Editorial</Badge>}
          </p>
        </div>

        <div className="detail__badges">
          <Badge
            tone={torneo.modality === "Virtual" ? "primary" : "warning"}
            icon={torneo.modality === "Virtual" ? "globe" : "users"}
          >
            {torneo.modality}
          </Badge>
          <Badge tone="neutral" icon="calendar">
            {formatDate(torneo.date)}
          </Badge>
          <Badge tone="neutral" icon="clock">
            {torneo.time} {torneo.timezone}
          </Badge>
        </div>

        <div className="stats4">
          <Stat
            label="Premio"
            value={torneo.prize.amount > 0 ? money(torneo.prize.amount) : "Sin premio"}
            icon="coin"
          />
          <Stat label="Formato" value={`Bo${torneo.rules.bestOf}`} icon="layers" />
          <Stat label="ELO mínimo" value={torneo.rules.minElo} icon="chart" />
          <Stat label="Cupas" value={`${torneo.enrolled}/${torneo.slots}`} icon="users" />
        </div>

        {/* La app no cobra inscripción: el premio es el incentivo. */}
        <div className="managednote">
          <Icon name="wallet" size={18} />
          <div>
            <strong>Inscripción gratuita</strong>
            <p>
              {torneo.prize.amount > 0
                ? `El premio de ${money(torneo.prize.amount)} se reparte ${torneo.prize.split[0]}/${torneo.prize.split[1]}/${torneo.prize.split[2]} entre 1º, 2º y 3º.`
                : "Este torneo no tiene premio en efectivo."}
            </p>
          </div>
        </div>

        {torneo.phase && (
          <div className="phase">
            <Icon name="layers" size={16} />
            <span className="u-uppercase">{torneo.phase}</span>
          </div>
        )}

        <section>
          <SectionTitle>Reglas del torneo</SectionTitle>
          <p className="rules">{rulesText(torneo)}</p>
        </section>

        <section>
          <SectionTitle>Información</SectionTitle>
          <div className="stack">
            <InfoRow icon="calendar" label="Fecha" value={formatDate(torneo.date)} />
            <InfoRow
              icon="clock"
              label="Hora de inicio"
              value={`${torneo.time} ${torneo.timezone}`}
            />
            <InfoRow icon="users" label="Modalidad" value={torneo.modality} />
            <InfoRow icon="layers" label="Formato" value={`Al mejor de ${torneo.rules.bestOf}`} />
            <InfoRow icon="wallet" label="Organizador" value={organizer(torneo.organizerId)} />
            <InfoRow
              icon="alertTriangle"
              label="Impugnación"
              value={
                torneo.rules.requireConfirmation
                  ? `${torneo.rules.disputeWindowMin} min`
                  : "Sin confirmar"
              }
            />
          </div>
        </section>

        <Divider />

        <button className="linkrow" onClick={() => navigate(`/torneo/${torneo.id}/cuadro`)}>
          <Icon name="layers" size={18} />
          <span>Ver cuadro del torneo</span>
          <Icon name="chevronRight" size={18} />
        </button>

        <button className="linkrow" onClick={() => navigate(`/torneo/${torneo.id}/clasificacion`)}>
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
                  ? `${myElo?.rating ?? 0} ELO ✓`
                  : `Faltan ${torneo.rules.minElo - (myElo?.rating ?? 0)} ELO`}
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
