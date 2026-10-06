import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { SectionTitle, Divider, Badge } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { organizerName } from "../data/app";
import { rulesText } from "../data/tournaments";
import { formatDate, money } from "../lib/utils";
import { useApp } from "../store/AppContext";
import "../styles/screens.css";

/** Confirmación post-inscripción: la app queda a cargo de la siembra. */
export function Confirmacion() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { tournamentById, isJoined } = useApp();

  const t = tournamentById(id);

  if (!t) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Confirmación" />
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

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Inscripción confirmada" />

      <div className="screen__body--pad screen__scroll">
        <div className="donecard">
          <Icon name="checkCircle" size={30} />
          <h1 className="donecard__title">¡Estás dentro!</h1>
          <p className="donecard__text">
            {isJoined(t.id)
              ? `Te sembramos por ELO cuando arranque ${t.name}.`
              : `Tu inscripción a ${t.name} ya no está activa.`}
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
            text={`Reparto ${t.prize.split[0]}/${t.prize.split[1]}/${t.prize.split[2]} al podio.`}
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
              <span className="inforow__value">{t.name}</span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="users" size={16} />
              </span>
              <span className="inforow__label">Organiza</span>
              <span className="inforow__value">{organizerName(t.organizerId)}</span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="calendar" size={16} />
              </span>
              <span className="inforow__label">Comienza</span>
              <span className="inforow__value">
                {formatDate(t.date)} · {t.time} {t.timezone}
              </span>
            </div>
            <div className="inforow">
              <span className="inforow__icon">
                <Icon name="coin" size={16} />
              </span>
              <span className="inforow__label">Premio</span>
              <span className="inforow__value">
                {t.prize.amount > 0 ? money(t.prize.amount) : "Sin premio"}
              </span>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle>Reglas</SectionTitle>
          <p className="rules">{rulesText(t)}</p>
        </section>

        <Badge tone="primary" icon="bell">
          Te avisamos por notificación cuando se publique tu rival.
        </Badge>
      </div>

      <div className="actionbar">
        <Button size="md" variant="surface" onClick={() => navigate("/torneos")}>
          Explorar más
        </Button>
        <Button size="md" onClick={() => navigate(`/torneo/${t.id}/cuadro`)} iconRight="arrowRight">
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
