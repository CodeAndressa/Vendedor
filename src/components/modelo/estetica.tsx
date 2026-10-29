"use client";

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";
import { Fraunces } from "next/font/google";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Clock, MapPin, Minus, Plus, Star } from "lucide-react";
import type { Modelo } from "@/lib/modelos";
import { WhatsAppIcon } from "../ui";
import { icones } from "./icones";

// Layout "estetica": site de clínica de estética com cara de spa de alto padrão.
// Serifada fina, paleta nude/areia/sálvia, arcos no lugar de foto e animações discretas.

// Fraunces variável (o layout global só carrega os pesos 600 e 800, pesados demais para este visual).
const serifa = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  variable: "--font-estetica",
  display: "swap",
});

const SERIFA: CSSProperties = {
  fontFamily: "var(--font-estetica), var(--font-fraunces), Georgia, serif",
  fontWeight: 300,
  fontVariationSettings: '"opsz" 144, "SOFT" 40',
};

const ROSE = "#D9B6A5";
const SALVIA_CLARA = "#C3CBB8";
const LINHA = "color-mix(in srgb, var(--m-texto) 13%, transparent)";
const RUIDO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const SUAVE = [0.22, 1, 0.36, 1] as const;

// Nas miniaturas da galeria (apenasHero) e com "reduzir movimento" ligado, nada anima.
const Animar = createContext(true);

function useAnimar() {
  const reduzir = useReducedMotion();
  return useContext(Animar) && !reduzir;
}

function Surgir({ children, atraso = 0, className = "", y = 28 }: { children: ReactNode; atraso?: number; className?: string; y?: number }) {
  const animar = useAnimar();
  if (!animar) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, ease: SUAVE, delay: atraso }}
    >
      {children}
    </motion.div>
  );
}

function Rotulo({ children, claro = false }: { children: ReactNode; claro?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.28em] uppercase ${claro ? "opacity-70" : "text-[var(--m-destaque)]"}`}>
      <span className="h-px w-8 bg-current opacity-60" />
      {children}
    </span>
  );
}

function Titulo2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 style={SERIFA} className={`text-[clamp(2.2rem,4.6cqw,3.6rem)] leading-[1.05] tracking-[-0.02em] text-balance ${className}`}>
      {children}
    </h2>
  );
}

function BotaoWhats({ children, claro = false, className = "" }: { children: ReactNode; claro?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium tracking-[0.04em] shadow-[0_18px_40px_-22px_rgba(47,39,34,0.7)] ${
        claro ? "bg-[var(--m-fundo)] text-[var(--m-texto)]" : "bg-[var(--m-destaque)] text-[var(--m-texto-destaque)]"
      } ${className}`}
    >
      <WhatsAppIcon className="size-4" />
      {children}
    </span>
  );
}

// Na miniatura o modelo fica dentro de um <Link> da galeria: lá os links viram <span> (não pode <a> dentro de <a>).
function Ancora({ href, className, style, children }: { href: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  const completo = useContext(Animar);
  return completo ? (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  ) : (
    <span className={className} style={style}>
      {children}
    </span>
  );
}

function LinkSeta({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Ancora href={href} className="group inline-flex items-center gap-2 border-b pb-1 text-sm font-medium tracking-[0.04em]" style={{ borderColor: LINHA }}>
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Ancora>
  );
}

function Ruido({ opacidade = 0.1 }: { opacidade?: number }) {
  return <div className="pointer-events-none absolute inset-0 mix-blend-multiply" style={{ backgroundImage: RUIDO, opacity: opacidade }} />;
}

// Ramo de folhas desenhado em SVG (no lugar de foto)
function Ramo({ className = "" }: { className?: string }) {
  const folhas: [number, number, number, number][] = [
    [101, 262, -38, 1], [99, 228, 210, 0.9], [100, 196, -30, 0.95], [98, 166, 205, 0.85], [97, 136, -26, 0.85],
    [97, 108, 200, 0.75], [99, 80, -22, 0.75], [102, 54, 196, 0.62], [106, 30, -18, 0.55],
  ];
  return (
    <svg viewBox="0 0 200 300" className={className} aria-hidden>
      <path d="M100 300 C 98 240, 104 180, 97 110 S 96 40, 112 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {folhas.map(([x, y, r, s], i) => (
        <path
          key={i}
          d="M0 0 C 12 -15, 40 -15, 54 0 C 40 15, 12 15, 0 0 Z"
          transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
          fill="currentColor"
          fillOpacity={0.28}
          stroke="currentColor"
          strokeWidth="0.9"
        />
      ))}
    </svg>
  );
}

