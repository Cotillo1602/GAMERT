import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, FilterRow, Screen } from "../components/layout/Layout";
import { TabBar } from "../components/layout/TabBar";
import { Cover, Badge, SectionTitle } from "../components/ui/Display";
import { SearchBar } from "../components/ui/Input";
import { Icon } from "../components/ui/Icon";
import { useAllPlayers, useGames, useTournaments } from "../lib/api/hooks";
import type { Tournament } from "../lib/api/tournaments";
import { money, formatDate } from "../lib/utils";
import "../styles/screens.css";

const FILTERS = ["Todos", "Virtual", "Presencial", "En curso", "Próximos"] as const;

export function Torneos() {
  const navigate = useNavigate();
  const { data: tournaments = [] } = useTournaments();
  const { data: games = [] } = useGames();
  const { data: players = [] } = useAllPlayers();
  const [filter, setFilter] = useState<string>("Todos");
  const [game, setGame] = useState<string>("Todos");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
    const q = query.trim().toLowerCase();
    return tournaments
      .filter((t) => {
        if (q && !`${t.name} ${t.gameId} ${nameOf(t.organizerId)}`.toLowerCase().includes(q))
          return false;
        if (game !== "Todos" && t.gameId !== game) return false;
        switch (filter) {
          case "Virtual":
            return t.modality === "Virtual";
          case "Presencial":
            return t.modality === "Presencial";
          case "En curso":
            return t.status === "live";
          case "Próximos":
            return t.status === "upcoming";
          default:
            return true;
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [tournaments, players, filter, game, query]);

  const live = tournaments.filter((t) => t.status === "live");

  return (
    <Screen padded={false} scroll={false}>
      <AppBar title="Torneos" />

      <div className="torneos__filters">
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar torneo o juego" />
        <div className="filterrow" role="tablist">
          {(["Todos", ...games.map((g) => g.short)] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={game === s}
              className={game === s ? "filterrow__item is-active" : "filterrow__item"}
              onClick={() => setGame(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <FilterRow items={FILTERS} value={filter} onChange={setFilter} />
      </div>

      <div className="screen__body--pad screen__scroll">
        {live.length > 0 && filter === "Todos" && game === "Todos" && (
          <section>
            <SectionTitle>En curso</SectionTitle>
            <div className="stack">
              {live.map((t) => (
                <TournamentCard key={t.id} t={t} onOpen={() => navigate(`/torneo/${t.id}`)} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionTitle>{filter === "Todos" ? "Todos los torneos" : filter}</SectionTitle>
          {list.length === 0 ? (
            <EmptyState text="No hay torneos que coincidan con tu búsqueda." />
          ) : (
            <div className="stack">
              {list.map((t) => (
                <TournamentCard key={t.id} t={t} onOpen={() => navigate(`/torneo/${t.id}`)} />
              ))}
            </div>
          )}
        </section>
      </div>

      <TabBar />
    </Screen>
  );
}

export function TournamentCard({ t, onOpen }: { t: Tournament; onOpen: () => void }) {
  const { data: games = [] } = useGames();
  const { data: players = [] } = useAllPlayers();
  const g = games.find((x) => x.id === t.gameId);
  const organizer = players.find((p) => p.id === t.organizerId)?.name ?? "?";

  return (
    <button className="tcard" onClick={onOpen}>
      <Cover label={g?.name ?? t.gameId} height={104} radius={12} className="tcard__cover">
        {t.status === "live" && (
          <span className="tcard__live">
            <Badge tone="live">En vivo</Badge>
          </span>
        )}
      </Cover>

      <div className="tcard__body">
        <h3 className="tcard__title">{t.name}</h3>
        <p className="tcard__org">{organizer}</p>

        <div className="tcard__meta">
          <span>
            <Icon name="calendar" size={13} />
            {formatDate(t.date)}
          </span>
          <span>
            <Icon name="clock" size={13} />
            {t.time} {t.timezone}
          </span>
        </div>

        <div className="tcard__foot">
          <Badge tone={t.modality === "Virtual" ? "primary" : "warning"}>{t.modality}</Badge>
          <span className="tcard__prize">
            <Icon name="coin" size={13} />
            {t.prize.amount > 0 ? money(t.prize.amount) : "Sin premio"}
          </span>
          <span className="tcard__slots">
            {t.enrolled}/{t.slots}
          </span>
        </div>
      </div>
    </button>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon name="search" size={26} />
      </span>
      <p className="empty__text">{text}</p>
      {action}
    </div>
  );
}
