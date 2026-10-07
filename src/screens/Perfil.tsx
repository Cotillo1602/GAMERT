import { useNavigate } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { TabBar } from "../components/layout/TabBar";
import { Avatar, SectionTitle, Divider, Badge } from "../components/ui/Display";
import { ListItem } from "../components/ui/List";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import {
  useBalance,
  useEloPerGame,
  useGames,
  useMyTournaments,
  useProfile,
  useSignOut,
  useUserId,
} from "../lib/api/hooks";
import { useToast } from "../components/layout/Toast";
import { eloTier } from "../lib/elo";
import type { Game } from "../lib/api/games";
import type { EloRecord } from "../lib/elo";
import "../styles/screens.css";

export function Perfil() {
  const navigate = useNavigate();
  const userId = useUserId();
  const balance = useBalance();
  const toast = useToast();

  const { data: player } = useProfile(userId);
  const { data: games = [] } = useGames();
  const { data: perGame = [] } = useEloPerGame(userId);
  const { data: myTournaments = [] } = useMyTournaments(userId);
  const signOut = useSignOut();

  const gameOf = new Map<string, Game>(games.map((g) => [g.id, g]));
  const me = perGame
    .map((x) => ({ g: gameOf.get(x.gameId), elo: x.elo }))
    .filter((x): x is { g: NonNullable<typeof x.g>; elo: EloRecord } =>
      Boolean(x.g && x.elo.played > 0),
    );
  const main = me.find((x) => x.g.id === String(player?.mainGame ?? "")) ?? me[0];
  const mainTier = main ? eloTier(main.elo.rating) : null;

  const totalPlayed = me.reduce((s, x) => s + x.elo.played, 0);
  const totalWins = me.reduce((s, x) => s + x.elo.wins, 0);
  const totalLosses = me.reduce((s, x) => s + x.elo.losses, 0);
  const best = me.reduce<EloRecord | null>(
    (acc, x) => (!acc || x.elo.peak > acc.peak ? x.elo : acc),
    null,
  );

  return (
    <Screen padded={false} scroll={false}>
      <AppBar
        title="Perfil"
        actions={
          <button
            className="appbar__action"
            onClick={() => navigate("/configuracion")}
            aria-label="Configuración"
          >
            <Icon name="settings" size={22} />
          </button>
        }
      />

      <div className="screen__body--pad screen__scroll">
        <div className="profilehead">
          <Avatar name={player?.name ?? "?"} size={92} ring />
          <h1 className="profilehead__name">{player?.name}</h1>
          <p className="profilehead__title u-uppercase">{player?.handle}</p>

          <div className="profilehead__stats">
            <div className="profilehead__stat">
              <span className="profilehead__value">{main?.elo.rating ?? 0}</span>
              <span className="profilehead__label">ELO {main?.g.short}</span>
            </div>
            <span className="profilehead__div" />
            <div className="profilehead__stat">
              <span className="profilehead__value">{totalPlayed}</span>
              <span className="profilehead__label">Partidas</span>
            </div>
            <span className="profilehead__div" />
            <div className="profilehead__stat">
              <span className="profilehead__value">{myTournaments.length}</span>
              <span className="profilehead__label">Torneos</span>
            </div>
          </div>

          {mainTier && <Badge tone={mainTier.tone}>{mainTier.label}</Badge>}
        </div>

        <Button
          block
          variant="surface"
          iconLeft="edit"
          onClick={() => toast.info("Edición de perfil próximamente")}
        >
          Editar perfil
        </Button>

        <div className="achgrid">
          <div className="ach">
            <span className="ach__value">{totalWins}</span>
            <span className="ach__label">Victorias</span>
          </div>
          <div className="ach">
            <span className="ach__value">{totalLosses}</span>
            <span className="ach__label">Derrotas</span>
          </div>
          <div className="ach">
            <span className="ach__value">{best?.peak ?? 0}</span>
            <span className="ach__label">ELO máximo</span>
          </div>
          <div className="ach">
            <span className="ach__value">
              {totalPlayed > 0 ? `${Math.round((totalWins / totalPlayed) * 100)}%` : "—"}
            </span>
            <span className="ach__label">Winrate</span>
          </div>
        </div>

        {/* ELO por juego: el corazón del producto */}
        <section>
          <SectionTitle
            action={
              <button
                className="linkbtn"
                onClick={() => navigate(`/ranking/${main?.g.id ?? "fifa26"}`)}
              >
                Ver ranking
              </button>
            }
          >
            ELO por juego
          </SectionTitle>
          <div className="stack">
            {me.map(({ g, elo }) => {
              const tier = eloTier(elo.rating);
              const isEA = g.id === "fifa26" || g.id === "efootball";
              return (
                <button key={g.id} className="eloline" onClick={() => navigate(`/ranking/${g.id}`)}>
                  <span className="eloline__icon" style={{ color: g.accent }}>
                    <Icon name={g.icon} size={18} />
                  </span>
                  <span className="eloline__body">
                    <span className="eloline__game">{g.name}</span>
                    <span className="eloline__meta">
                      {elo.wins}V · {elo.losses}D · pico {elo.peak}
                      {isEA ? " · ruta EA Sports" : ""}
                    </span>
                  </span>
                  <span className="eloline__rating">
                    {elo.rating}
                    <small>{tier.label}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <Divider />

        <section>
          <SectionTitle>Cuenta</SectionTitle>
          <div className="stack">
            <ListItem
              leadingIcon="trophy"
              label="Mis torneos"
              onClick={() => navigate("/mis-torneos")}
              trailingIcon="chevronRight"
              caption={`${myTournaments.length} inscripciones`}
            />
            <ListItem
              leadingIcon="wallet"
              label="Billetera"
              onClick={() => navigate("/billetera")}
              trailingIcon="chevronRight"
              caption={`Saldo $${balance}`}
            />
            <ListItem
              leadingIcon="bell"
              label="Notificaciones"
              onClick={() => navigate("/notificaciones")}
              trailingIcon="chevronRight"
            />
            <ListItem
              leadingIcon="medal"
              label="Organizar torneo"
              onClick={() => navigate("/organizar")}
              trailingIcon="chevronRight"
              caption={
                player?.organizer
                  ? `Organizador ${player.organizer.tier}`
                  : "Publicá tu primer torneo"
              }
            />
            <ListItem
              leadingIcon="users"
              label="Organizaciones"
              onClick={() => navigate("/organizaciones")}
              trailingIcon="chevronRight"
            />
            <ListItem
              leadingIcon="settings"
              label="Configuración"
              onClick={() => navigate("/configuracion")}
              trailingIcon="chevronRight"
            />
          </div>
        </section>

        <Button block variant="danger" iconLeft="logOut" onClick={() => signOut.mutate()}>
          Cerrar sesión
        </Button>
      </div>

      <TabBar />
    </Screen>
  );
}
