import { useNavigate } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Icon } from "../components/ui/Icon";
import { notificationsEmpty, type AppNotification } from "../data/app";
import { useApp } from "../store/AppContext";
import { formatDate } from "../lib/utils";
import "../styles/screens.css";

export function Notificaciones() {
  const navigate = useNavigate();
  const { notifications: items, unreadCount, markAllRead } = useApp();

  return (
    <Screen padded={false} scroll={false}>
      <AppBar
        onBack={() => navigate(-1)}
        title="Notificaciones"
        subtitle={unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
        actions={
          unreadCount > 0 ? (
            <button
              className="appbar__action"
              onClick={markAllRead}
              aria-label="Marcar todo como leído"
            >
              <Icon name="checkCircle" size={22} />
            </button>
          ) : undefined
        }
      />

      <div className="screen__body--pad screen__scroll">
        {items.length === 0 ? (
          /* Empty State — copy literal del Figma */
          <div className="empty empty--tall">
            <span className="empty__icon empty__icon--big">
              <Icon name="bell" size={30} />
            </span>
            <p className="empty__title">{notificationsEmpty.title}</p>
            <p className="empty__text">{notificationsEmpty.body}</p>
          </div>
        ) : (
          <div className="stack">
            {items.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}

function NotificationRow({ n }: { n: AppNotification }) {
  const icon = n.kind === "torneo" ? "trophy" : n.kind === "pago" ? "wallet" : "shield";
  return (
    <div className={n.read ? "notif" : "notif is-unread"}>
      <span className="notif__icon">
        <Icon name={icon} size={19} />
      </span>
      <div className="notif__body">
        <p className="notif__title">{n.title}</p>
        <p className="notif__text">{n.body}</p>
        <span className="notif__date">{formatDate(n.date.slice(0, 10))}</span>
      </div>
      {!n.read && <span className="notif__dot" aria-label="Sin leer" />}
    </div>
  );
}
