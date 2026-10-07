import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Icon, type IconName } from "../ui/Icon";
import { useUnreadCount } from "../../lib/api/hooks";
import "./TabBar.css";

/* Barra inferior de 85px con 4 destinos + botón central para organizar.
   Traduce las instancias "Início / Torneos / Ranking / Perfil" del Figma. */

const TABS: { to: string; icon: IconName; label: string }[] = [
  { to: "/home", icon: "home", label: "Inicio" },
  { to: "/torneos", icon: "trophy", label: "Torneos" },
  { to: "/ranking", icon: "chart", label: "Ranking" },
  { to: "/perfil", icon: "user", label: "Perfil" },
];

export function TabBar({ onCreate }: { onCreate?: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadCount();
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  const isActive = (to: string) =>
    pathname === to || (to !== "/home" && pathname.startsWith(`${to}/`));

  return (
    <nav className="tabbar" aria-label="Navegación principal">
      {left.map((t) => (
        <TabLink key={t.to} {...t} active={isActive(t.to)} />
      ))}

      <button
        className="tabbar__fab"
        onClick={() => (onCreate ? onCreate() : navigate("/organizar"))}
        aria-label="Organizar un torneo"
      >
        <Icon name="plus" size={24} strokeWidth={2.2} />
      </button>

      {right.map((t) => (
        <TabLink
          key={t.to}
          {...t}
          active={isActive(t.to)}
          badge={t.to === "/perfil" ? unreadCount : 0}
        />
      ))}
    </nav>
  );
}

function TabLink({
  to,
  icon,
  label,
  active,
  badge = 0,
}: {
  to: string;
  icon: IconName;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <NavLink to={to} className={cn("tabbar__item", active && "is-active")}>
      <span className="tabbar__iconwrap">
        <Icon name={icon} size={22} strokeWidth={active ? 2.1 : 1.7} />
        {badge > 0 && <span className="tabbar__badge">{badge}</span>}
      </span>
      <span className="tabbar__label">{label}</span>
    </NavLink>
  );
}
