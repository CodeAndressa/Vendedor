import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Assistente } from "./assistente";
import { Efeitos } from "./efeitos";
import { ChamadaFinal, ContatoFixo, Rodape } from "./final";
import { Header } from "./header";
import { JsonLd, dadosFaq, dadosNegocio, dadosPessoa } from "./json-ld";
import { Eyebrow, Titulo } from "./ui";

export type Pergunta = { pergunta: string; resposta: string };

// Página de conteúdo para buscas e IAs: topo escuro, blocos de texto, perguntas frequentes e chamada final.
// Cada pergunta vira dado estruturado (FAQPage), que é o formato que as IAs mais aproveitam.
export function PaginaConteudo({
  selo,
  titulo,
  destaque,
  resumo,
  acoes,
  pontos,
  children,
  perguntas,
}: {
  selo: string;
  titulo: string;
  destaque: string;
  resumo: string;
  acoes: ReactNode;
  pontos: string[];
  children: ReactNode;
  perguntas: Pergunta[];
}) {
  return (
    <>
      <JsonLd dados={dadosNegocio()} />
      <JsonLd dados={dadosPessoa()} />
      <JsonLd dados={dadosFaq(perguntas)} />
      <Efeitos />
      <Header escuro />
      <main>
        <section className="relative -mt-[72px] overflow-hidden bg-forest pt-[72px] text-white">
          <div aria-hidden className="pointer-events-none absolute -top-40 left-[-10%] size-[720px] rounded-full bg-[radial-gradient(circle,rgba(23,120,74,0.35)_0%,transparent_65%)]" />
          <div className="relative mx-auto max-w-[1440px] px-5 pt-16 pb-20 md:px-10 md:pt-24 md:pb-28 xl:px-16">
            <span className="inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.22em] text-lime uppercase">
              <span className="h-px w-8 bg-lime/60" /> {selo}
            </span>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.03] tracking-[-0.035em] text-balance">
              {titulo} <span className="text-lime">{destaque}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">{resumo}</p>
            <div className="mt-9 flex flex-wrap gap-3">{acoes}</div>
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/70">
              {pontos.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check className="size-4 text-lime" strokeWidth={2.5} /> {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-5 py-20 text-[17px] leading-relaxed text-ink-soft md:py-28 [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-[clamp(1.6rem,3vw,2.2rem)] [&_h2]:leading-tight [&_h2]:tracking-[-0.03em] [&_h2]:text-ink [&_h2:first-child]:mt-0 [&_li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-6 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </article>

        <section className="border-t border-line bg-bg-alt py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5">
            <Eyebrow>Perguntas frequentes</Eyebrow>
            <Titulo>Respostas diretas</Titulo>
            <div className="mt-10 grid gap-3">
              {perguntas.map((p) => (
                <details key={p.pergunta} className="group rounded-2xl border border-line bg-card p-6 open:shadow-[0_20px_40px_-30px_rgba(8,30,20,0.4)]">
                  <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
                    {p.pergunta}
                  </summary>
                  <p className="mt-3 text-ink-soft">{p.resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <ChamadaFinal />
      </main>
      <Rodape />
      <ContatoFixo />
      <Assistente />
    </>
  );
}

