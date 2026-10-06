import { useNavigate } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { TabBar } from "../components/layout/TabBar";
import { Cover, Badge, SectionTitle, Avatar } from "../components/ui/Display";
import { ListTile } from "../components/ui/List";
import { Icon } from "../components/ui/Icon";
import { useApp } from "../store/AppContext";
import { GAMES, getGame } from "../data/games";
import { getPlayer } from "../data/players";
import { organizerName } from "../data/app";
import { nextMatchFor } from "../lib/bracket";
import { eloTier } from "../lib/elo";
import { formatDate } from "../lib/utils";
import type { Tournament } from "../data/tournaments";
import "../styles/screens.css";

export function Home() {
  const navigate = useNavigate();
  const { userId, balance, tournaments, brackets, eloOf, todayTournaments } = useApp();

  const me = getPlayer(userId);
  const featured = tournaments.find((t) => t.featured && t.status !== "finished") ?? tournaments[0];

  const myNext = featured ? nextMatchFor(brackets[featured.id] ?? [], userId) : undefined;

  const upcoming = tournaments
    .filter((t) => t.status !== "finished")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4);

  const mainGame = me ? getGame(me.mainGame) : undefined;
  const mainElo = me ? eloOf(userId, me.mainGame) : null;
  const tier = mainElo ? eloTier(mainElo.rating) : null;

  return (
    <Screen padded={false} scroll={false}>
      <AppBar logo actions={<Avatar name={me?.name ?? "?"} size={30} />} />

      <div className="screen__body--pad screen__scroll home">
        {/* Saludo + saldo */}
        <div className="home__hello">
          <div>
            <p className="home__hi">Hola,</p>
            <p className="home__name">{me?.name}</p>
          </div>
          <button className="walletchip" onClick={() => navigate("/billetera")}>
            <Icon name="wallet" size={16} />
            <span>${balance}</span>
          </button>
        </div>

        {/* Tu nivel en el juego principal */}
        {mainElo && tier && mainGame && (
          <button className="elochip" onClick={() => navigate(`/ranking/${mainGame.id}`)}>
            <span className="elochip__icon" style={{ color: mainGame.accent }}>
              <Icon name={mainGame.icon} size={20} />
            </span>
            <div className="elochip__body">
              <span className="elochip__game">{mainGame.name}</span>
              <span className="elochip__value">{mainElo.rating} ELO</span>
            </div>
            <Badge tone={tier.tone}>{tier.label}</Badge>
          </button>
        )}

        {/* Torneo destacado */}
        {featured && (
          <button className="feature" onClick={() => navigate(`/torneo/${featured.id}`)}>
            <Cover label={featured.name} height={168} radius={16} className="feature__cover">
              <span className="feature__tag">
                <Icon name="trophy" size={13} />
                DESTACADO
              </span>
            </Cover>
            <div className="feature__body">
              <div className="feature__row">
                <h3 className="feature__title">{featured.name}</h3>
                <Badge tone={featured.status === "live" ? "live" : "primary"}>
                  {featured.status === "live" ? "En vivo" : "Próximo"}
                </Badge>
              </div>
              <p className="feature__meta">
                {organizerName(featured.organizerId)} · {featured.enrolled}/{featured.slots}{" "}
                inscritos
              </p>
              {myNext ? (
                <p className="feature__meta">
                  Tu próxima partida: {myNext.roundLabel} ·{" "}
                  {new Date(myNext.startsAt).toLocaleString("es", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : null}
              <div className="feature__cta">
                Ver torneo <Icon name="arrowRight" size={16} />
              </div>
            </div>
          </button>
        )}

        {/* Accesos rápidos */}
        <div className="quickgrid">
          <QuickAction icon="trophy" label="Mis Torneos" to="/mis-torneos" />
          <QuickAction icon="layers" label="Juegos" to="/juegos" />
          <QuickAction icon="chart" label="Ranking" to="/ranking" />
          <QuickAction icon="users" label="Organizar" to="/organizar" />
        </div>

        {/* Juegos: el ELO es por juego, así que el browse es por juego */}
        <section>
          <SectionTitle
            action={
              <button className="linkbtn" onClick={() => navigate("/juegos")}>
                Ver todo
              </button>
            }
          >
            Juegos
          </SectionTitle>
          <div className="catrow">
            {GAMES.slice(0, 5).map((g) => (
              <button key={g.id} className="catcard" onClick={() => navigate(`/juegos/${g.id}`)}>
                <Cover label={g.name} height={62} radius={12} />
                <span className="catcard__name">{g.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Hoy */}
        {todayTournaments.length > 0 && (
          <section>
            <SectionTitle
              action={
                <button className="linkbtn" onClick={() => navigate("/torneos")}>
                  Ver todo
                </button>
              }
            >
              Torneos de hoy
            </SectionTitle>
            <div className="stack">
              {todayTournaments.slice(0, 3).map((t) => (
                <TournamentRow key={t.id} t={t} onOpen={() => navigate(`/torneo/${t.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Próximos torneos */}
        <section>
          <SectionTitle
            action={
              <button className="linkbtn" onClick={() => navigate("/torneos")}>
                Ver todo
              </button>
            }
          >
            Próximos torneos
          </SectionTitle>
          <div className="stack">
            {upcoming.map((t) => (
              <TournamentRow key={t.id} t={t} onOpen={() => navigate(`/torneo/${t.id}`)} />
            ))}
          </div>
        </section>
      </div>

      <TabBar />
    </Screen>
  );
}

export function TournamentRow({ t, onOpen }: { t: Tournament; onOpen: () => void }) {
  return (
    <ListTile
      onClick={onOpen}
      leading={<Cover label={t.gameId.toUpperCase()} height={48} radius={10} />}
      title={t.name}
      subtitle={`${formatDate(t.date)} · ${t.time}`}
      meta={
        <>
          <Badge
            tone={t.status === "live" ? "live" : t.modality === "Virtual" ? "primary" : "warning"}
          >
            {t.status === "live" ? "En vivo" : t.modality}
          </Badge>
          <span className="u-tertiary">
            {t.enrolled}/{t.slots}
          </span>
        </>
      }
    />
  );
}

function QuickAction({
  icon,
  label,
  to,
}: {
  icon: "trophy" | "layers" | "chart" | "users";
  label: string;
  to: string;
}) {
  const navigate = useNavigate();
  return (
    <button className="quick" onClick={() => navigate(to)}>
      <span className="quick__icon">
        <Icon name={icon} size={21} />
      </span>
      <span className="quick__label">{label}</span>
    </button>
  );
}
