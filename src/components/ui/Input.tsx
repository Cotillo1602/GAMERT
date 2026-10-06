import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon, type IconName } from "./Icon";
import "./Input.css";

interface BaseProps {
  label?: string;
  error?: string;
  iconLeft?: IconName;
  hint?: string;
}

export function Input({
  label,
  error,
  iconLeft,
  hint,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & BaseProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className={cn("field", error && "field--error", className)}>
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="field__box">
        {iconLeft && (
          <span className="field__icon">
            <Icon name={iconLeft} size={18} />
          </span>
        )}
        <input id={inputId} className="field__input" {...rest} />
      </div>
      {error ? (
        <p className="field__msg field__msg--error">{error}</p>
      ) : hint ? (
        <p className="field__msg">{hint}</p>
      ) : null}
    </div>
  );
}

export function PasswordInput({
  label,
  error,
  hint,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & BaseProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("field", error && "field--error", className)}>
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="field__box">
        <input
          id={inputId}
          className="field__input field__input--pad"
          type={visible ? "text" : "password"}
          {...rest}
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <Icon name={visible ? "eye" : "eyeOff"} size={20} />
        </button>
      </div>
      {error ? (
        <p className="field__msg field__msg--error">{error}</p>
      ) : hint ? (
        <p className="field__msg">{hint}</p>
      ) : null}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onClear?: () => void;
}) {
  return (
    <div className="searchbar">
      <Icon name="search" size={18} className="searchbar__icon" />
      <input
        className="searchbar__input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value ? (
        <button
          className="searchbar__clear"
          onClick={onClear ?? (() => onChange(""))}
          aria-label="Limpiar búsqueda"
        >
          <Icon name="x" size={18} />
        </button>
      ) : null}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  id?: string;
}) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <label className="check" htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={cn("check__box", checked && "is-checked")} aria-hidden="true">
        {checked && <Icon name="check" size={13} strokeWidth={3} />}
      </span>
      <span className="check__label">{label}</span>
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn("toggle", checked && "is-on")}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__knob" />
    </button>
  );
}
