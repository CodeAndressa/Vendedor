"use client";

import { useState, useSyncExternalStore } from "react";

const CHAVE_LOCAL = "chave-admin";

// Chave das telas internas, lembrada neste navegador. Se digitar outra, vale a digitada.
export function useChaveAdmin() {
  const [digitada, setDigitada] = useState("");
  const salva = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return localStorage.getItem(CHAVE_LOCAL) ?? "";
      } catch {
        return "";
      }
    },
    () => "",
  );
  const chave = digitada || salva;
  const lembrar = () => {
    try {
      localStorage.setItem(CHAVE_LOCAL, chave);
    } catch {
      // sem armazenamento: digita de novo na próxima vez
    }
  };
  return { chave, digitada, setDigitada, salva, lembrar };
}

export function CampoChave({ digitada, setDigitada, salva }: ReturnType<typeof useChaveAdmin>) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      Chave de acesso (ADMIN_CHAVE)
      <input
        type="password"
        value={digitada}
        onChange={(e) => setDigitada(e.target.value)}
        placeholder={salva ? "Chave salva neste navegador" : ""}
        autoComplete="off"
        className="min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 outline-none transition focus:border-brand"
      />
    </label>
  );
}
