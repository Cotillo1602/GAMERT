import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { TabBar } from "../components/layout/TabBar";
import { Avatar, Badge, SectionTitle, Divider } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { GAMES, getGame, isEASportsPath, type GameId } from "../data/games";
import { getPlayer } from "../data/players";
import { featuredPlayersCopy } from "../data/app";
import { eloTier } from "../lib/elo";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

/* El ELO vive por juego: cada ranking se calcula sobre los ratings
   de ese juego. `/ranking` entra por el juego principal del usuario. */
export function Ranking() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { userId, eloOf, rankingFor } = useApp();
  const toast = useToast();

  const me = getPlayer(userId);
  const game: GameId = (
    GAMES.some((g) => g.id === gameId) ? gameId : (me?.mainGame ?? "fifa26")
  ) as GameId;
  const meta = getGame(game);

  const table = rankingFor(game);
  const podium = table.slice(0, 3);
  const rest = table.slice(3);
  const mine = table.findIndex((r) => r.playerId === userId) + 1;
  const myElo = eloOf(userId, game);

  return (
    <Screen padded={false} scroll={false}>
      <AppBar title="Ranking" subtitle={meta?.name} />

      <div className="screen__body--pad screen__scroll">
        {/* Selector de juego: el ELO no se comparte entre juegos */}
        <div className="gameselect gameselect--flat">
          {GAMES.map((g) => (
            <button
              key={g.id}
              className={game === g.id ? "gameselect__item is-on" : "gameselect__item"}
              onClick={() => navigate(`/ranking/${g.id}`)}
            >
              <span className="gameselect__icon" style={{ color: g.accent }}>
                <Icon name={g.icon} size={18} />
              </span>
              <span className="gameselect__name">{g.name}</span>
            </button>
          ))}
        </div>

        <div className="podium">
          {[podium[1], podium[0], podium[2]].map((p, i) => {
            if (!p) return <div key={i} className="podium__col" />;
            const place = i === 0 ? 2 : i === 1 ? 1 : 3;
            return (
              <div key={p.playerId} className={`podium__col podium__col--${place}`}>
                <div className="podium__avatar">
                  <Avatar
                    name={getPlayer(p.playerId)?.name ?? "?"}
                    size={place === 1 ? 72 : 56}
                    ring={place === 1}
                  />
                  <span className={`podium__medal podium__medal--${place}`}>{place}</span>
                </div>
                <span className="podium__name">{getPlayer(p.playerId)?.name}</span>
                <span className="podium__elo">{p.elo.rating} ELO</span>
                <div className="podium__base">
                  <span className="podium__base-num">{place}</span>
                </div>
              </div>
            );
          })}
        </div>

        {isEASportsPath(game) && (
          <div className="managednote">
            <Icon name="medal" size={18} />
            <div>
              <strong>Ruta a oportunidades EA Sports</strong>
              <p>
                Tu ELO en {meta?.name} es el que la plataforma muestra a los publishers para abrirte
                puertas. Solo sube jugando.
              </p>
            </div>
          </div>
        )}

        <section>
          <SectionTitle>Jugadores destacados</SectionTitle>
          <p className="rules rules--soft">{featuredPlayersCopy}</p>
        </section>

        <Divider />

        <section>
          <SectionTitle>Clasificación de {meta?.name}</SectionTitle>
          <div className="standhead">
            <span className="standhead__col">#</span>
            <span className="standhead__col">Jugador</span>
            <span className="standhead__col standhead__col--r">PJ</span>
            <span className="standhead__col standhead__col--r">ELO</span>
          </div>
          <div className="stack">
            {rest.map((p, i) => (
              <div
                key={p.playerId}
                className={p.playerId === userId ? "standrow is-me" : "standrow"}
              >
                <span className="standrow__pos">{i + 4}</span>
                <Avatar name={getPlayer(p.playerId)?.name ?? "?"} size={36} />
                <span className="standrow__body">
                  <span className="standrow__name">
                    {getPlayer(p.playerId)?.name}
                    {p.playerId === userId && <span className="standrow__you">Tú</span>}
                  </span>
                  <span className="standrow__team">{eloTier(p.elo.rating).label}</span>
                </span>
                <span className="standrow__num">{p.elo.played}</span>
                <span className="standrow__num standrow__elo">{p.elo.rating}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="profilecard" onClick={() => navigate("/perfil")}>
          <Avatar name={me?.name ?? "?"} size={56} />
          <div className="profilecard__body">
            <span className="profilecard__name">{me?.name}</span>
            <span className="profilecard__meta">
              #{mine} en {meta?.name} · {myElo.rating} ELO
            </span>
          </div>
          <Badge tone="primary">Ver perfil</Badge>
        </div>

        <Button
          block
          variant="outline"
          iconLeft="share"
          onClick={() => toast.info("Enlace de ranking copiado")}
        >
          Compartir mi posición
        </Button>
      </div>

      <TabBar />
    </Screen>
  );
}
