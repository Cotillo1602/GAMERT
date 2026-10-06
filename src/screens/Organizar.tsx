import { useNavigate } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Avatar, Badge, SectionTitle, Divider } from "../components/ui/Display";
import { Icon } from "../components/ui/Icon";
import { useApp } from "../store/AppContext";
import { CURRENT_USER_ID, getPlayer } from "../data/players";
import { FORMAT_LABELS, todayISO } from "../data/tournaments";
import { gameName } from "../data/games";
import { publishers } from "../data/app";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";
import "../styles/organizer.css";

/* ============================================================
   Dashboard del organizador.

   Recordatorio del reparto de responsabilidades:
   el organizador publica el torneo y define reglas/premio.
   La app siembra, arma el cuadro, gestiona resultados y calcula el ELO.
   ============================================================ */

export function Organizar() {
  const navigate = useNavigate();
  const { myOrganizedTournaments, cancelTournament } = useApp();
  const toast = useToast();

  const me = getPlayer(CURRENT_USER_ID);
  const org = me?.organizer;

  const mine = myOrganizedTournaments.filter((t) => t.organizerId === CURRENT_USER_ID);
  const upcoming = mine.filter((t) => t.status !== "finished");
  const past = mine.filter((t) => t.status === "finished");

  const totalPrize = mine.reduce((s, t) => s + t.prize.amount, 0);
  const totalPlayers = mine.reduce((s, t) => s + t.enrolled, 0);

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Organizar" />

      <div className="screen__body--pad screen__scroll">
        <div className="orghero">
          <div className="orghero__top">
            <Avatar name={me?.name ?? "?"} size={52} />
            <div>
              <div className="orghero__name">{me?.name}</div>
              <div className="orghero__tier">
                {org ? `Organizador · ${org.tier}` : "Perfil de jugador"}
              </div>
            </div>
          </div>

          <div className="orghero__stats">
            <div className="orghero__stat">
              <span className="orghero__statvalue">{mine.length}</span>
              <span className="orghero__statlabel">Torneos</span>
            </div>
            <div className="orghero__stat">
              <span className="orghero__statvalue">{totalPlayers}</span>
              <span className="orghero__statlabel">Jugadores</span>
            </div>
            <div className="orghero__stat">
              <span className="orghero__statvalue">{`$${totalPrize}`}</span>
              <span className="orghero__statlabel">En premios</span>
            </div>
          </div>
        </div>

        <Button block size="lg" iconLeft="plus" onClick={() => navigate("/organizar/crear")}>
          Crear torneo
        </Button>

        {/* Estado de verificación */}
        {org?.verifiedPrizes ? (
          <div className="orggate">
            <span className="orggate__icon" style={{ color: "var(--c-success)" }}>
              <Icon name="checkCircle" size={20} />
            </span>
            <div className="orggate__body">
              <span className="orggate__title">Cuenta habilitada para premios</span>
              <span className="orggate__text">
                Podés definir premios en efectivo. {org.followers.toLocaleString("es")} seguidores ·{" "}
                {org.disputesLost} disputas perdidas.
              </span>
            </div>
          </div>
        ) : (
          <div className="orggate">
            <span className="orggate__icon">
              <Icon name="shield" size={20} />
            </span>
            <div className="orggate__body">
              <span className="orggate__title">Piloto de comunidad</span>
              <span className="orggate__text">
                Podés crear torneos con premios en <strong>créditos</strong>. Para efectivo
                necesitás 2000+ ELO, 10 torneos completados y 0 disputas perdidas.
              </span>
              <div className="chips chips--tight">
                <span className="gatepill">
                  <Icon name={org && org.tournamentsCreated >= 10 ? "check" : "x"} size={12} />
                  10 torneos
                </span>
                <span className="gatepill">
                  <Icon name={org && org.disputesLost === 0 ? "check" : "x"} size={12} />0 disputas
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Qué gestiona la app */}
        <div className="managednote">
          <Icon name="layers" size={18} />
          <div>
            <strong>La app se encarga de la operación</strong>
            <p>
              Siembra por ELO, emparejamientos, horarios, cuadro, confirmación de resultados,
              disputas y premios. Vos definís reglas y premio.
            </p>
          </div>
        </div>

        <Divider />

        <SectionTitle>Próximos</SectionTitle>
        {upcoming.length === 0 ? (
          <div className="empty">
            <span className="empty__icon">
              <Icon name="trophy" size={26} />
            </span>
            <p className="empty__text">Todavía no publicaste ningún torneo.</p>
          </div>
        ) : (
          <div className="stack">
            {upcoming.map((t) => (
              <div key={t.id} className="orgtrow">
                <button className="orgtcard" onClick={() => navigate(`/torneo/${t.id}`)}>
                  <div className="orgtcard__body">
                    <span className="orgtcard__name">{t.name}</span>
                    <div className="orgtcard__meta">
                      <span>{gameName(t.gameId)}</span>
                      <span>·</span>
                      <span>
                        {t.date === todayISO() ? "Hoy" : t.date} {t.time}
                      </span>
                    </div>
                    <span className="orgtcard__meta">{FORMAT_LABELS[t.format]}</span>
                    <span className="orgtcard__fill">
                      <span style={{ width: `${Math.min(100, (t.enrolled / t.slots) * 100)}%` }} />
                    </span>
                    <span className="orgtcard__meta">
                      {t.enrolled}/{t.slots} inscritos
                    </span>
                  </div>
                  <div className="col gap-xs" style={{ alignItems: "flex-end" }}>
                    {t.prize.amount > 0 && (
                      <span className="orgtcard__prize">{`$${t.prize.amount}`}</span>
                    )}
                    <Badge tone={t.status === "live" ? "live" : "primary"}>
                      {t.status === "live" ? "En vivo" : "Publicado"}
                    </Badge>
                  </div>
                </button>

                {t.status === "upcoming" && (
                  <button
                    className="orgtrow__cancel"
                    aria-label={`Cancelar ${t.name}`}
                    onClick={() => {
                      cancelTournament(t.id);
                      toast.info(`${t.name} quedó cancelado. La app avisó a los inscritos.`);
                    }}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <SectionTitle>Finalizados</SectionTitle>
            <div className="stack">
              {past.map((t) => (
                <button key={t.id} className="orgtcard" onClick={() => navigate(`/torneo/${t.id}`)}>
                  <div className="orgtcard__body">
                    <span className="orgtcard__name">{t.name}</span>
                    <span className="orgtcard__meta">
                      {gameName(t.gameId)} · {t.enrolled} participantes
                    </span>
                  </div>
                  <Badge tone="neutral">Finalizado</Badge>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Cuentas editoriales */}
        <SectionTitle>Cuentas editoriales</SectionTitle>
        <p className="rules rules--soft">
          Estas cuentas publican en nombre del publisher y tienen premios en efectivo habilitados
          por la plataforma.
        </p>
        <div className="stack">
          {publishers.slice(0, 4).map((p) => (
            <div key={p.id} className="org">
              <Avatar name={p.name} size={48} />
              <div className="org__body">
                <div className="org__row">
                  <span className="org__name">{p.name}</span>
                  <span className="org__verified">
                    <Icon name="checkCircle" size={14} />
                  </span>
                </div>
                <span className="org__followers">
                  <Icon name="users" size={12} />
                  {p.followers.toLocaleString("es")} seguidores
                </span>
              </div>
              <Badge tone="success">Verificado</Badge>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
