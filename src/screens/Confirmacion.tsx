import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { SectionTitle, Divider, Badge } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { formatDate, money } from "../lib/utils";
import { useAllPlayers, useIsJoined, useTournament, useUserId } from "../lib/api/hooks";
import { rulesText } from "../lib/api/tournaments";
import "../styles/screens.css";

/** Confirmación post-inscripción: la app queda a cargo de la siembra. */
export function Confirmacion() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const userId = useUserId();

  const { data: t, isLoading } = useTournament(id);
  const { data: players = [] } = useAllPlayers();
  const organizer = (playerId: string) => players.find((p) => p.id === playerId)?.name ?? "?";
  const { data: joined = false } = useIsJoined(id, userId);

  if (t === undefined) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Confirmación" />
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

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Inscripción confirmada" />

      <div className="screen__body--pad screen__scroll">
        <div className="donecard">
          <Icon name="checkCircle" size={30} />
          <h1 className="donecard__title">¡Estás dentro!</h1>
          <p className="donecard__text">
            {joined
              ? `Te sembramos por ELO cuando arranque ${torneo.name}.`
              : `Tu inscripción a ${torneo.name} ya no está activa.`}
          </p>
        </div>

        <div className="timeline">
          <Step
            n={1}
            title="Inspección confirmada"
            text="Validamos tu ELO y tu cuenta de juego."
            done
          />
          <Step n={2} title="Siembra por ELO" text="La app arma el cuadro y asigna tu rival." />
          <Step n={3} title="Partidas" text="Reportás el resultado y tu rival lo confirma." />
          <Step
            n={4}
            title="Premio"
            text={`Reparto ${torneo.prize.split[0]}/${torneo.prize.split[1]}/${torneo.prize.split[2]} al podio.`}
          />
        </div>

        <Divider />

        <section>
          <SectionTitle>Resumen</SectionTitle>
          <div className="stack">
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="trophy" size={16} />
              </span>
              <span className="inforow__label">Torneo</span>
              <span className="inforow__value">{torneo.name}</span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="users" size={16} />
              </span>
              <span className="inforow__label">Organiza</span>
              <span className="inforow__value">{organizer(torneo.organizerId)}</span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="calendar" size={16} />
              </span>
              <span className="inforow__label">Comienza</span>
              <span className="inforow__value">
                {formatDate(torneo.date)} · {torneo.time} {torneo.timezone}
              </span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="coin" size={16} />
              </span>
              <span className="inforow__label">Premio</span>
              <span className="inforow__value">
                {torneo.prize.amount > 0 ? money(torneo.prize.amount) : "Sin premio"}
              </span>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle>Reglas</SectionTitle>
          <p className="rules">{rulesText(torneo)}</p>
        </section>

        <Badge tone="primary" icon="bell">
          Te avisamos por notificación cuando se publique tu rival.
        </Badge>
      </div>

      <div className="actionbar">
        <Button size="md" variant="surface" onClick={() => navigate("/torneos")}>
          Explorar más
        </Button>
        <Button
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

function Step({
  n,
  title,
  text,
  done,
}: {
  n: number;
  title: string;
  text: string;
  done?: boolean;
}) {
  return (
    <div className={done ? "tlstep is-done" : "tlstep"}>
      <span className="tlstep__n">{done ? <Icon name="check" size={13} /> : n}</span>
      <div>
        <strong className="tlstep__title">{title}</strong>
        <p className="tlstep__text">{text}</p>
      </div>
    </div>
  );
}
