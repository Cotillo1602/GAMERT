import type { ReactNode } from "react";
import { cn, hash, initials } from "../../lib/utils";
import { Icon, type IconName } from "./Icon";
import "./Display.css";

/* ============================================================
   Placeholders — sustituyen a las 190 imágenes del .fig con
   degradados deterministas derivados del hash del texto.
   ============================================================ */

export function Cover({
  label,
  height,
  radius = 10,
  className,
  children,
}: {
  label: string;
  height: number;
  radius?: number;
  className?: string;
  children?: ReactNode;
}) {
  const h = hash(label);
  const a = 262 + (h % 24);
  const b = 300 + ((h >> 3) % 40);
  const angle = 120 + ((h >> 5) % 120);
  return (
    <div
      className={cn("cover", className)}
      style={{
        height,
        borderRadius: radius,
        background: `linear-gradient(${angle}deg, hsl(${a} 78% 52%), hsl(${b} 72% 38%) 55%, hsl(${b} 60% 24%))`,
      }}
    >
      <div className="cover__grid" aria-hidden="true" />
      <div className="cover__label">
        <span className="cover__initials">{initials(label)}</span>
        <span className="cover__text">{label}</span>
      </div>
      {children}
    </div>
  );
}

export function Avatar({
  name,
  size = 56,
  src,
  ring,
}: {
  name: string;
  size?: number;
  src?: string;
  ring?: boolean;
}) {
  const h = hash(name);
  const hue = 250 + (h % 60);
  return (
    <div
      className={cn("avatar", ring && "avatar--ring")}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(140deg, hsl(${hue} 70% 46%), hsl(${hue + 40} 65% 28%))`,
        fontSize: size * 0.36,
      }}
      role="img"
      aria-label={name}
    >
      {src ? <img src={src} alt="" /> : initials(name, 2)}
    </div>
  );
}

export function GameIcon({ game, size = 56 }: { game: string; size?: number }) {
  const map: Record<string, IconName> = {
    FIFA26: "gamepad",
    "E FOOTBALL": "gamepad",
    VALORANT: "crosshair",
    LOL: "gamepad",
    MINECRAFT: "layers",
    FORTNITE: "cloud",
    "TEKKEN 8": "users",
  };
  return (
    <div className="gameicon" style={{ width: size, height: size }}>
      <Icon name={map[game] ?? "gamepad"} size={size * 0.46} />
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "danger" | "warning" | "live";
  icon?: IconName;
}) {
  return (
    <span className={cn("badge", `badge--${tone}`)}>
      {tone === "live" && <span className="badge__dot" aria-hidden="true" />}
      {icon && <Icon name={icon} size={12} strokeWidth={2.2} />}
      {children}
    </span>
  );
}

export function Stat({ label, value, icon }: { label: string; value: ReactNode; icon?: IconName }) {
  return (
    <div className="stat">
      <span className="stat__label">
        {icon && <Icon name={icon} size={13} />}
        {label}
      </span>
      <span className="stat__value">{value}</span>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-title">
      <h2 className="section-title__text u-uppercase">{children}</h2>
      {action}
    </div>
  );
}

export function Divider() {
  return <hr className="divider" />;
}

export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={cn("chip", active && "is-active")} onClick={onClick} type="button">
      {children}
    </button>
  );
}
