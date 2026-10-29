"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { config, linkWhatsApp } from "@/lib/config";
import { evento } from "@/lib/rastreio";
import { LogoSimbolo } from "./logo";
import { WhatsAppIcon } from "./ui";

type Item = { titulo: string; ok: boolean; detalhe: string; peso: number };
type Resultado = { nota: number; pergunta: string; indicados: string[]; apareceu: boolean; itens: Item[] };

const campo =
  "min-h-12 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 text-white placeholder:text-white/35 outline-none transition focus:border-lime/70 focus:bg-white/[0.07]";
const etapas = ["Perguntando para a IA como um cliente", "Lendo o seu site", "Conferindo os robôs das buscas", "Calculando a sua nota"];
const segmentos = ["Hamburgueria", "Restaurante", "Pizzaria", "Clínica odontológica", "Clínica de estética", "Salão de beleza", "Barbearia", "Escritório de advocacia", "Contabilidade", "Academia", "Personal trainer", "Pet shop", "Imobiliária", "Oficina mecânica", "Loja de roupas"];

function utm() {
  try {
    return JSON.parse(sessionStorage.getItem("utm") ?? "{}");
  } catch {
    return {};
  }
}

export function AnaliseIA() {
  const [dados, setDados] = useState({ negocio: "", segmento: "", cidade: "", site: "", nome: "", whatsapp: "", empresa: "" });
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const muda = (k: keyof typeof dados) => (e: React.ChangeEvent<HTMLInputElement>) => setDados((d) => ({ ...d, [k]: e.target.value }));

  useEffect(() => {
    if (!enviando) return;
    const t = setInterval(() => setEtapa((e) => Math.min(e + 1, etapas.length - 1)), 1400);
    return () => clearInterval(t);
  }, [enviando]);

  const analisar = async () => {
    setErro("");
    setEtapa(0);
    setEnviando(true);
    const inicio = Date.now();
    const r = await fetch("/api/analise-ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...dados, consentimento, utm: utm() }),
    }).catch(() => null);
    const json = r ? await r.json().catch(() => null) : null;
    // deixa a animação respirar um pouco: a análise é rápida demais para parecer séria
    await new Promise((ok) => setTimeout(ok, Math.max(0, 4200 - (Date.now() - inicio))));
    setEnviando(false);
    if (!json?.ok) return setErro(json?.erro ?? "Não consegui fazer a análise agora. Tente de novo.");
    evento("lead", { origem: "analise-ia" });
    setResultado(json.resultado);
    requestAnimationFrame(() => document.getElementById("resultado-ia")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const pode =
    dados.negocio.trim().length > 1 && dados.segmento.trim().length > 2 && dados.cidade.trim().length > 2 &&
    dados.nome.trim().length > 1 && dados.whatsapp.replace(/\D/g, "").length >= 10 && consentimento;

  if (resultado) return <Relatorio resultado={resultado} negocio={dados.negocio} cidade={dados.cidade} refazer={() => setResultado(null)} />;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (pode && !enviando) analisar();
      }}
      className="relative rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur md:p-8"
    >
      <AnimatePresence mode="wait">
        {enviando ? (
          <motion.div key="carregando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid min-h-[420px] content-center gap-5 py-6">
            <LogoSimbolo className="size-14" />
            <div className="font-display text-2xl tracking-[-0.03em] text-white">Analisando {dados.negocio}…</div>
            <ul className="grid gap-3">
              {etapas.map((t, i) => (
                <li key={t} className={`flex items-center gap-3 text-[15px] transition ${i <= etapa ? "text-white" : "text-white/30"}`}>
                  {i < etapa ? <Check className="size-4 text-lime" /> : i === etapa ? <Loader2 className="size-4 animate-spin text-lime" /> : <span className="size-4" />}
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-3">
            <div className="text-[11px] font-medium tracking-[0.22em] text-lime uppercase">Sobre o negócio</div>
            <input value={dados.negocio} onChange={muda("negocio")} placeholder="Nome do negócio" aria-label="Nome do negócio" className={campo} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={dados.segmento} onChange={muda("segmento")} list="segmentos" placeholder="O que ele faz (ex.: hamburgueria)" aria-label="Segmento" className={campo} />
              <input value={dados.cidade} onChange={muda("cidade")} placeholder="Cidade" aria-label="Cidade" className={campo} />
            </div>
            <datalist id="segmentos">
              {segmentos.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <input value={dados.site} onChange={muda("site")} placeholder="Site ou Instagram (opcional)" aria-label="Site" inputMode="url" className={campo} />
            <div className="mt-3 text-[11px] font-medium tracking-[0.22em] text-lime uppercase">Para onde mando o resultado</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={dados.nome} onChange={muda("nome")} placeholder="Seu nome" aria-label="Seu nome" autoComplete="name" className={campo} />
              <input value={dados.whatsapp} onChange={muda("whatsapp")} placeholder="WhatsApp com DDD" aria-label="WhatsApp" inputMode="tel" autoComplete="tel" className={campo} />
            </div>
            <input value={dados.empresa} onChange={muda("empresa")} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            <label className="mt-1 flex cursor-pointer gap-3 text-sm text-white/60">
              <input type="checkbox" checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#D9C28E]" />
              Autorizo a {config.nome.split(" ")[0]} a falar comigo pelo WhatsApp sobre a análise. Veja a{" "}
              <Link href="/privacidade" className="underline">política de privacidade</Link>.
            </label>
            <button
              type="submit"
              disabled={!pode}
              className="mt-3 inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-lime text-base font-semibold text-forest shadow-[0_0_0_1px_rgba(217,194,142,0.4),0_10px_40px_-8px_rgba(217,194,142,0.55)] transition hover:bg-[#E6D3A6] disabled:opacity-40 disabled:shadow-none"
            >
              <Sparkles className="size-5" /> Analisar meu negócio grátis
            </button>
            {erro && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{erro}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

function corDaNota(nota: number) {
  if (nota >= 75) return { cor: "#3FC47E", texto: "Bem encaminhado" };
  if (nota >= 50) return { cor: "#D9C28E", texto: "Dá para melhorar muito" };
  return { cor: "#F07D6B", texto: "Quase invisível para a IA" };
}

function Relatorio({ resultado, negocio, cidade, refazer }: { resultado: Resultado; negocio: string; cidade: string; refazer: () => void }) {
  const { cor, texto } = corDaNota(resultado.nota);
  const faltam = resultado.itens.filter((i) => !i.ok);
  const raio = 52;
  const volta = 2 * Math.PI * raio;
  const mensagem = `Oi! Fiz a análise de IA do ${negocio} (${cidade}) no seu site e tirei ${resultado.nota}/100. Quero corrigir: ${faltam.map((f) => f.titulo).join(", ") || "manter tudo em dia"}.`;

  return (
    <div id="resultado-ia" className="grid gap-5">
      <div className="flex flex-wrap items-center gap-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <svg viewBox="0 0 120 120" className="size-32 shrink-0 -rotate-90">
          <circle cx="60" cy="60" r={raio} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={raio} fill="none" stroke={cor} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={volta}
            initial={{ strokeDashoffset: volta }}
            animate={{ strokeDashoffset: volta * (1 - resultado.nota / 100) }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <text x="60" y="68" textAnchor="middle" transform="rotate(90 60 60)" fill="#fff" fontSize="30" fontWeight="800" fontFamily="var(--font-inter)">
            {resultado.nota}
          </text>
        </svg>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium tracking-[0.22em] uppercase" style={{ color: cor }}>{texto}</div>
          <h2 className="mt-2 font-display text-3xl tracking-[-0.03em] text-white">{negocio}: {resultado.nota} de 100</h2>
          <p className="mt-2 text-white/60">
            {faltam.length ? `${faltam.length} ${faltam.length === 1 ? "ponto impede" : "pontos impedem"} a IA de recomendar você com confiança.` : "Tudo certo por aqui. Agora é manter."}
          </p>
        </div>
      </div>

      {/* o teste na IA, como conversa */}
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="text-[11px] font-medium tracking-[0.22em] text-lime uppercase">O teste</div>
        <div className="mt-4 grid gap-3">
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-white/10 px-4 py-3 text-white">“{resultado.pergunta}”</div>
          <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-white/10 bg-forest-2 px-4 py-3 text-white/85">
            {resultado.indicados.length ? (
              <>
                A IA indicou:
                <ol className="mt-2 list-decimal space-y-0.5 pl-5">
                  {resultado.indicados.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ol>
              </>
            ) : (
              "A IA não soube indicar nenhum lugar com segurança. Ou seja: hoje ninguém do seu segmento está claro para ela na sua cidade. É espaço livre para quem chegar primeiro."
            )}
          </div>
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${resultado.apareceu ? "bg-emerald-400/15 text-emerald-300" : "bg-[#F07D6B]/15 text-[#F5A193]"}`}
          >
            {resultado.apareceu ? <Check className="size-4" /> : <X className="size-4" />}
            {resultado.apareceu ? "Você foi citado" : "Você não apareceu"}
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-white/40">
          Resposta de um modelo de IA com o que ele já aprendeu, sem pesquisar na internet na hora. Os nomes sugeridos podem
          conter erros. Assistentes com busca ao vivo (ChatGPT, Gemini, Google) também dependem dos pontos abaixo.
        </p>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="text-[11px] font-medium tracking-[0.22em] text-lime uppercase">O que eu conferi</div>
        <ul className="mt-4 divide-y divide-white/8">
          {[...resultado.itens].sort((a, b) => Number(a.ok) - Number(b.ok) || b.peso - a.peso).map((i) => (
            <li key={i.titulo} className="flex gap-3.5 py-4">
              <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${i.ok ? "bg-emerald-400/15 text-emerald-300" : "bg-[#F07D6B]/15 text-[#F5A193]"}`}>
                {i.ok ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
              </span>
              <div>
                <div className="font-semibold text-white">{i.titulo}</div>
                <p className="mt-0.5 text-[15px] leading-snug text-white/60">{i.detalhe}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative overflow-hidden rounded-[28px] bg-lime p-6 text-forest md:p-8">
        <h3 className="font-display text-3xl tracking-[-0.03em]">Quer que a IA passe a recomendar você?</h3>
        <p className="mt-2 max-w-xl text-forest/75">
          Eu corrijo tudo isso no seu site novo, em até 7 dias, a partir de R$ 997. Me chama que eu te explico o que fazer
          primeiro.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={linkWhatsApp(mensagem)}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-forest px-6 font-semibold text-white transition hover:-translate-y-0.5"
          >
            <WhatsAppIcon /> Quero corrigir isso
          </a>
          <Link href="/#orcamento" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-forest/25 px-6 font-semibold transition hover:border-forest">
            Ver preços <ArrowRight className="size-4" />
          </Link>
          <button type="button" onClick={refazer} className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-forest/70 hover:text-forest">
            <RotateCcw className="size-4" /> Analisar outro negócio
          </button>
        </div>
      </div>
    </div>
  );
}
