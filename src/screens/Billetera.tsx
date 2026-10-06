import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Screen } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Icon } from "../components/ui/Icon";
import { useApp } from "../store/AppContext";
import { useToast } from "../components/layout/Toast";
import { money } from "../lib/utils";
import "../styles/screens.css";

const PACKAGES = [
  { id: "p10", amount: 10, bonus: 0 },
  { id: "p30", amount: 30, bonus: 2 },
  { id: "p50", amount: 50, bonus: 5 },
  { id: "p100", amount: 100, bonus: 15 },
];

export function Billetera() {
  const navigate = useNavigate();
  const { balance, wallet, addFunds } = useApp();
  const toast = useToast();

  const [mode, setMode] = useState<"recarga" | "retiro">("recarga");
  const [selected, setSelected] = useState("p30");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const pkg = PACKAGES.find((p) => p.id === selected) ?? PACKAGES[1];
  const total = mode === "recarga" ? pkg.amount + pkg.bonus : pkg.amount;

  function submit() {
    if (mode === "retiro" && (!amount || Number(amount) <= 0)) {
      return toast.warning("Ingresa un monto válido para retirar");
    }
    if (mode === "retiro" && Number(amount) > balance) {
      return toast.error("No tienes saldo suficiente");
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (mode === "recarga") {
        addFunds(total);
        toast.success(`Recarga realizada: ${money(total)}`);
      } else {
        toast.info(`Retiro de ${money(Number(amount))} en proceso`);
      }
      setAmount("");
    }, 1000);
  }

  return (
    <Screen padded={false} scroll={false}>
      <AppBar onBack={() => navigate(-1)} title="Billetera" />

      <div className="screen__body--pad screen__scroll">
        <div className="balance">
          <span className="balance__label">Saldo disponible</span>
          <span className="balance__value">{money(balance, true)}</span>
          <span className="balance__hint">Fondos disponibles para inscripciones y premios</span>
        </div>

        <div className="seg">
          <button
            className={mode === "recarga" ? "seg__item is-on" : "seg__item"}
            onClick={() => setMode("recarga")}
          >
            Recargar
          </button>
          <button
            className={mode === "retiro" ? "seg__item is-on" : "seg__item"}
            onClick={() => setMode("retiro")}
          >
            Retirar
          </button>
        </div>

        {mode === "recarga" ? (
          <div className="pkgrid">
            {PACKAGES.map((p) => (
              <button
                key={p.id}
                className={selected === p.id ? "pkcard is-on" : "pkcard"}
                onClick={() => setSelected(p.id)}
              >
                <span className="pkcard__amount">{money(p.amount)}</span>
                {p.bonus > 0 ? (
                  <span className="pkcard__bonus">+{money(p.bonus)}</span>
                ) : (
                  <span className="pkcard__none">—</span>
                )}
                {selected === p.id && (
                  <span className="pkcard__check">
                    <Icon name="check" size={13} strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <Input
            label="Monto a retirar"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint={`Máximo disponible: ${money(balance, true)}`}
          />
        )}

        <Button
          block
          size="lg"
          loading={loading}
          onClick={submit}
          iconLeft={mode === "recarga" ? "plus" : "check"}
        >
          {mode === "recarga"
            ? `Recargar ${money(total)}`
            : `Retirar ${amount ? money(Number(amount)) : ""}`}
        </Button>

        <p className="sectionlabel u-uppercase">Historial</p>

        <div className="stack">
          {wallet.map((m) => (
            <div key={m.id} className={m.success ? "mov mov--ok" : "mov mov--fail"}>
              <span className="mov__icon">
                <Icon name={m.kind === "RECARGA" ? "plus" : "arrowRight"} size={17} />
              </span>
              <span className="mov__body">
                <span className="mov__kind u-uppercase">{m.kind}</span>
                <span className="mov__date">{m.date}</span>
              </span>
              <span className="mov__amount">
                {m.kind === "RECARGA" ? "+" : "-"}
                {money(m.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
