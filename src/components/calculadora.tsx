"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Bot, Check, LayoutTemplate, Newspaper, PanelsTopLeft, PenTool, ShoppingBag } from "lucide-react";
import * as catalogo from "@/lib/catalogo";
import { assinaturaSite, linkWhatsApp, precos, reais } from "@/lib/config";
import { modelos } from "@/lib/modelos";
import { useIlha } from "./ilha";
import { Reveal } from "./reveal";
import { Eyebrow, Titulo, WhatsAppIcon } from "./ui";

const bases = [
  { id: "site", icone: PanelsTopLeft, ...catalogo.bases.site },
  { id: "landing", icone: LayoutTemplate, ...catalogo.bases.landing },
] as const;

const extras = [
  { id: "blog", icone: Newspaper, ...catalogo.extras.blog },
  { id: "maior", icone: ShoppingBag, ...catalogo.extras.maior },
  { id: "ia", icone: Bot, ...catalogo.extras.ia, titulo: "Assistente com IA: atende 24h e manda para o WhatsApp" },
  { id: "logo", icone: PenTool, ...catalogo.extras.logo, titulo: "Logo personalizada feita por mim" },
] as const;

type Base = catalogo.Base;
type Extra = catalogo.Extra;

// Planos são atalhos que preenchem a calculadora.
const planos: { id: string; nome: string; resumo: string; extras: Extra[]; aPartirDe?: boolean; destaque?: boolean; itens: string[] }[] = [
  {
    id: "essencial",
    nome: "Essencial",
    resumo: "Para colocar o negócio no Google.",
    extras: [],
    itens: ["Site de até 5 páginas ou landing page", "Textos escritos para você", "Domínio e hospedagem do 1º ano", "Botão de WhatsApp"],
  },
  {
    id: "conteudo",
    nome: "Conteúdo",
    resumo: "Para atrair cliente com artigos.",
    extras: ["blog"],
    destaque: true,
    itens: ["Tudo do Essencial", "Blog pronto para publicar", "Categorias e busca", "Mais chances de aparecer no Google"],
  },
  {
    id: "completo",
    nome: "Sob medida",
    resumo: "Loja, login, sistema ou integrações.",
    extras: ["maior"],
    aPartirDe: true,
    itens: ["Tudo do Essencial", "Loja virtual ou área com login", "Sistema ou integração com IA", "Mais de 10 páginas"],
  },
];

function ValorAnimado({ valor }: { valor: number }) {
  const reduzir = useReducedMotion();
  const mv = useMotionValue(valor);
  const texto = useTransform(mv, (v) => reais(Math.round(v * 100) / 100));
  useEffect(() => {
    if (reduzir) {
      mv.set(valor);
      return;
    }
    const c = animate(mv, valor, { duration: 0.5, ease: "easeOut" });
    return () => c.stop();
  }, [valor, mv, reduzir]);
  return <motion.span>{texto}</motion.span>;
}

const somar = (lista: Extra[]) => precos.site + extras.filter((e) => lista.includes(e.id)).reduce((s, e) => s + e.valor, 0);

