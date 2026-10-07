import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, FilterRow, Screen } from "../components/layout/Layout";
import { TabBar } from "../components/layout/TabBar";
import { Cover, Badge, SectionTitle, Stat } from "../components/ui/Display";
import { ListItem } from "../components/ui/List";
import { Icon } from "../components/ui/Icon";
import { useAllPlayers, useGames, useMyTournaments, useUserId } from "../lib/api/hooks";
import { formatDate } from "../lib/utils";
import { EmptyState } from "./Torneos";
import "../styles/screens.css";

const FILTERS = ["Todos", "Próximos", "En curso", "Finalizados"] as const;

export function MisTorneos() {
  const navigate = useNavigate();
  const userId = useUserId();
  const [filter, setFilter] = useState<string>("Todos");

  const { data: myTournaments = [] } = useMyTournaments(userId);
  const { data: games = [] } = useGames();
  const { data: players = [] } = useAllPlayers();
  const organizer = (playerId: string) => players.find((p) => p.id === playerId)?.name ?? "?";

  const mine = useMemo(() => {
    switch (filter) {
      case "Próximos":
        return myTournaments.filter((t) => t.status === "upcoming");
      case "En curso":
        return myTournaments.filter((t) => t.status === "live");
      case "Finalizados":
        return myTournaments.filter((t) => t.status === "finished");
      default:
        return myTournaments;
    }
  }, [myTournaments, filter]);

  const potential = `$${myTournaments.reduce((s, t) => s + t.prize.amount, 0)}`;

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Mis Torneos" />

      <div className="torneos__filters">
        <FilterRow items={FILTERS} value={filter} onChange={setFilter} />
      </div>

      <div className="screen__body--pad screen__scroll">
        {mine.length > 0 && (
          <div className="summary">
            <Stat label="Inscritos" value={myTournaments.length} icon="trophy" />
            <Stat
              label="En curso"
              value={myTournaments.filter((t) => t.status === "live").length}
              icon="clock"
            />
            <Stat label="Premio en juego" value={potential} icon="coin" />
          </div>
        )}

        {mine.length === 0 ? (
          <EmptyState
            text={
              myTournaments.length === 0
                ? "Todavía no te has inscrito en ningún torneo."
                : "No hay torneos en este estado."
            }
            action={
              <button className="linkbtn" onClick={() => navigate("/torneos")}>
                Explorar torneos
              </button>
            }
          />
        ) : (
          <>
            <SectionTitle>Torneos</SectionTitle>
            <div className="stack">
              {mine.map((t) => {
                const g = games.find((x) => x.id === t.gameId);
                return (
                  <button key={t.id} className="mine" onClick={() => navigate(`/torneo/${t.id}`)}>
                    <Cover label={g?.name ?? t.gameId} height={60} radius={10} />
                    <div className="mine__body">
                      <div className="mine__row">
                        <span className="mine__name">{t.name}</span>
                        {t.status === "live" && <Badge tone="live">En vivo</Badge>}
                      </div>
                      <span className="mine__meta">
                        {formatDate(t.date)} · {t.time} {t.timezone}
                      </span>
                      <span className="mine__org">
                        <Icon name="users" size={12} />
                        {organizer(t.organizerId)}
                      </span>
                    </div>
                    <Icon name="chevronRight" size={18} className="mine__chev" />
                  </button>
                );
              })}
            </div>

            <div className="stack mt">
              <ListItem
                leadingIcon="wallet"
                label="Billetera"
                onClick={() => navigate("/billetera")}
                trailingIcon="chevronRight"
              />
              <ListItem
                leadingIcon="trophySmall"
                label="Ranking por juego"
                onClick={() => navigate("/ranking")}
                trailingIcon="chevronRight"
              />
            </div>
          </>
        )}
      </div>

      <TabBar />
    </Screen>
  );
}
