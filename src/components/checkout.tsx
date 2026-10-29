"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Lock, X } from "lucide-react";
import { linkWhatsApp } from "@/lib/config";
import { documentoValido } from "@/lib/documento";
import { evento } from "@/lib/rastreio";
import { WhatsAppIcon } from "./ui";

const campo = "min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 outline-none transition focus:border-brand";

// Janela de pagamento: coleta os dados que o Asaas pede e manda o cliente para a página de pagamento.
export function Checkout({
  aberto,
  fechar,
  titulo,
  valor,
  dados,
  nomeInicial = "",
  mensagemWhatsApp,
  aviso,
}: {
  aberto: boolean;
  fechar: () => void;
  titulo: string;
  valor: string;
  dados: Record<string, unknown>;
  nomeInicial?: string;
  mensagemWhatsApp: string;
  // Condição que o cliente precisa aceitar antes de pagar (ex.: regra de atraso do parcelamento).
  aviso?: string;
}) {
  const [nome, setNome] = useState(nomeInicial);
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aceite, setAceite] = useState(false);
  const docOk = documentoValido(documento);

  // Esc fecha a janela
  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto, fechar]);

  const pagar = async () => {
    setErro("");
    setEnviando(true);
    evento("orcamento", { valor });
    const r = await fetch("/api/pagamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...dados, nome, documento, email, celular, aceite }),
    }).catch(() => null);
    const json = r ? await r.json().catch(() => null) : null;
    if (json?.ok && json.url) {
      location.href = json.url;
      return;
    }
    setEnviando(false);
    setErro(json?.erro ?? "Não consegui abrir o pagamento.");
  };

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-end bg-forest/60 p-0 backdrop-blur-sm sm:place-items-center sm:p-5"
          onClick={fechar}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[28px] bg-bg p-6 shadow-2xl sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-ink-soft">{titulo}</div>
                <div className="font-display text-3xl">{valor}</div>
              </div>
              <button type="button" onClick={fechar} aria-label="Fechar a janela de pagamento" className="grid size-11 shrink-0 place-items-center rounded-full border border-line">
                <X className="size-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                pagar();
              }}
              className="mt-5 grid gap-3"
            >
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo ou razão social" aria-label="Nome" autoComplete="name" className={campo} />
              <input
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="CPF ou CNPJ"
                aria-label="CPF ou CNPJ"
                inputMode="numeric"
                className={`${campo} ${documento && !docOk ? "border-red-300" : ""}`}
              />
              <input value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="Celular com DDD" aria-label="Celular" inputMode="tel" autoComplete="tel" className={campo} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail (opcional, para o recibo)" aria-label="E-mail" inputMode="email" autoComplete="email" className={campo} />
              {aviso && (
                <label className="flex cursor-pointer gap-3 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
                  <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-1 size-4 shrink-0 accent-brand" />
                  <span>{aviso}</span>
                </label>
              )}
              <button
                type="submit"
                disabled={enviando || nome.trim().length < 3 || !docOk || (Boolean(aviso) && !aceite)}
                className="mt-1 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-brand text-lg font-semibold text-white disabled:opacity-40"
              >
                {enviando ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />}
                {enviando ? "Abrindo pagamento…" : "Ir para o pagamento"}
              </button>
              <p className="text-center text-xs text-ink-soft">Pagamento seguro pelo Asaas: Pix, cartão ou boleto.</p>
              {erro && (
                <div className="grid gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                  {erro}
                  <a href={linkWhatsApp(mensagemWhatsApp)} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-semibold text-brand">
                    <WhatsAppIcon className="size-4" /> Falar no WhatsApp
                  </a>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
