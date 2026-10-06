import { useNavigate } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Toggle } from "../components/ui/Input";
import { ListItem } from "../components/ui/List";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { appVersion } from "../lib/api/app";
import { useSettings, useUpdateSetting } from "../lib/api/hooks";
import type { Settings } from "../lib/api/settings";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/layout/Toast";
import "../styles/screens.css";

export function Configuracion() {
  const navigate = useNavigate();
  const { reset } = useApp();
  const toast = useToast();

  const { data: settings } = useSettings();
  const update = useUpdateSetting();

  const toggles: {
    key: keyof Settings;
    icon: "user" | "shield" | "volume" | "globe" | "bell";
    label: string;
    caption: string;
  }[] = [
    {
      key: "profilePrivate",
      icon: "user",
      label: "Perfil privado",
      caption: "Solo tus amigos pueden verte",
    },
    {
      key: "securityAndPassword",
      icon: "shield",
      label: "Seguridad y contraseña",
      caption: "Cambiar contraseña y verificación 2FA",
    },
    {
      key: "sounds",
      icon: "volume",
      label: "Sonidos de la aplicación",
      caption: "Efectos al navegar y recibir alertas",
    },
    { key: "language", icon: "globe", label: "Idioma", caption: "Español (España)" },
    {
      key: "pushNotifications",
      icon: "bell",
      label: "Notificaciones push",
      caption: "Avisos de torneos y pagos",
    },
  ];

  function onChange(key: keyof Settings, value: boolean) {
    const snake = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`) as "sounds";
    update.mutate({ [snake]: value });
  }

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Configuración" />

      <div className="screen__body--pad screen__scroll">
        <Section />
        {toggles.map((t) => (
          <div key={t.key} className="setrow">
            <span className="setrow__icon">
              <Icon name={t.icon} size={19} />
            </span>
            <span className="setrow__body">
              <span className="setrow__label">{t.label}</span>
              <span className="setrow__caption">{t.caption}</span>
            </span>
            <Toggle
              checked={settings?.[t.key] ?? false}
              onChange={(v) => onChange(t.key, v)}
              label={t.label}
            />
          </div>
        ))}

        <Section title="Cuenta" />
        <div className="stack">
          <ListItem
            leadingIcon="wallet"
            label="Billetera"
            trailingIcon="chevronRight"
            onClick={() => navigate("/billetera")}
          />
          <ListItem
            leadingIcon="help"
            label="Centro de ayuda"
            trailingIcon="chevronRight"
            onClick={() => toast.info("Centro de ayuda próximamente")}
          />
          <ListItem
            leadingIcon="alertTriangle"
            label="Reportar un problema"
            trailingIcon="chevronRight"
            onClick={() => toast.info("Gracias, lo revisaremos")}
          />
        </div>

        <Section title="Legal" />
        <div className="stack">
          <ListItem
            label="Términos y condiciones"
            trailingIcon="chevronRight"
            onClick={() => toast.info("Términos y condiciones")}
          />
          <ListItem
            label="Política de privacidad"
            trailingIcon="chevronRight"
            onClick={() => toast.info("Política de privacidad")}
          />
        </div>

        <Button
          block
          variant="danger"
          iconLeft="trash"
          onClick={() => {
            reset();
            toast.success("Datos locales restablecidos");
            navigate("/login", { replace: true });
          }}
        >
          Restablecer datos de la aplicación
        </Button>

        <p className="version">{appVersion}</p>
      </div>
    </Screen>
  );
}

function Section({ title }: { title?: string }) {
  if (!title) return <div className="settingspacer" />;
  return <p className="settingslabel u-uppercase">{title}</p>;
}
