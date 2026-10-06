import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, FilterRow, Screen } from "../components/layout/Layout";
import { Cover, Badge, SectionTitle, Avatar } from "../components/ui/Display";
import { Icon } from "../components/ui/Icon";
import { useGames, useOrganizedBy, useOrganizers, useTournaments } from "../lib/api/hooks";
import { useApp } from "../store/AppContext";
import "../styles/screens.css";

const FILTERS = ["TODOS", "EDITORIAL", "COMUNIDAD", "MIS TORNEOS"] as const;

/**
 * "Organizaciones" son dos cosas distintas en la plataforma: las cuentas
 * editoriales de publishers y los jugadores de la comunidad que organizan.
 * El estado vivo (live/upcoming) se deriva de los torneos del store.
 */
export function Organizaciones() {
  const navigate = useNavigate();
  const { userId } = useApp();
  const [filter, setFilter] = useState<string>(FILTERS[0]);
  const [following, setFollowing] = useState<string[]>([]);

  const { data: all = [] } = useTournaments();
  const { data: orgs } = useOrganizers();
  const { data: myOrganized = [] } = useOrganizedBy(userId);
  const { data: games = [] } = useGames();
  const gameName = new Map<string, string>(games.map((g) => [g.id, g.name]));

  const list = useMemo(() => {
    const allOrgs = orgs ?? [];
    switch (filter) {
      case "EDITORIAL":
        return allOrgs.filter((o) => o.kind === "editorial");
      case "COMUNIDAD":
        return allOrgs.filter((o) => o.kind === "comunidad");
      case "MIS TORNEOS":
        return allOrgs.filter((o) => myOrganized.some((t) => t.organizerId === o.id));
      default:
        return allOrgs;
    }
  }, [filter, orgs, myOrganized]);

  function toggle(id: string) {
    setFollowing((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Comunidad" />

      <div className="torneos__filters">
        <FilterRow items={FILTERS} value={filter} onChange={setFilter} />
      </div>

      <div className="screen__body--pad screen__scroll">
        <div className="managednote">
          <Icon name="medal" size={18} />
          <div>
            <strong>Publisher vs. comunidad</strong>
            <p>
              Las cuentas editoriales publican con premios verificados. Los organizadores de
              comunidad los financian con su reputation y la app les habilita el cobro si se lo
              ganaron.
            </p>
          </div>
        </div>

        <div className="stack">
          {list.map((o) => {
            const live = all.filter(
              (t) => t.organizerId === o.id && (t.status === "live" || t.status === "upcoming"),
            ).length;
            return (
              <div key={o.id} className="org">
                {o.kind === "editorial" ? (
                  <Cover label={o.name} height={84} radius={12} className="org__cover" />
                ) : (
                  <span className="org__cover org__cover--avatar">
                    <Avatar name={o.name} size={56} />
                  </span>
                )}

                <div className="org__body">
                  <div className="org__row">
                    <span className="org__name">{o.name}</span>
                    {o.verified && (
                      <span className="org__verified" aria-label="Cuenta verificada">
                        <Icon name="checkCircle" size={15} />
                      </span>
                    )}
                  </div>
                  <span className="org__game">
                    {o.games.length > 0
                      ? o.games.map((g) => gameName.get(g) ?? g).join(" · ")
                      : "Torneos propios"}
                  </span>
                  <span className="org__followers">
                    <Icon name="users" size={12} />
                    {o.followers.toLocaleString("es")} seguidores
                    {live > 0
                      ? ` · ${live} torneo${live > 1 ? "s" : ""} activo${live > 1 ? "s" : ""}`
                      : ""}
                  </span>
                </div>

                <button
                  className={following.includes(o.id) ? "orgbtn is-on" : "orgbtn"}
                  onClick={() => toggle(o.id)}
                >
                  {following.includes(o.id) ? "Siguiendo" : "Seguir"}
                </button>
              </div>
            );
          })}
        </div>

        <SectionTitle>Torneos de la comunidad</SectionTitle>
        <div className="stack">
          {all
            .filter((t) => t.status !== "finished")
            .slice(0, 3)
            .map((t) => (
              <button key={t.id} className="catrowcard" onClick={() => navigate(`/torneo/${t.id}`)}>
                <Cover label={gameName.get(t.gameId) ?? t.gameId} height={56} radius={10} />
                <div className="catrowcard__body">
                  <span className="catrowcard__name">{t.name}</span>
                  <span className="catrowcard__desc">
                    {t.enrolled}/{t.slots} inscritos · {t.modality}
                  </span>
                </div>
                <Badge tone={t.publisherTier === "editorial" ? "primary" : "neutral"}>
                  {t.publisherTier === "editorial" ? "Editorial" : "Comunidad"}
                </Badge>
              </button>
            ))}
        </div>
      </div>
    </Screen>
  );
}