function Perola({ className = "" }: { className?: string }) {
  return (
    <span
      className={`absolute rounded-full ${className}`}
      style={{
        background: "radial-gradient(circle at 32% 28%, #FFFFFF 0%, #F6EEE7 35%, #DCC8BA 100%)",
        boxShadow: "0 14px 30px -12px rgba(80,50,30,0.45)",
      }}
    />
  );
}

function SeloGirando({ marca }: { marca: string }) {
  const animar = useAnimar();
  return (
    <div className="absolute -top-4 -right-2 grid size-28 place-items-center rounded-full bg-[var(--m-cartao)] shadow-[0_20px_40px_-24px_rgba(47,39,34,0.5)] @3xl:-right-6 @3xl:size-32">
      <motion.svg
        viewBox="0 0 120 120"
        className="absolute inset-1.5"
        animate={animar ? { rotate: 360 } : undefined}
        transition={{ duration: 36, ease: "linear", repeat: Infinity }}
      >
        <defs>
          <path id="selo-estetica" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text className="fill-[var(--m-texto)] text-[8.6px] tracking-[0.2em] uppercase">
          <textPath href="#selo-estetica">Avaliação personalizada ✦ Hora marcada ✦</textPath>
        </text>
      </motion.svg>
      <span style={SERIFA} className="text-2xl italic">
        {marca}
      </span>
    </div>
  );
}

function Composicao({ marca }: { marca: string }) {
  const animar = useAnimar();
  const arco = (
    <div
      className="absolute inset-x-[7%] top-0 bottom-0 overflow-hidden rounded-t-full"
      style={{ background: `radial-gradient(120% 80% at 30% 18%, #FBF4EC 0%, #EED9CB 42%, ${ROSE} 100%)` }}
    >
      <div className="absolute -top-[10%] left-[18%] size-[62%] rounded-full bg-white/60 blur-3xl" />
      <Ramo className="absolute right-[2%] bottom-[-4%] h-[86%] text-[var(--m-destaque)]" />
      <Ruido opacidade={0.12} />
    </div>
  );
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px]">
      <div className="absolute inset-x-[3%] -top-[3%] bottom-[3%] rounded-t-full border" style={{ borderColor: LINHA }} />
      {animar ? (
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 1.6, ease: SUAVE, delay: 0.15 }}
        >
          {arco}
        </motion.div>
      ) : (
        arco
      )}
      <div
        className="absolute bottom-[6%] left-0 aspect-[3/4] w-[32%] overflow-hidden rounded-t-full"
        style={{ background: `linear-gradient(170deg, ${SALVIA_CLARA} 0%, #8C9882 100%)` }}
      >
        <Ruido opacidade={0.14} />
      </div>
      <Perola className="bottom-[30%] left-[24%] size-7" />
      <Perola className="bottom-[25%] left-[31%] size-4" />
      <Perola className="top-[22%] right-[4%] size-5" />
      <SeloGirando marca={marca} />
      <div className="absolute right-[-2%] bottom-[9%] rounded-2xl bg-[var(--m-cartao)]/95 px-5 py-4 shadow-[0_24px_50px_-28px_rgba(47,39,34,0.6)] backdrop-blur @3xl:right-[-8%]">
        <div className="text-[10px] font-medium tracking-[0.24em] uppercase opacity-60">Próximo horário</div>
        <div style={SERIFA} className="mt-1 text-xl">
          Quinta, <span className="italic">14h30</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--m-destaque)]">
          <span className="size-1.5 rounded-full bg-[var(--m-destaque)]" /> Avaliação disponível
        </div>
      </div>
    </div>
  );
}

function Nav({ modelo }: { modelo: Modelo }) {
  const [marca, ...resto] = modelo.negocio.nome.split(" ");
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 @3xl:px-10">
      <span className="flex items-baseline gap-3">
        <span style={SERIFA} className="text-[2rem] leading-none tracking-[-0.02em] italic">
          {marca}
        </span>
        <span className="hidden text-[10px] tracking-[0.3em] uppercase opacity-60 @md:inline">{resto.join(" ")}</span>
      </span>
      <span className="hidden items-center gap-9 text-[13px] tracking-[0.06em] opacity-80 @4xl:flex">
        <Ancora href="#procedimentos">Procedimentos</Ancora>
        <Ancora href="#resultados">Resultados</Ancora>
        <Ancora href="#especialista">A especialista</Ancora>
        <Ancora href="#contato">Contato</Ancora>
      </span>
      <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium tracking-[0.04em] @xl:px-5" style={{ borderColor: LINHA }}>
        <WhatsAppIcon className="size-4 text-[var(--m-destaque)]" />
        <span className="hidden @md:inline">Agendar</span>
      </span>
    </nav>
  );
}

