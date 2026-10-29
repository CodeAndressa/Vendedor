"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { faq } from "@/lib/content";
import { Reveal } from "./reveal";
import { Eyebrow, Titulo } from "./ui";

export function Duvidas() {
  const [aberta, setAberta] = useState<number | null>(0);
  return (
    <section id="duvidas" className="bg-bg-alt py-24 md:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-10 xl:px-16 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <Eyebrow>Dúvidas frequentes</Eyebrow>
          <Titulo>Perguntas que sempre me fazem</Titulo>
          <p className="mt-5 text-lg text-ink-soft">Não achou a sua? Me chama no WhatsApp que eu respondo rapidinho.</p>
        </Reveal>
        <div className="grid gap-3">
          {faq.map((item, i) => {
            const aberto = aberta === i;
            return (
              <Reveal key={item.pergunta} delay={Math.min(i, 4) * 0.04}>
                <div className={`rounded-2xl border bg-card transition ${aberto ? "border-brand/40" : "border-line"}`}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setAberta(aberto ? null : i)}
                      aria-expanded={aberto}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold"
                    >
                      {item.pergunta}
                      <Plus
                        className={`size-5 shrink-0 text-brand transition-transform duration-300 ${aberto ? "rotate-45" : ""}`}
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {aberto && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-ink-soft">{item.resposta}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