export function Calculadora() {
  const [base, setBase] = useState<Base>("site");
  const [escolhidos, setEscolhidos] = useState<Extra[]>([]);
  const [modelo, setModelo] = useState("");
  const [nome, setNome] = useState("");
  const [negocio, setNegocio] = useState("");
  const { avisar } = useIlha();

  const total = somar(escolhidos);
  const [entrada, saldo] = catalogo.metades(total);
  const alternar = (e: (typeof extras)[number]) => {
    const tinha = escolhidos.includes(e.id);
    setEscolhidos((atual) => (tinha ? atual.filter((x) => x !== e.id) : [...atual, e.id]));
    avisar(tinha ? "Item removido" : "Item adicionado", `${tinha ? "−" : "+"} ${reais(e.valor)} · ${e.titulo.split(",")[0]}`);
  };
  const planoAtivo = planos.find((p) => p.extras.length === escolhidos.length && p.extras.every((x) => escolhidos.includes(x)));
  const escolherPlano = (p: (typeof planos)[number]) => {
    setEscolhidos(p.extras);
    avisar(`Plano ${p.nome} selecionado`, `${p.aPartirDe ? "a partir de " : ""}${reais(somar(p.extras))}`);
    document.getElementById("calculadora")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const baseEscolhida = bases.find((b) => b.id === base)!;
  const modeloEscolhido = modelos.find((m) => m.slug === modelo);
  const mensagem = [
    `Oi! Montei meu orçamento no seu site${nome ? `. Meu nome é ${nome.trim()}` : ""}.`,
    negocio ? `Meu negócio: ${negocio.trim()}` : null,
    modeloEscolhido ? `Modelo escolhido: ${modeloEscolhido.nome} (${modeloEscolhido.segmento})` : null,
    "",
    `• ${baseEscolhida.titulo} (${reais(precos.site)})`,
    ...extras.filter((e) => escolhidos.includes(e.id)).map((e) => `• ${e.titulo} (+ ${reais(e.valor)})`),
    "",
    `Total: ${reais(total)}`,
    "Podemos começar?",
  ]
    .filter((l) => l !== null)
    .join("\n");

  return (
    <section id="orcamento" className="bg-bg-alt py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Preço fechado, sem surpresa</Eyebrow>
          <Titulo>Escolha um plano ou monte o seu</Titulo>
          <p className="mt-5 text-lg text-ink-soft">
            Metade no início e metade na entrega, sem mensalidade. Ou, se preferir, em {assinaturaSite.parcelas}x sem entrada.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {planos.map((p, i) => {
            const ativo = planoAtivo?.id === p.id;
            return (
              <Reveal key={p.id} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-[28px] p-7 transition ${
                    p.destaque ? "bg-forest text-white shadow-[0_30px_60px_-30px_rgba(10,42,28,0.7)] lg:-my-3 lg:py-10" : "border border-line bg-card"
                  } ${ativo ? "ring-[3px] ring-brand ring-offset-4 ring-offset-bg-alt" : ""}`}
                >
                  {p.destaque && (
                    <>
                      <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-[radial-gradient(circle,var(--color-lime)_0%,transparent_70%)] opacity-30" />
                      <span className="absolute top-6 right-6 rounded-full bg-lime px-3 py-1 text-xs font-bold text-forest">Recomendado</span>
                    </>
                  )}
                  <div className="relative">
                    <h3 className="font-display text-2xl">{p.nome}</h3>
                    <p className={`mt-1 text-sm ${p.destaque ? "text-white/65" : "text-ink-soft"}`}>{p.resumo}</p>
                    <div className="mt-6 flex items-baseline gap-2">
                      {p.aPartirDe && <span className={`text-sm ${p.destaque ? "text-white/60" : "text-ink-soft"}`}>a partir de</span>}
                      <span className="font-display text-5xl tracking-tight">{reais(somar(p.extras))}</span>
                    </div>
                    <p className={`mt-1 text-sm ${p.destaque ? "text-white/60" : "text-ink-soft"}`}>
                      metade no início, metade na entrega · ou {assinaturaSite.parcelas}x de {reais(catalogo.parcelaAssinatura(somar(p.extras)))}
                    </p>
                    <ul className="mt-7 grid gap-3 text-[15px]">
                      {p.itens.map((t) => (
                        <li key={t} className="flex gap-2.5">
                          <Check className={`mt-0.5 size-4 shrink-0 ${p.destaque ? "text-lime" : "text-brand"}`} strokeWidth={3} /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => escolherPlano(p)}
                    className={`relative mt-8 min-h-12 rounded-full font-semibold transition hover:-translate-y-0.5 ${
                      p.destaque ? "bg-lime text-forest hover:bg-white" : "border-[1.5px] border-line hover:border-ink"
                    }`}
                  >
                    {ativo ? "Selecionado ✓" : `Escolher ${p.nome}`}
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-20">
          <h3 id="calculadora" className="mb-6 scroll-mt-28 text-center font-display text-2xl">
            Ou monte do seu jeito
          </h3>
          <div className="grid overflow-hidden rounded-[32px] border border-line bg-card shadow-[0_30px_60px_-40px_rgba(10,42,28,0.45)] lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-6 md:p-10">
              <fieldset>
                <legend className="mb-4 text-sm font-semibold tracking-wide text-ink-soft uppercase">
                  1. O que você precisa?
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {bases.map((b) => {
                    const ativo = base === b.id;
                    return (
                      <label
                        key={b.id}
                        className={`relative cursor-pointer rounded-2xl border-2 p-5 transition ${
                          ativo ? "border-brand bg-brand-soft/60" : "border-line hover:border-ink/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="base"
                          value={b.id}
                          checked={ativo}
                          onChange={() => setBase(b.id)}
                          className="sr-only"
                        />
                        <b.icone className={`mb-3 size-7 ${ativo ? "text-brand" : "text-ink-soft"}`} strokeWidth={1.75} />
                        <div className="font-semibold">{b.titulo}</div>
                        <div className="mt-1 text-sm text-ink-soft">{b.texto}</div>
                        <div className="mt-3 font-display text-lg">{reais(precos.site)}</div>
                        {ativo && (
                          <span className="absolute top-4 right-4 grid size-6 place-items-center rounded-full bg-brand text-white">
                            <Check className="size-4" strokeWidth={3} />
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-9">
                <legend className="mb-4 text-sm font-semibold tracking-wide text-ink-soft uppercase">
                  2. Quer algo a mais? (opcional)
                </legend>
                <div className="grid gap-3">
                  {extras.map((e) => {
                    const ativo = escolhidos.includes(e.id);
                    return (
                      <label
                        key={e.id}
                        className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${
                          ativo ? "border-brand bg-brand-soft/60" : "border-line hover:border-ink/30"
                        }`}
                      >
                        <input type="checkbox" checked={ativo} onChange={() => alternar(e)} className="sr-only" />
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-md border-2 transition ${
                            ativo ? "border-brand bg-brand text-white" : "border-line"
                          }`}
                        >
                          {ativo && <Check className="size-4" strokeWidth={3} />}
                        </span>
                        <e.icone className="size-5 shrink-0 text-ink-soft" strokeWidth={1.75} />
                        <span className="flex-1 font-medium">
                          {e.titulo}
                        </span>
                        <span className="font-display whitespace-nowrap">+ {reais(e.valor)}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-9">
                <legend className="mb-4 text-sm font-semibold tracking-wide text-ink-soft uppercase">
                  3. Sobre você (opcional)
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    aria-label="Modelo de partida"
                    className="min-h-12 rounded-xl border-2 border-line bg-bg px-4 outline-none transition focus:border-brand sm:col-span-2"
                  >
                    <option value="">Modelo de partida: quero algo do zero</option>
                    {modelos.map((m) => (
                      <option key={m.slug} value={m.slug}>
                        Modelo {m.nome} · {m.segmento}
                      </option>
                    ))}
                  </select>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    aria-label="Seu nome"
                    className="min-h-12 rounded-xl border-2 border-line bg-bg px-4 outline-none transition focus:border-brand"
                  />
                  <input
                    value={negocio}
                    onChange={(e) => setNegocio(e.target.value)}
                    placeholder="Seu negócio (ex.: clínica, loja)"
                    aria-label="Seu negócio"
                    className="min-h-12 rounded-xl border-2 border-line bg-bg px-4 outline-none transition focus:border-brand"
                  />
                </div>
              </fieldset>
            </div>

            <div className="relative flex flex-col justify-between overflow-hidden bg-forest p-6 text-white md:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,var(--color-lime)_0%,transparent_70%)] opacity-30"
              />
              <div className="relative">
                <div className="text-sm text-white/60">Seu investimento</div>
                <div className="mt-1 font-display text-5xl tracking-tight md:text-6xl" aria-live="polite">
                  <ValorAnimado valor={total} />
                </div>
                <div className="mt-6 grid gap-3 rounded-2xl bg-white/5 p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-white/70">Para começar</span>
                    <span className="font-semibold">
                      <ValorAnimado valor={entrada} />
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-white/70">Quando estiver no ar</span>
                    <span className="font-semibold">
                      <ValorAnimado valor={saldo} />
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                    <span className="text-white/70">Ou sem entrada</span>
                    <span className="font-semibold">
                      {assinaturaSite.parcelas}x de <ValorAnimado valor={catalogo.parcelaAssinatura(total)} />
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-white/55">{catalogo.avisoAssinatura}</p>
                <ul className="mt-6 grid gap-2.5 text-sm text-white/80">
                  {["Pix, cartão ou boleto", "Domínio e hospedagem do 1º ano inclusos", "Primeira versão em 48h"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="size-4 text-lime" strokeWidth={3} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={linkWhatsApp(mensagem)}
                target="_blank"
                rel="noopener"
                className="relative mt-8 inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-lime px-6 text-base font-semibold text-forest transition hover:-translate-y-0.5 hover:bg-white"
              >
                <WhatsAppIcon /> Enviar orçamento no WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