function Hero({ modelo }: { modelo: Modelo }) {
  const { negocio } = modelo;
  const c = negocio.clinica!;
  const animar = useAnimar();
  const [antes, depois] = negocio.chamada.split(c.destaqueChamada);
  const entrar = (i: number) =>
    animar
      ? { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1.1, ease: SUAVE, delay: 0.1 + i * 0.12 } }
      : {};

  return (
    <header className="relative overflow-hidden">
      <div className="bg-[var(--m-destaque)] px-6 py-2.5 text-[10px] tracking-[0.2em] text-[var(--m-texto-destaque)] uppercase @md:tracking-[0.28em]">
        <div className="mx-auto flex max-w-7xl justify-center gap-10 @3xl:justify-between @3xl:px-4">
          <span>Atendimento com hora marcada<span className="hidden @md:inline"> · {c.cidade}</span></span>
          <span className="hidden opacity-80 @3xl:inline">{negocio.local?.endereco}</span>
        </div>
      </div>
      <Nav modelo={modelo} />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pt-6 pb-20 @3xl:grid-cols-[1.08fr_0.92fr] @3xl:px-10 @3xl:pt-4 @3xl:pb-16">
        <div>
          <motion.div {...entrar(0)}>
            <Rotulo>{modelo.segmento}</Rotulo>
          </motion.div>
          <motion.h1
            {...entrar(1)}
            style={SERIFA}
            className="mt-7 text-[clamp(2.7rem,6.6cqw,5.6rem)] leading-[1.02] tracking-[-0.03em] text-balance"
          >
            {antes}
            <span className="text-[var(--m-destaque)] italic">{c.destaqueChamada}</span>
            {depois}
          </motion.h1>
          <motion.p {...entrar(2)} className="mt-7 max-w-md text-[17px] leading-relaxed opacity-75">
            {negocio.subtitulo}
          </motion.p>
          <motion.div {...entrar(3)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <BotaoWhats>{negocio.cta} pelo WhatsApp</BotaoWhats>
            <LinkSeta href="#procedimentos">Ver procedimentos</LinkSeta>
          </motion.div>
          <motion.div {...entrar(4)} className="mt-12 flex items-center gap-4">
            <span className="flex -space-x-2.5">
              {["#E9CDBD", "#CBB5A2", SALVIA_CLARA].map((cor) => (
                <span key={cor} className="size-9 rounded-full border-2 border-[var(--m-fundo)]" style={{ background: cor }} />
              ))}
            </span>
            <span className="text-sm leading-snug">
              <span className="flex items-center gap-1 text-[var(--m-destaque)]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
                <span className="ml-1 font-medium text-[var(--m-texto)]">{negocio.numeros[2][0]}</span>
              </span>
              <span className="opacity-60">
                {negocio.numeros[1][0]} {negocio.numeros[1][1]}
              </span>
            </span>
          </motion.div>
        </div>
        <Composicao marca={negocio.nome.split(" ")[0]} />
      </div>
    </header>
  );
}

