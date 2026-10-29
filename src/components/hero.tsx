"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Clock, Globe, ShieldCheck } from "lucide-react";
import { Botao, WhatsAppIcon } from "./ui";

const entrada = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const reduzir = useReducedMotion();
  const anim = (delay: number) => (reduzir ? {} : entrada(delay));

  return (
    <section className="relative overflow-hidden">
      {/* fundo: grade fina que some nas bordas e um brilho esmeralda */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] bg-[size:72px_72px] opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_30%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 right-[-12%] size-[720px] rounded-full bg-[radial-gradient(circle,rgba(23,120,74,0.16)_0%,transparent_62%)] blur-2xl"
      />
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-5 md:px-10 xl:px-16 pt-12 pb-20 md:pt-20 lg:grid-cols-[1.12fr_0.88fr] lg:pb-32">
        <div>
          <motion.div {...anim(0)}>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card/70 px-3.5 py-1.5 text-[13px] text-ink-soft backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              Agenda aberta para novos projetos
            </span>
          </motion.div>

          <motion.h1
            {...anim(0.08)}
            className="mt-7 font-display text-[clamp(2.6rem,5.6vw,5.8rem)] leading-[1.02] tracking-[-0.03em] text-balance"
          >
            Seu site profissional, <em className="text-brand">no ar em 7 dias.</em>
          </motion.h1>

          <motion.p {...anim(0.16)} className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-[19px]">
            Você me conta sobre o seu negócio no WhatsApp e eu cuido do resto: textos, design, domínio e publicação.
            Em <strong className="text-ink">48 horas</strong> você já vê a primeira versão.
          </motion.p>

          <motion.div {...anim(0.24)} className="mt-10 flex flex-wrap gap-3">
            <Botao mensagem="Oi! Quero colocar o site do meu negócio no ar.">
              <WhatsAppIcon /> Quero meu site
            </Botao>
            <Botao href="#diagnostico" variante="contorno">
              Descobrir meu site ideal (30s)
            </Botao>
          </motion.div>

          <motion.dl {...anim(0.32)} className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-line border-y border-line py-5">
            {[
              ["48h", "primeira versão"],
              ["R$ 997", "preço fechado"],
              ["12x", "sem entrada"],
            ].map(([n, t]) => (
              <div key={t} className="px-4 first:pl-0">
                <dt className="font-display text-2xl tracking-tight whitespace-nowrap sm:text-3xl">{n}</dt>
                <dd className="mt-1 text-[13px] text-ink-soft">{t}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <MockupCelular />
      </div>
    </section>
  );
}

function MockupCelular() {
  const reduzir = useReducedMotion();
  // parallax: o celular desce e gira um pouco enquanto a pessoa rola
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, reduzir ? 0 : 90]);
  const giro = useTransform(scrollY, [0, 700], [0, reduzir ? 0 : -5]);
  const flutuar = (dur: number, dist = 10) =>
    reduzir ? {} : { animate: { y: [0, -dist, 0] }, transition: { duration: dur, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <motion.div
      initial={reduzir ? false : { opacity: 0, scale: 0.94, rotate: 2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[380px]"
    >
      <motion.div style={{ y, rotate: giro }}>
      {/* celular */}
      <div className="relative mx-auto w-[270px] rounded-[46px] bg-gradient-to-b from-[#1d3328] to-forest p-3 shadow-[0_60px_100px_-40px_rgba(8,30,20,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-black/40 sm:w-[290px]">
        <div className="absolute top-5 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-forest" />
        <div className="overflow-hidden rounded-[34px] bg-bg">
          {/* site fictício dentro do celular */}
          <div className="bg-forest px-5 pt-12 pb-6 text-white">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-sm">Clínica Sorriso</span>
              <span className="h-1.5 w-5 rounded-full bg-white/60" />
            </div>
            <div className="font-display text-[26px] leading-[1.05]">
              Seu sorriso em boas mãos.
            </div>
            <div className="mt-2 h-2 w-4/5 rounded-full bg-white/25" />
            <div className="mt-1.5 h-2 w-3/5 rounded-full bg-white/25" />
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-wa px-3.5 py-2 text-xs font-semibold text-forest">
              <WhatsAppIcon className="size-3.5" /> Agendar consulta
            </div>
          </div>
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
                <div className="size-9 rounded-xl bg-brand-soft" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-2/3 rounded-full bg-ink/15" />
                  <div className="h-2 w-1/2 rounded-full bg-ink/10" />
                </div>
              </div>
            ))}
            <div className="h-24 rounded-2xl bg-gradient-to-br from-brand-soft via-bg-alt to-lime/40" />
          </div>
        </div>
      </div>

      {/* selos flutuantes */}
      <motion.div
        {...flutuar(5)}
        className="absolute z-20 top-[40%] -left-2 flex items-center gap-2.5 rounded-2xl border border-white/60 bg-card/85 px-4 py-3 shadow-[0_24px_50px_-24px_rgba(8,30,20,0.45)] backdrop-blur-md sm:-left-8"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">
          <Clock className="size-5" />
        </span>
        <div className="text-sm leading-tight">
          <div className="font-semibold">Primeira versão</div>
          <div className="text-ink-soft">em 48 horas</div>
        </div>
      </motion.div>

      <motion.div
        {...flutuar(6, 12)}
        className="absolute z-20 top-6 -right-1 flex items-center gap-2.5 rounded-2xl border border-white/60 bg-card/85 px-4 py-3 shadow-[0_24px_50px_-24px_rgba(8,30,20,0.45)] backdrop-blur-md sm:-right-6"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-forest text-lime">
          <Globe className="size-5" />
        </span>
        <div className="text-sm leading-tight">
          <div className="font-semibold">seunegocio.com.br</div>
          <div className="text-ink-soft">no seu nome</div>
        </div>
      </motion.div>

      <motion.div
        {...flutuar(7, 8)}
        className="absolute z-20 bottom-6 left-2 flex items-center gap-2.5 rounded-2xl bg-forest px-4 py-3 text-white shadow-[0_24px_50px_-20px_rgba(8,30,20,0.7)] sm:-left-6"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-lime">
          <ShieldCheck className="size-5" />
        </span>
        <div className="text-sm leading-tight">
          <div className="font-semibold">Seguro por padrão</div>
          <div className="text-white/60">HTTPS, LGPD e OWASP</div>
        </div>
      </motion.div>
      </motion.div>
    </motion.div>
  );
}
