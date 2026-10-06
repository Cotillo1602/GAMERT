import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon, type IconName } from "./Icon";
import { Avatar } from "./Display";
import "./List.css";

/* ============================================================
   List Item — instancia "List Item" del Figma (393×48,
   radius 14, stroke 1px #8a38f5) con las variantes State=Off / Selected
   ============================================================ */

export function ListItem({
  label,
  caption,
  leading,
  trailing,
  leadingIcon,
  trailingIcon,
  state = "off",
  as = "button",
  onClick,
  href,
  className,
}: {
  label: ReactNode;
  caption?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  state?: "off" | "selected";
  as?: "button" | "a" | "div";
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const cls = cn("list-item", state === "selected" && "is-selected", className);
  const inner = (
    <>
      {leading ??
        (leadingIcon && <Icon name={leadingIcon} size={20} className="list-item__icon" />)}
      <span className="list-item__body">
        <span className="list-item__label">{label}</span>
        {caption && <span className="list-item__caption">{caption}</span>}
      </span>
      {trailing ??
        (trailingIcon && <Icon name={trailingIcon} size={20} className="list-item__chevron" />)}
    </>
  );

  if (as === "a") {
    return (
      <a className={cls} href={href} onClick={(e) => e.preventDefault()}>
        {inner}
      </a>
    );
  }
  if (as === "div") {
    return <div className={cls}>{inner}</div>;
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {inner}
    </button>
  );
}

/* ============================================================
   List Tile — tarjeta horizontal usada en Torneos / Notificaciones
   ============================================================ */

export function ListTile({
  title,
  subtitle,
  leading,
  meta,
  onClick,
  selected,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  leading: ReactNode;
  meta?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn("list-tile", selected && "is-selected", className)}
      onClick={onClick}
    >
      {leading}
      <span className="list-tile__body">
        <span className="list-tile__title">{title}</span>
        {subtitle && <span className="list-tile__subtitle">{subtitle}</span>}
      </span>
      {meta && <span className="list-tile__meta">{meta}</span>}
    </button>
  );
}

/* ============================================================
   Avatar row — "USUARIO" + ELO (nodo Avatar 56×56 del Figma)
   ============================================================ */

export function AvatarRow({
  name,
  elo,
  caption,
  trailing,
  size = 56,
  onClick,
}: {
  name: string;
  elo?: number;
  caption?: ReactNode;
  trailing?: ReactNode;
  size?: number;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={cn("avatar-row", onClick && "avatar-row--btn")}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <Avatar name={name} size={size} />
      <span className="avatar-row__body">
        <span className="avatar-row__name">{name}</span>
        {elo != null && <span className="avatar-row__elo">{elo} ELO</span>}
        {caption && <span className="avatar-row__caption">{caption}</span>}
      </span>
      {trailing && <span className="avatar-row__trailing">{trailing}</span>}
    </Tag>
  );
}