function Faixa({ modelo }: { modelo: Modelo }) {
  const animar = useAnimar();
  const itens = [...modelo.negocio.servicos.map((s) => s.titulo), "Retorno incluso"];
  const linha = (
    <span className="flex shrink-0 items-center gap-12 pr-12">
      {itens.map((t) => (
        <span key={t} className="flex items-center gap-12">
          <span style={SERIFA} className="text-2xl italic @3xl:text-3xl">
            {t}
          </span>
          <span className="text-[var(--m-destaque)]">✦</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="overflow-hidden border-y py-6" style={{ borderColor: LINHA }} aria-hidden>
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={animar ? { x: ["0%", "-50%"] } : undefined}
        transition={{ duration: 48, ease: "linear", repeat: Infinity }}
      >
        {linha}
        {linha}
      </motion.div>
    </div>
  );
}

function Manifesto({ modelo }: { modelo: Modelo }) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-28 text-center @3xl:py-36">
      <Surgir>
        <Rotulo>Nossa filosofia</Rotulo>
        <p style={SERIFA} className="mt-8 text-[clamp(1.6rem,3.2cqw,2.5rem)] leading-[1.3] tracking-[-0.01em] text-balance">
          {modelo.negocio.clinica!.manifesto}
        </p>
        <Ramo className="mx-auto mt-10 h-16 rotate-90 text-[var(--m-destaque)] opacity-70" />
      </Surgir>
    </section>
  );
}

const TONS = [
  ["#F3E4D8", ROSE],
  ["#E6E9DF", "#A9B49E"],
  ["#F1E2D6", "#CFAE98"],
  ["#EFE6DC", "#C9B7A3"],
  ["#E9ECE4", "#B7C1AC"],
  ["#F4E7DF", "#D8B9AA"],
];

function Procedimentos({ modelo }: { modelo: Modelo }) {
  const animar = useAnimar();
  return (
    <section id="procedimentos" className="scroll-mt-20 px-6 pb-28 @3xl:px-10 @3xl:pb-36">
      <div className="mx-auto max-w-7xl">
        <Surgir className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-xl">
            <Rotulo>Procedimentos</Rotulo>
            <Titulo2 className="mt-6">
              Tratamentos pensados para o <span className="italic">seu</span> rosto
            </Titulo2>
          </div>
          <p className="max-w-sm leading-relaxed opacity-70">
            Cada indicação nasce da avaliação. Aqui estão os procedimentos mais procurados, todos com retorno incluso.
          </p>
        </Surgir>
        <div className="mt-16 grid gap-5 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {modelo.negocio.servicos.map((s, i) => {
            const I = icones[s.icone];
            const [a, b] = TONS[i % TONS.length];
            return (
              <Surgir key={s.titulo} atraso={(i % 3) * 0.1}>
                <motion.article
                  whileHover={animar ? { y: -6 } : undefined}
                  transition={{ duration: 0.5, ease: SUAVE }}
                  className="group flex h-full flex-col rounded-[28px] border bg-[var(--m-cartao)] p-7 @3xl:p-8"
                  style={{ borderColor: LINHA }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="relative grid h-28 w-22 place-items-center overflow-hidden rounded-t-full"
                      style={{ background: `linear-gradient(170deg, ${a} 0%, ${b} 100%)` }}
                    >
                      <I className="relative size-6 text-white" strokeWidth={1.4} />
                      <Ruido opacidade={0.1} />
                    </div>
                    <span style={SERIFA} className="text-lg italic opacity-40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 style={SERIFA} className="mt-8 text-[1.65rem] leading-tight">
                    {s.titulo}
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed opacity-70">{s.texto}</p>
                  <div className="mt-8 flex items-center justify-between border-t pt-5 text-[13px]" style={{ borderColor: LINHA }}>
                    <span className="flex items-center gap-2 opacity-65">
                      <Clock className="size-4" /> {s.duracao ?? "Sob avaliação"}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-[var(--m-destaque)]">
                      Agendar <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </motion.article>
              </Surgir>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Textura de pele abstrata (ilustração, não é foto de paciente)
function Pele({ depois, tom }: { depois: boolean; tom: number }) {
  const base = ["#E7C6B1", "#E2BEA6", "#EACDBB"][tom % 3];
  const manchas = depois
    ? "radial-gradient(60% 50% at 35% 30%, rgba(255,255,255,0.55), transparent 70%)"
    : [
        "radial-gradient(9% 7% at 30% 38%, rgba(150,90,60,0.35), transparent)",
        "radial-gradient(6% 5% at 62% 30%, rgba(150,90,60,0.3), transparent)",
        "radial-gradient(12% 9% at 55% 62%, rgba(170,80,70,0.22), transparent)",
        "radial-gradient(7% 6% at 26% 70%, rgba(150,90,60,0.3), transparent)",
        "radial-gradient(5% 4% at 75% 55%, rgba(150,90,60,0.28), transparent)",
        "radial-gradient(40% 30% at 70% 80%, rgba(180,100,90,0.18), transparent)",
      ].join(",");
  return (
    <div className="absolute inset-0" style={{ background: `${manchas}, linear-gradient(160deg, ${base} 0%, #D4A992 100%)` }}>
      <Ruido opacidade={depois ? 0.08 : 0.32} />
      {depois && <div className="absolute -top-[10%] left-[10%] size-[60%] rounded-full bg-white/40 blur-3xl" />}
    </div>
  );
}

function Resultados({ modelo }: { modelo: Modelo }) {
  const c = modelo.negocio.clinica!;
  const [caso, setCaso] = useState(0);
  const [pos, setPos] = useState(52);
  const atual = c.resultados[caso];

  return (
    <section id="resultados" className="scroll-mt-20 bg-[var(--m-suave)] px-6 py-28 @3xl:px-10 @3xl:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 @4xl:grid-cols-[0.9fr_1.1fr]">
        <Surgir className="order-2 mx-auto w-full max-w-[440px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full select-none">
            <Pele depois tom={caso} />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <Pele depois={false} tom={caso} />
            </div>
            <div className="pointer-events-none absolute inset-y-0 w-px bg-white/90" style={{ left: `${pos}%` }}>
              <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[var(--m-texto)] shadow-lg">
                <span className="flex gap-0.5 text-xs">‹ ›</span>
              </span>
            </div>
            <span className="absolute bottom-6 left-6 rounded-full bg-white/80 px-3 py-1 text-[10px] tracking-[0.24em] uppercase backdrop-blur">Antes</span>
            <span className="absolute right-6 bottom-6 rounded-full bg-white/80 px-3 py-1 text-[10px] tracking-[0.24em] uppercase backdrop-blur">Depois</span>
            <input
              type="range"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-label="Arraste para comparar antes e depois"
              className="absolute inset-0 size-full cursor-ew-resize opacity-0"
            />
          </div>
          <p className="mt-4 text-center text-xs opacity-55">Ilustração. Resultados variam de pessoa para pessoa.</p>
        </Surgir>

        <Surgir>
          <Rotulo>Resultados</Rotulo>
          <Titulo2 className="mt-6">
            Mudanças que se <span className="italic">sentem</span>, sem parecer que você fez algo
          </Titulo2>
          <p className="mt-6 max-w-md leading-relaxed opacity-70">
            Arraste a imagem para comparar. Fotografamos cada etapa com a mesma luz para você acompanhar a evolução com clareza.
          </p>
          <div className="mt-10 border-t" style={{ borderColor: LINHA }}>
            {c.resultados.map((r, i) => (
              <button
                key={r.procedimento}
                type="button"
                onClick={() => setCaso(i)}
                aria-pressed={caso === i}
                className="flex w-full items-center justify-between gap-4 border-b py-5 text-left transition-opacity"
                style={{ borderColor: LINHA, opacity: caso === i ? 1 : 0.55 }}
              >
                <span>
                  <span style={SERIFA} className="block text-2xl">
                    {r.procedimento}
                  </span>
                  <span className="text-sm opacity-70">
                    {r.perfil} · {r.sessoes}
                  </span>
                </span>
                <span className={`grid size-9 shrink-0 place-items-center rounded-full border transition ${caso === i ? "bg-[var(--m-destaque)] text-white" : ""}`} style={{ borderColor: LINHA }}>
                  <ArrowRight className="size-4" />
                </span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={atual.procedimento}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              style={SERIFA}
              className="mt-8 text-xl italic"
            >
              “{atual.texto}”
            </motion.p>
          </AnimatePresence>
        </Surgir>
      </div>
    </section>
  );
}

function Jornada({ modelo }: { modelo: Modelo }) {
  const passos = modelo.negocio.clinica!.passos;
  return (
    <section className="px-6 py-28 @3xl:px-10 @3xl:py-36">
      <div className="mx-auto max-w-7xl">
        <Surgir className="text-center">
          <Rotulo>Como funciona</Rotulo>
          <Titulo2 className="mx-auto mt-6 max-w-2xl">Do primeiro contato ao retorno, cada etapa com calma</Titulo2>
        </Surgir>
        <ol className="mt-16 grid gap-10 @2xl:grid-cols-2 @5xl:grid-cols-4 @5xl:gap-6">
          {passos.map((p, i) => (
            <Surgir key={p.titulo} atraso={i * 0.1}>
              <li className="relative">
                <div className="flex items-center gap-4">
                  <span style={SERIFA} className="text-5xl text-[var(--m-destaque)] italic">
                    {i + 1}
                  </span>
                  <span className="h-px flex-1" style={{ background: LINHA }} />
                </div>
                <h3 style={SERIFA} className="mt-5 text-2xl">
                  {p.titulo}
                </h3>
                <p className="mt-2 leading-relaxed opacity-70">{p.texto}</p>
              </li>
            </Surgir>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Especialista({ modelo }: { modelo: Modelo }) {
  const { negocio } = modelo;
  const e = negocio.clinica!.especialista;
  const iniciais = e.nome
    .replace(/^Dra?\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .join("");
  return (
    <section id="especialista" className="scroll-mt-20 px-6 pb-28 @3xl:px-10 @3xl:pb-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 @4xl:grid-cols-[0.85fr_1.15fr] @4xl:gap-24">
        <Surgir className="relative mx-auto w-full max-w-[420px]">
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-t-full"
            style={{ background: `linear-gradient(175deg, #EFE3D8 0%, #D7C2B1 60%, #BFA592 100%)` }}
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(47,39,34,0.18),transparent)]" />
            <span style={SERIFA} className="absolute inset-0 grid place-items-center text-[7rem] text-white/80 italic">
              {iniciais}
            </span>
            <Ruido opacidade={0.12} />
          </div>
          <div className="absolute -bottom-6 left-1/2 w-[82%] -translate-x-1/2 rounded-2xl bg-[var(--m-cartao)] px-6 py-4 text-center shadow-[0_24px_50px_-30px_rgba(47,39,34,0.6)]">
            <div style={SERIFA} className="text-xl">
              {e.nome}
            </div>
            <div className="text-[11px] tracking-[0.2em] uppercase opacity-60">{e.cargo}</div>
          </div>
        </Surgir>
        <Surgir atraso={0.1}>
          <Rotulo>A especialista</Rotulo>
          <Titulo2 className="mt-6">
            Técnica apurada, <span className="italic">olhar delicado</span>
          </Titulo2>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed opacity-75">{e.texto}</p>
          <p className="mt-4 max-w-lg leading-relaxed opacity-65">{negocio.sobre}</p>
          <ul className="mt-10 max-w-lg border-t" style={{ borderColor: LINHA }}>
            {e.formacao.map((f) => (
              <li key={f} className="flex items-center gap-4 border-b py-4 text-[15px]" style={{ borderColor: LINHA }}>
                <span className="size-1.5 rounded-full bg-[var(--m-destaque)]" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-6">
            {negocio.numeros.map(([n, t]) => (
              <div key={t}>
                <div style={SERIFA} className="text-4xl text-[var(--m-destaque)]">
                  {n}
                </div>
                <div className="mt-1 text-xs tracking-[0.06em] opacity-60">{t}</div>
              </div>
            ))}
          </div>
        </Surgir>
      </div>
    </section>
  );
}

function Diferenciais({ modelo }: { modelo: Modelo }) {
  return (
    <section className="bg-[var(--m-texto)] px-6 py-24 text-[var(--m-fundo)] @3xl:px-10 @3xl:py-28">
      <div className="mx-auto max-w-7xl">
        <Surgir>
          <Rotulo claro>Por que a {modelo.negocio.nome.split(" ")[0]}</Rotulo>
        </Surgir>
        <div className="mt-12 grid gap-12 @2xl:grid-cols-2 @5xl:grid-cols-4 @5xl:gap-10">
          {modelo.negocio.clinica!.diferenciais.map((d, i) => {
            const I = icones[d.icone];
            return (
              <Surgir key={d.titulo} atraso={i * 0.08}>
                <span className="grid size-12 place-items-center rounded-full border border-white/20">
                  <I className="size-5" strokeWidth={1.4} />
                </span>
                <h3 style={SERIFA} className="mt-6 text-2xl">
                  {d.titulo}
                </h3>
                <p className="mt-2 leading-relaxed opacity-65">{d.texto}</p>
              </Surgir>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Depoimentos({ modelo }: { modelo: Modelo }) {
  const { negocio } = modelo;
  return (
    <section className="px-6 py-28 @3xl:px-10 @3xl:py-36">
      <div className="mx-auto max-w-7xl">
        <Surgir className="mx-auto max-w-4xl text-center">
          <span className="flex justify-center gap-1 text-[var(--m-destaque)]">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </span>
          <blockquote style={SERIFA} className="mt-8 text-[clamp(1.8rem,3.6cqw,2.9rem)] leading-[1.25] tracking-[-0.01em] text-balance">
            “{negocio.depoimento.texto}”
          </blockquote>
          <p className="mt-6 text-[11px] tracking-[0.24em] uppercase opacity-60">{negocio.depoimento.nome} · Bioestimulador</p>
        </Surgir>
        <div className="mx-auto mt-16 grid max-w-5xl gap-5 @3xl:grid-cols-2">
          {negocio.clinica!.depoimentos.map((d, i) => (
            <Surgir key={d.texto} atraso={i * 0.1}>
              <figure className="h-full rounded-[28px] border bg-[var(--m-cartao)] p-8" style={{ borderColor: LINHA }}>
                <blockquote style={SERIFA} className="text-xl leading-snug">
                  “{d.texto}”
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between text-sm">
                  <span className="opacity-60">{d.nome}</span>
                  <span className="rounded-full bg-[var(--m-suave)] px-3 py-1 text-xs">{d.procedimento}</span>
                </figcaption>
              </figure>
            </Surgir>
          ))}
        </div>
      </div>
    </section>
  );
}

function Mapa() {
  const animar = useAnimar();
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-[var(--m-suave)] @4xl:aspect-auto @4xl:h-full">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <g fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" opacity="0.9">
          <path d="M-20 80 C 100 70, 200 120, 420 90" />
          <path d="M-20 210 C 120 190, 260 240, 420 200" />
          <path d="M120 -20 C 130 100, 110 200, 140 320" />
          <path d="M290 -20 C 270 120, 300 220, 280 320" />
        </g>
        <g fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.7">
          <path d="M-20 140 L 420 150" />
          <path d="M210 -20 L 200 320" />
          <path d="M40 -20 L 60 320" />
          <path d="M350 -20 L 360 320" />
        </g>
        <ellipse cx="330" cy="250" rx="70" ry="45" fill={SALVIA_CLARA} opacity="0.8" />
        <ellipse cx="60" cy="40" rx="50" ry="30" fill={SALVIA_CLARA} opacity="0.6" />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
        {animar && (
          <motion.span
            className="absolute top-full left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--m-destaque)]"
            initial={{ scale: 0.3, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className="relative grid size-12 place-items-center rounded-full bg-[var(--m-destaque)] text-white shadow-xl">
          <MapPin className="size-5" />
        </span>
      </div>
    </div>
  );
}

function Local({ modelo }: { modelo: Modelo }) {
  const { negocio } = modelo;
  const c = negocio.clinica!;
  return (
    <section id="contato" className="scroll-mt-20 px-6 pb-28 @3xl:px-10 @3xl:pb-36">
      <div className="mx-auto grid max-w-7xl gap-6 @4xl:grid-cols-[1.15fr_0.85fr]">
        <Surgir className="min-h-[300px]">
          <Mapa />
        </Surgir>
        <Surgir atraso={0.1}>
          <div className="h-full rounded-[32px] border bg-[var(--m-cartao)] p-8 @3xl:p-10" style={{ borderColor: LINHA }}>
            <Rotulo>Visite a clínica</Rotulo>
            <h2 style={SERIFA} className="mt-6 text-3xl leading-tight @3xl:text-4xl">
              {negocio.local?.endereco}
            </h2>
            <p className="mt-2 opacity-65">{c.cidade} · estacionamento conveniado</p>
            <dl className="mt-8 border-t" style={{ borderColor: LINHA }}>
              {c.horarios.map(([dia, hora]) => (
                <div key={dia} className="flex justify-between gap-4 border-b py-4 text-[15px]" style={{ borderColor: LINHA }}>
                  <dt className="opacity-70">{dia}</dt>
                  <dd className={hora === "Fechado" ? "opacity-45" : "font-medium"}>{hora}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <BotaoWhats>{negocio.cta}</BotaoWhats>
              <LinkSeta href="#contato">Como chegar</LinkSeta>
            </div>
          </div>
        </Surgir>
      </div>
    </section>
  );
}

function Faq({ modelo }: { modelo: Modelo }) {
  const faq = modelo.negocio.clinica!.faq;
  const [aberta, setAberta] = useState<number | null>(0);
  return (
    <section className="px-6 pb-28 @3xl:px-10 @3xl:pb-36">
      <div className="mx-auto grid max-w-7xl gap-12 @4xl:grid-cols-[0.8fr_1.2fr] @4xl:gap-24">
        <Surgir>
          <Rotulo>Dúvidas frequentes</Rotulo>
          <Titulo2 className="mt-6">Antes de agendar</Titulo2>
          <p className="mt-6 max-w-sm leading-relaxed opacity-70">Não encontrou sua pergunta? Fale com a nossa equipe pelo WhatsApp.</p>
        </Surgir>
        <Surgir atraso={0.1} className="border-t [border-color:color-mix(in_srgb,var(--m-texto)_13%,transparent)]" y={20}>
          {faq.map((f, i) => {
            const aberto = aberta === i;
            return (
              <div key={f.pergunta} className="border-b" style={{ borderColor: LINHA }}>
                <button
                  type="button"
                  onClick={() => setAberta(aberto ? null : i)}
                  aria-expanded={aberto}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span style={SERIFA} className="text-xl @3xl:text-2xl">
                    {f.pergunta}
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border" style={{ borderColor: LINHA }}>
                    {aberto ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {aberto && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: SUAVE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-6 leading-relaxed opacity-70">{f.resposta}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Surgir>
      </div>
    </section>
  );
}

function ChamadaFinal({ modelo }: { modelo: Modelo }) {
  return (
    <section className="px-4 pb-6 @3xl:px-6">
      <Surgir>
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[40px] bg-[var(--m-destaque)] px-6 py-24 text-center text-[var(--m-texto-destaque)] @3xl:py-32">
          <div className="absolute -bottom-1/2 left-1/2 aspect-square w-[70%] -translate-x-1/2 rounded-t-full border border-white/15" />
          <div className="absolute -bottom-1/2 left-1/2 aspect-square w-[52%] -translate-x-1/2 rounded-t-full border border-white/15" />
          <Ruido opacidade={0.08} />
          <div className="relative">
            <Rotulo claro>Agende sua avaliação</Rotulo>
            <h2 style={SERIFA} className="mx-auto mt-7 max-w-3xl text-[clamp(2.4rem,5.6cqw,4.6rem)] leading-[1.04] tracking-[-0.02em] text-balance">
              Seu próximo passo é <span className="italic">uma conversa</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-md leading-relaxed opacity-80">
              Conte o que você deseja e enviamos as opções de dia e horário pelo WhatsApp.
            </p>
            <BotaoWhats claro className="mt-10">
              {modelo.negocio.cta} pelo WhatsApp
            </BotaoWhats>
          </div>
        </div>
      </Surgir>
    </section>
  );
}

function Rodape({ modelo }: { modelo: Modelo }) {
  const { negocio } = modelo;
  const marca = negocio.nome.split(" ")[0];
  return (
    <footer className="px-6 pt-20 pb-10 @3xl:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 text-sm @3xl:grid-cols-4">
          <div className="@3xl:col-span-2">
            <p style={SERIFA} className="max-w-sm text-2xl leading-snug">
              Estética avançada com critério, calma e resultado natural.
            </p>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.24em] uppercase opacity-50">Endereço</div>
            <p className="mt-3 leading-relaxed opacity-80">
              {negocio.local?.endereco}
              <br />
              {negocio.clinica!.cidade}
            </p>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.24em] uppercase opacity-50">Agendamento</div>
            <p className="mt-3 flex items-center gap-2 leading-relaxed opacity-80">
              <WhatsAppIcon className="size-4" /> (41) 90000-0000
            </p>
            <p className="mt-1 opacity-80">{negocio.local?.horario}</p>
          </div>
        </div>
        <div
          aria-hidden
          style={SERIFA}
          className="mt-16 overflow-hidden text-center text-[clamp(6rem,30cqw,24rem)] leading-[0.8] tracking-[-0.05em] text-[var(--m-destaque)] italic opacity-90"
        >
          {marca}
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-4 border-t pt-6 text-xs opacity-60" style={{ borderColor: LINHA }}>
          <span>© {negocio.nome} · Site de demonstração com negócio fictício</span>
          <span>Imagens ilustrativas. Procedimentos realizados após avaliação.</span>
        </div>
      </div>
    </footer>
  );
}

export function SiteEstetica({ modelo, apenasHero = false }: { modelo: Modelo; apenasHero?: boolean }) {
  return (
    <Animar.Provider value={!apenasHero}>
      <div className={`${serifa.variable} overflow-x-clip`}>
        <Hero modelo={modelo} />
        {!apenasHero && (
          <>
            <Faixa modelo={modelo} />
            <Manifesto modelo={modelo} />
            <Procedimentos modelo={modelo} />
            <Resultados modelo={modelo} />
            <Jornada modelo={modelo} />
            <Especialista modelo={modelo} />
            <Diferenciais modelo={modelo} />
            <Depoimentos modelo={modelo} />
            <Local modelo={modelo} />
            <Faq modelo={modelo} />
            <ChamadaFinal modelo={modelo} />
            <Rodape modelo={modelo} />
          </>
        )}
      </div>
    </Animar.Provider>
  );
}
