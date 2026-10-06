import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppBar, FilterRow, Screen } from "../components/layout/Layout";
import { Avatar, Badge, SectionTitle } from "../components/ui/Display";
import { Icon } from "../components/ui/Icon";
import { eloTier } from "../lib/elo";
import { useAllPlayers, useGame, useRanking, useStandings, useTournament } from "../lib/api/hooks";
import { useApp } from "../store/AppContext";
import "../styles/screens.css";

const TABS = ["Clasificación", "Eliminación"] as const;

/**
 * Clasificación real del torneo: la genera el cuadro (`standingsOf`), no una
 * tabla estática. El ELO mostrado es el del juego del torneo, nunca el global.
 */
export function Clasificacion() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { userId } = useApp();
  const [tab, setTab] = useState<string>(TABS[0]);

  const { data: t } = useTournament(id);
  const gameId = t?.gameId ?? "fifa26";
  const { data: game } = useGame(gameId);
  const { data: players = [] } = useAllPlayers();
  const nameOf = (playerId: string) => players.find((p) => p.id === playerId)?.name ?? "?";

  const { data: standing = [] } = useStandings(id);
  const { data: ratingByPlayer = [] } = useRanking(gameId);
  const eloOf = (playerId: string) => ratingByPlayer.find((r) => r.playerId === playerId)?.elo;

  const rows = useMemo(() => {
    const ordered = [...standing].sort((a, b) => b.wins - a.wins || b.points - a.points);
    if (tab === TABS[0]) return ordered;
    return ordered.filter((r) => r.wins > 0);
  }, [standing, tab]);

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Clasificación" subtitle={t?.name} />

      <div className="torneos__filters">
        <FilterRow items={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="screen__body--pad screen__scroll">
        {rows.length === 0 ? (
          <div className="empty">
            <span className="empty__icon">
              <Icon name="chart" size={26} />
            </span>
            <p className="empty__text">Todavía no hay partidas jugadas en este torneo.</p>
          </div>
        ) : (
          <>
            <div className="standhead">
              <span className="standhead__col">#</span>
              <span className="standhead__col">Jugador</span>
              <span className="standhead__col standhead__col--r">PJ</span>
              <span className="standhead__col standhead__col--r">ELO</span>
            </div>

            <div className="stack">
              {rows.map((r, i) => {
                const mine = r.playerId === userId;
                const elo = eloOf(r.playerId);
                const qualified = tab === TABS[1] && r.wins > 0;
                return (
                  <div
                    key={r.playerId}
                    className={
                      mine ? "standrow is-me" : qualified ? "standrow is-qualified" : "standrow"
                    }
                  >
                    <span className="standrow__pos">
                      {i === 0 ? (
                        <Icon
                          name="trophySmall"
                          size={16}
                          className="standrow__medal standrow__medal--gold"
                        />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <Avatar name={nameOf(r.playerId)} size={36} />
                    <span className="standrow__body">
                      <span className="standrow__name">
                        {nameOf(r.playerId)}
                        {mine && <span className="standrow__you">Tú</span>}
                      </span>
                      <span className="standrow__team">
                        {r.wins}V · {r.losses}D · {eloTier(elo?.rating ?? 0).label}
                      </span>
                    </span>
                    <span className="standrow__num">{r.played}</span>
                    <span className="standrow__num standrow__elo">{elo?.rating ?? 0}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <SectionTitle>
          <span className="u-uppercase">Formato</span>
        </SectionTitle>
        <div className="stack">
          <div className="inforow">
            <Icon name="gamepad" size={16} className="inforow__icon" />
            <span className="inforow__label">Juego</span>
            <span className="inforow__value">{game?.name ?? gameId}</span>
          </div>
          <div className="inforow">
            <Icon name="users" size={16} className="inforow__icon" />
            <span className="inforow__label">Modalidad</span>
            <span className="inforow__value">{t?.modality ?? "Virtual"}</span>
          </div>
          <div className="inforow">
            <Icon name="trophy" size={16} className="inforow__icon" />
            <span className="inforow__label">Sistema</span>
            <span className="inforow__value">Eliminación directa</span>
          </div>
        </div>

        <Badge tone="neutral" icon="alertTriangle">
          El desempate se resuelve por ELO del juego del torneo, no por diferencia de goles.
        </Badge>
      </div>
    </Screen>
  );
}
