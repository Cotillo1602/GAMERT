import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Cover, Badge, SectionTitle } from "../components/ui/Display";
import { ListItem } from "../components/ui/List";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { GAMES, getGame, isEASportsPath, type GameId } from "../data/games";
import { publisherFor } from "../data/app";
import { eloTier } from "../lib/elo";
import { useApp } from "../store/AppContext";
import { EmptyState } from "./Torneos";
import "../styles/screens.css";

/**
 * Antes eran "categorías" sueltas. Ahora el browse es por juego: el ELO es
 * por juego, así que el filtro natural es el juego, no una taxonomía aparte.
 */
export function Categorias() {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const popular = GAMES.filter((g) => g.popular);
  const rest = GAMES.filter((g) => !g.popular);
  const visible = showAll ? rest : rest.slice(0, 4);

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Juegos" />

      <div className="screen__body--pad screen__scroll">
        <p className="sectionlabel u-uppercase">Populares</p>
        <div className="catgrid">
          {popular.map((g) => (
            <button
              key={g.id}
              className="catcard catcard--lg"
              onClick={() => navigate(`/juegos/${g.id}`)}
            >
              <Cover label={g.name} height={92} radius={14} />
              <span className="catcard__name">{g.name}</span>
              <span className="catcard__desc u-truncate">{g.description}</span>
              {isEASportsPath(g.id) ? (
                <Badge tone="primary">Ruta EA Sports</Badge>
              ) : (
                <Badge tone="neutral">Comunidad</Badge>
              )}
            </button>
          ))}
        </div>

        <p className="sectionlabel u-uppercase">Todos los juegos</p>
        <div className="stack">
          {visible.map((g) => (
            <button key={g.id} className="catrowcard" onClick={() => navigate(`/juegos/${g.id}`)}>
              <Cover label={g.name} height={56} radius={10} />
              <div className="catrowcard__body">
                <span className="catrowcard__name">{g.name}</span>
                <span className="catrowcard__desc u-truncate">{g.description}</span>
              </div>
              <Icon name="chevronRight" size={18} className="u-tertiary" />
            </button>
          ))}
        </div>

        {rest.length > 4 && (
          <Button block variant="outline" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Ver menos" : `Ver todos (${rest.length})`}
          </Button>
        )}
      </div>
    </Screen>
  );
}

export function Categoria() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { tournaments, eloOf, userId } = useApp();

  const g = getGame(id as GameId);
  const list = tournaments.filter((t) => t.gameId === id);
  const myElo = eloOf(userId, id as GameId);
  const publisher = publisherFor(id as GameId);

  if (!g) {
    return (
      <Screen padded={false} scroll={false}>
        <AppBar onBack={() => navigate(-1)} title="Juego" />
        <div className="screen__body--pad screen__scroll">
          <EmptyState text="No encontramos este juego." />
        </div>
      </Screen>
    );
  }

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title={g.name} />

      <div className="screen__body--pad screen__scroll">
        <Cover label={g.name} height={132} radius={16} className="catcover" />

        <div className="catdetailhead">
          <h1 className="catdetailhead__name u-uppercase">{g.name}</h1>
          <p className="catdetailhead__desc">{g.description}</p>
        </div>

        {publisher && (
          <div className="phase">
            <Icon name="medal" size={16} />
            <span className="u-uppercase">{publisher.name}</span>
            <Badge tone={publisher.tier === "editorial" ? "primary" : "warning"}>
              {publisher.tier === "editorial" ? "Editorial" : "Comunidad"}
            </Badge>
          </div>
        )}

        {/* El ELO de este juego es el que cuenta para el ranking */}
        <button className="elochip" onClick={() => navigate(`/ranking/${g.id}`)}>
          <span className="elochip__icon" style={{ color: g.accent }}>
            <Icon name={g.icon} size={20} />
          </span>
          <div className="elochip__body">
            <span className="elochip__game">Tu ELO en {g.short}</span>
            <span className="elochip__value">
              {myElo.rating} · {eloTier(myElo.rating).label} · {myElo.played} PJ
            </span>
          </div>
          <Icon name="chevronRight" size={18} className="u-tertiary" />
        </button>

        <SectionTitle>Torneos de {g.name}</SectionTitle>
        {list.length === 0 ? (
          <EmptyState text="Aún no hay torneos de este juego." />
        ) : (
          <div className="stack">
            {list.map((t) => (
              <button key={t.id} className="catrowcard" onClick={() => navigate(`/torneo/${t.id}`)}>
                <Cover label={g.name} height={56} radius={10} />
                <div className="catrowcard__body">
                  <span className="catrowcard__name">{t.name}</span>
                  <span className="catrowcard__desc">
                    {t.enrolled}/{t.slots} inscritos · {t.modality}
                  </span>
                </div>
                <Icon name="chevronRight" size={18} className="u-tertiary" />
              </button>
            ))}
          </div>
        )}

        <SectionTitle>Más opciones</SectionTitle>
        <div className="stack">
          <ListItem
            leadingIcon="users"
            label="Comunidad y publishers"
            trailingIcon="chevronRight"
            onClick={() => navigate("/organizaciones")}
          />
          <ListItem
            leadingIcon="chart"
            label={`Ranking de ${g.short}`}
            trailingIcon="chevronRight"
            onClick={() => navigate(`/ranking/${g.id}`)}
          />
          <ListItem
            leadingIcon="edit"
            label="Organizar torneo de este juego"
            trailingIcon="chevronRight"
            onClick={() => navigate("/organizar/crear")}
          />
        </div>
      </div>
    </Screen>
  );
}
