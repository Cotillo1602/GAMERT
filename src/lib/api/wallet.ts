import type { WalletMovement } from "../../data/app";
import { todayISO } from "../../data/tournaments";
import { commitState, loadState } from "./demo-store";

export async function getBalance(): Promise<number> {
  if (typeof window === "undefined") return loadState().balance;
  return loadState().balance;
}

export async function listWallet(): Promise<WalletMovement[]> {
  return loadState().wallet;
}

/** Recarga la billetera demo: suma saldo y registra el movimiento. */
export async function addFunds(amount: number): Promise<void> {
  commitState((s) => ({
    ...s,
    balance: s.balance + amount,
    wallet: [
      { id: `w-${Date.now()}`, kind: "RECARGA", amount, success: true, date: todayISO() },
      ...s.wallet,
    ],
  }));
}
