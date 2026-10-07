import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Icon, type IconName } from "../ui/Icon";
import { useUnreadCount } from "../../lib/api/hooks";
import { SolidIcon } from "../ui/Icon";
import "./Layout.css";

/* ============================================================
   Phone — marco de dispositivo 393×852 que replica el artboard
   del prototipo. En móvil real se expande a pantalla completa.
   ============================================================ */

export function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="phone-stage">
      <div className="phone">
        <div className="phone__notch" aria-hidden="true" />
        <div className="phone__screen">{children}</div>
      </div>
    </div>
  );
}

/* ============================================================
   Screen — contenedor estándar: status bar + contenido con scroll
   ============================================================ */

export function Screen({
  children,
  className,
  padded = true,
  scroll = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  scroll?: boolean;
}) {
  return (
    <div className="screen">
      <StatusBar />
      <div
        className={cn(
          "screen__body",
          padded && "screen__body--pad",
          scroll && "screen__scroll",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   StatusBar — 47px safe-area superior
   ============================================================ */

export function StatusBar({ dark = true }: { dark?: boolean }) {
  return (
    <div className={cn("statusbar", !dark && "statusbar--light")}>
      <span className="statusbar__time">9:41</span>
      <span className="statusbar__notch" aria-hidden="true" />
      <span className="statusbar__icons">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-hidden="true">
          <path d="M8 9.5 1.2 3.3A9.6 9.6 0 0 1 14.8 3.3L8 9.5z" opacity=".95" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden="true">
          <rect x=".5" y=".5" width="21" height="11" rx="3" stroke="currentColor" opacity=".5" />
          <rect x="2" y="2" width="16" height="8" rx="1.6" fill="currentColor" />
          <path d="M23.5 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity=".5" />
        </svg>
      </span>
    </div>
  );
}

/* ============================================================
   Logo — marca GAMERT (Orbitron Black + glifo)
   ============================================================ */

export function Logo({
  size = 44,
  withWordmark = true,
  glow = true,
}: {
  size?: number;
  withWordmark?: boolean;
  glow?: boolean;
}) {
  return (
    <div className={cn("logo", glow && "logo--glow")}>
      <span className="logo__mark" style={{ width: size, height: size }}>
        <SolidIcon size={size * 0.62}>
          <path d="M12 1.5 3 5.2v6.4c0 5.6 3.8 9.9 9 11.4 5.2-1.5 9-5.8 9-11.4V5.2L12 1.5zm0 2.4 7 2.9v4.8c0 4.4-2.9 7.9-7 9.2-4.1-1.3-7-4.8-7-9.2V6.8l7-2.9zm0 3a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2z" />
        </SolidIcon>
      </span>
      {withWordmark && (
        <span className="logo__word" style={{ fontSize: size * 0.52 }}>
          GAMERT
        </span>
      )}
    </div>
  );
}

/* ============================================================
   AppBar — cabecera con retroceso / título / acciones
   ============================================================ */

export function AppBar({
  title,
  subtitle,
  onBack,
  actions,
  logo = false,
  borderless = false,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  onBack?: () => void;
  actions?: ReactNode;
  logo?: boolean;
  borderless?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <header className={cn("appbar", borderless && "appbar--borderless")}>
      {onBack ? (
        <button className="appbar__back" onClick={onBack} aria-label="Volver">
          <Icon name="arrowLeft" size={22} />
        </button>
      ) : logo ? (
        <Logo size={30} />
      ) : (
        <span className="appbar__spacer" />
      )}

      {(title || logo) && (
        <div className="appbar__titles">
          {title && <h1 className="appbar__title">{title}</h1>}
          {subtitle && <p className="appbar__subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="appbar__actions">
        {actions ?? (
          <>
            <button
              className="appbar__action"
              onClick={() => navigate("/notificaciones")}
              aria-label="Notificaciones"
            >
              <NotificationBell />
            </button>
            <button className="appbar__action" onClick={() => navigate("/menu")} aria-label="Menú">
              <Icon name="menu" size={22} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadCount();
  return (
    <span className="bell">
      <Icon name="bell" size={22} />
      {unreadCount > 0 && <span className="bell__dot">{unreadCount}</span>}
    </span>
  );
}

/* ============================================================
   Barra de búsqueda con filtro opcional (torneos, categorías)
   ============================================================ */

export function FilterRow({
  items,
  value,
  onChange,
}: {
  items: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="filterrow" role="tablist">
      {items.map((it) => (
        <button
          key={it}
          role="tab"
          aria-selected={value === it}
          className={cn("filterrow__item", value === it && "is-active")}
          onClick={() => onChange(it)}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   PageHeader de categorías (con avatar y badges del Figma)
   ============================================================ */

export function CategoryHeader({
  name,
  followers,
  game,
}: {
  name: string;
  followers?: string;
  game?: string;
}) {
  return (
    <div className="cat-header">
      <div className="cat-header__top">
        <span className="cat-header__name u-uppercase">{name}</span>
        {followers && <span className="cat-header__followers">{followers}</span>}
      </div>
      {game && <span className="cat-header__game">{game}</span>}
    </div>
  );
}

/* ============================================================
   IconButton genérico
   ============================================================ */

export function IconButton({
  icon,
  onClick,
  label,
  badge,
}: {
  icon: IconName;
  onClick?: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button className="iconbtn" onClick={onClick} aria-label={label}>
      <Icon name={icon} size={21} />
      {badge != null && badge > 0 && <span className="iconbtn__badge">{badge}</span>}
    </button>
  );
}
