"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Modelo } from "@/lib/modelos";

type Secoes = NonNullable<Modelo["negocio"]["cardapio"]>;

// Cardápio com abas para os modelos de restaurante. Usa as cores do modelo (variáveis --m-*).
export function Cardapio({ secoes }: { secoes: Secoes }) {
  const [aba, setAba] = useState(0);
  const atual = secoes[aba];

  return (
    <section id="cardapio" className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="text-sm font-bold tracking-[0.2em] text-[var(--m-destaque)] uppercase">Cardápio</span>
          <h2 style={{ fontFamily: "var(--m-fonte)" }} className="mt-2 text-5xl font-extrabold tracking-tight uppercase">
            Escolha o seu
          </h2>
        </div>
        <div role="tablist" className="flex flex-wrap gap-2 rounded-full bg-[var(--m-cartao)] p-1.5">
          {secoes.map((s, i) => (
            <button
              key={s.categoria}
              role="tab"
              type="button"
              aria-selected={aba === i}
              onClick={() => setAba(i)}
              className="relative rounded-full px-5 py-2.5 text-sm font-bold"
            >
              {aba === i && (
                <motion.span
                  layoutId="aba-cardapio"
                  className="absolute inset-0 rounded-full bg-[var(--m-destaque)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className={`relative ${aba === i ? "text-[var(--m-texto-destaque)]" : ""}`}>{s.categoria}</span>
            </button>
          ))}
        </div>
      </div>
      {atual.nota && <p className="mt-6 text-lg opacity-70">{atual.nota}</p>}

      <AnimatePresence mode="wait">
        <motion.div
          key={aba}
          role="tabpanel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="mt-10 grid gap-4 @3xl:grid-cols-2"
        >
          {atual.itens.map((item) => (
            <article
              key={item.nome}
              className="group flex gap-5 rounded-3xl border-2 border-[color-mix(in_srgb,var(--m-texto)_10%,transparent)] bg-[var(--m-cartao)] p-5 transition hover:-translate-y-1 hover:border-[var(--m-destaque)]"
            >
              <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-[var(--m-suave)] text-4xl" aria-hidden>
                {item.nome.toLowerCase().includes("frita") || item.nome.toLowerCase().includes("onion")
                  ? "🍟"
                  : item.nome.toLowerCase().includes("limonada")
                    ? "🍋"
                    : "🍔"}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 style={{ fontFamily: "var(--m-fonte)" }} className="text-xl font-extrabold">
                    {item.nome}
                  </h3>
                  {item.selo && (
                    <span className="rounded-full bg-[var(--m-destaque)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--m-texto-destaque)] uppercase">
                      {item.selo}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[15px] opacity-70">{item.descricao}</p>
                <div style={{ fontFamily: "var(--m-fonte)" }} className="mt-3 text-xl font-extrabold text-[var(--m-destaque)]">
                  {item.preco}
                </div>
              </div>
            </article>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
