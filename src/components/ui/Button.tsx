import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon, type IconName } from "./Icon";
import "./Button.css";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "surface";
type Size = "sm" | "md" | "lg" | "pill";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  iconLeft,
  iconRight,
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : 18;

  return (
    <button
      className={cn(
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        block && "btn--block",
        loading && "is-loading",
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span
          className="btn__spinner"
          style={{ width: iconSize, height: iconSize }}
          aria-hidden="true"
        />
      ) : (
        iconLeft && <Icon name={iconLeft} size={iconSize} />
      )}
      {children != null && <span className="btn__label">{children}</span>}
      {!loading && iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}

export function ButtonGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("btn-group", className)}>{children}</div>;
}
