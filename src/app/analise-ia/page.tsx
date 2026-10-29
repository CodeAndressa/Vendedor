import type { Metadata } from "next";
import { AnaliseIA } from "@/components/analise-ia";
import { Assistente } from "@/components/assistente";
import { Rodape } from "@/components/final";
import { Efeitos } from "@/components/efeitos";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Análise grátis: como a IA enxerga o seu negócio",
  description:
    "Análise grátis em 30 segundos: um modelo de IA simula a pergunta que o seu cliente faria, eu confiro o seu site como os robôs de busca leem e você recebe uma nota de 0 a 100 com o que corrigir.",
  alternates: { canonical: "/analise-ia" },
};

export default function PaginaAnaliseIA() {
  return (
    <>
      <Efeitos />
      <Header escuro />
      <main className="relative -mt-[72px] min-h-svh overflow-hidden bg-forest pt-[72px] text-white">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-[-10%] size-[720px] rounded-full bg-[radial-gradient(circle,rgba(23,120,74,0.35)_0%,transparent_65%)]" />
        <div aria-hidden className="pointer-events-none absolute right-[-10%] bottom-0 size-[640px] rounded-full bg-[radial-gradient(circle,rgba(217,194,142,0.12)_0%,transparent_65%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-5 pt-14 pb-24 md:px-10 md:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 xl:px-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.22em] text-lime uppercase">
              <span className="h-px w-8 bg-lime/60" /> Análise grátis · 30 segundos
            </span>
            <h1 className="mt-6 font-display text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[1.03] tracking-[-0.035em] text-balance">
              Como a IA enxerga o seu negócio? <span className="text-lime">Descubra agora.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
              Seu cliente pergunta ao ChatGPT, ao Gemini ou ao Google com IA qual lugar escolher. Aqui, um modelo de IA
              simula essa pergunta, eu leio o seu site como os robôs de busca leem e te mostro uma nota de 0 a 100 com o que
              pode estar impedindo as IAs de recomendar você.
            </p>
            <ul className="mt-8 grid gap-3 text-[15px] text-white/75">
              {[
                "Simulação: um modelo de IA responde à pergunta que o seu cliente faria",
                "Checagem do site: dados estruturados, robôs, HTTPS, texto",
                "Lista do que corrigir, em português claro",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lime" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <AnaliseIA />
        </div>
      </main>
      <Rodape />
      <Assistente />
    </>
  );
}
