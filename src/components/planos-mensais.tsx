"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { planosMensais } from "@/lib/catalogo";
import { reais } from "@/lib/config";
import { Checkout } from "./checkout";
import { Reveal } from "./reveal";
import { Eyebrow, Titulo } from "./ui";

export function PlanosMensais() {
  const [escolhido, setEscolhido] = useState<(typeof planosMensais)[number] | null>(null);

  return (
    <section id="mensal" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Depois que o site está no ar</Eyebrow>
          <Titulo>Planos mensais para o site trabalhar por você</Titulo>
          <p className="mt-5 text-lg text-ink-soft">
            O site é seu e funciona sem mensalidade. Se quiser que eu cuide dele e traga mais clientes todo mês, escolha um
            plano.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {planosMensais.map((p, i) => {
            const destaque = "destaque" in p && p.destaque;
            return (
              <Reveal key={p.id} delay={i * 0.08}>
                <div className={`relative flex h-full flex-col rounded-[28px] p-7 ${destaque ? "bg-forest text-white lg:-my-3 lg:py-10" : "border border-line bg-card"}`}>
                  {destaque && <span className="absolute top-6 right-6 rounded-full bg-lime px-3 py-1 text-xs font-bold text-forest">Recomendado</span>}
                  <h3 className="font-display text-2xl">{p.nome}</h3>
                  <p className={`mt-1 text-sm ${destaque ? "text-white/65" : "text-ink-soft"}`}>{p.resumo}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-5xl tracking-tight">{reais(p.valor)}</span>
                    <span className={destaque ? "text-white/60" : "text-ink-soft"}>/mês</span>
                  </div>
                  {"nota" in p && <p className={`mt-1 text-sm ${destaque ? "text-white/60" : "text-ink-soft"}`}>{p.nota}</p>}
                  <ul className="mt-7 grid flex-1 content-start gap-3 text-[15px]">
                    {p.itens.map((t) => (
                      <li key={t} className="flex gap-2.5">
                        <Check className={`mt-0.5 size-4 shrink-0 ${destaque ? "text-lime" : "text-brand"}`} strokeWidth={3} /> {t}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setEscolhido(p)}
                    className={`mt-8 min-h-12 rounded-full font-semibold transition hover:-translate-y-0.5 ${destaque ? "bg-lime text-forest hover:bg-white" : "border-[1.5px] border-line hover:border-ink"}`}
                  >
                    Assinar {p.nome}
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Checkout
        aberto={escolhido !== null}
        fechar={() => setEscolhido(null)}
        titulo={escolhido ? `Plano ${escolhido.nome} · mensal` : ""}
        valor={escolhido ? `${reais(escolhido.valor)}/mês` : ""}
        dados={{ tipo: "assinatura", plano: escolhido?.id }}
        mensagemWhatsApp={`Oi! Quero assinar o plano ${escolhido?.nome ?? ""}.`}
      />
    </section>
  );
}
