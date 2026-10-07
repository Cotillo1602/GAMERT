import { useNavigate } from "react-router-dom";
import { Screen, Logo } from "../components/layout/Layout";
import { Avatar, Divider } from "../components/ui/Display";
import { ListItem } from "../components/ui/List";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { appVersion } from "../lib/api/app";
import { useBalance, useProfile, useSignOut, useUnreadCount, useUserId } from "../lib/api/hooks";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

export function Menu() {
  const navigate = useNavigate();
  const userId = useUserId();
  const balance = useBalance();
  const toast = useToast();

  const { data: me } = useProfile(userId);
  const { data: unread = 0 } = useUnreadCount();
  const signOut = useSignOut();
  const mainGame = me?.mainGame.toUpperCase() ?? "GAMERT";

  return (
    <Screen className="menu" scroll={false}>
      <div className="menu__head">
        <div className="menu__headbar">
          <Logo size={30} />
          <button className="appbar__action" onClick={() => navigate(-1)} aria-label="Cerrar">
            <Icon name="x" size={22} />
          </button>
        </div>

        <button className="menu__user" onClick={() => navigate("/perfil")}>
          <Avatar name={me?.name ?? "?"} size={60} />
          <div className="menu__userbody">
            <span className="menu__username">{me?.name}</span>
            <span className="menu__userteam">{mainGame}</span>
          </div>
          <Icon name="chevronRight" size={18} className="u-tertiary" />
        </button>

        <div className="menu__wallet">
          <span>
            <Icon name="wallet" size={15} />
            Saldo
          </span>
          <strong>{`$${balance}`}</strong>
        </div>
      </div>

      <div className="menu__body">
        <p className="sectionlabel u-uppercase">Competir</p>
        <div className="stack">
          <ListItem
            leadingIcon="trophy"
            label="Torneos"
            trailingIcon="chevronRight"
            onClick={() => navigate("/torneos")}
          />
          <ListItem
            leadingIcon="list"
            label="Mis Torneos"
            trailingIcon="chevronRight"
            onClick={() => navigate("/mis-torneos")}
            caption="Tus inscripciones activas"
          />
          <ListItem
            leadingIcon="chart"
            label="Ranking"
            trailingIcon="chevronRight"
            onClick={() => navigate("/ranking")}
            caption="Un ELO por juego"
          />
          <ListItem
            leadingIcon="layers"
            label="Juegos"
            trailingIcon="chevronRight"
            onClick={() => navigate("/juegos")}
          />
          <ListItem
            leadingIcon="medal"
            label="Organizar torneo"
            trailingIcon="chevronRight"
            onClick={() => navigate("/organizar")}
            caption="Publicá y la app lo opera"
          />
        </div>

        <Divider />

        <p className="sectionlabel u-uppercase">Cuenta</p>
        <div className="stack">
          <ListItem
            leadingIcon="user"
            label="Mi perfil"
            trailingIcon="chevronRight"
            onClick={() => navigate("/perfil")}
          />
          <ListItem
            leadingIcon="wallet"
            label="Billetera"
            trailingIcon="chevronRight"
            onClick={() => navigate("/billetera")}
          />
          <ListItem
            leadingIcon="bell"
            label="Notificaciones"
            trailingIcon="chevronRight"
            onClick={() => navigate("/notificaciones")}
            caption={unread > 0 ? `${unread} sin leer` : undefined}
          />
          <ListItem
            leadingIcon="users"
            label="Organizaciones"
            trailingIcon="chevronRight"
            onClick={() => navigate("/organizaciones")}
          />
          <ListItem
            leadingIcon="settings"
            label="Configuración"
            trailingIcon="chevronRight"
            onClick={() => navigate("/configuracion")}
          />
        </div>

        <Divider />

        <div className="stack">
          <ListItem
            leadingIcon="help"
            label="Ayuda y soporte"
            trailingIcon="chevronRight"
            onClick={() => toast.info("Ayuda y soporte próximamente")}
          />
          <ListItem
            leadingIcon="link"
            label="Invitar a un amigo"
            trailingIcon="chevronRight"
            onClick={() => toast.info("Enlace de invitación copiado")}
          />
        </div>

        <Button block variant="danger" iconLeft="logOut" onClick={() => signOut.mutate()}>
          Cerrar sesión
        </Button>

        <p className="menu__version">{appVersion}</p>
      </div>
    </Screen>
  );
}
