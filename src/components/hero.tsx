"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Clock, ShieldCheck, Wallet } from "lucide-react";
import { projetos } from "@/lib/content";
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
    <section className="relative -mt-[72px] overflow-hidden bg-forest pt-[72px] text-white">
      {/* brilhos de fundo e pontilhado fino */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-[-10%] size-[720px] rounded-full bg-[radial-gradient(circle,rgba(23,120,74,0.35)_0%,transparent_65%)]" />
      <div aria-hidden className="pointer-events-none absolute right-[-5%] bottom-[-30%] size-[640px] rounded-full bg-[radial-gradient(circle,rgba(217,194,142,0.14)_0%,transparent_65%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_80%_70%_at_60%_40%,black,transparent)]"
      />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-5 pt-14 pb-20 md:px-10 md:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:pb-28 xl:px-16">
        <div>
          <motion.span {...anim(0)} className="inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.22em] text-lime uppercase">
            <span className="h-px w-8 bg-lime/60" /> Sites profissionais
          </motion.span>

          <motion.h1
            {...anim(0.08)}
            className="mt-6 font-display text-[clamp(2.5rem,4.6vw,4.6rem)] leading-[1.02] tracking-[-0.035em] text-balance"
          >
            Seu site no ar em 7 dias.{" "}
            <span className="block text-lime">A partir de R$ 997, domínio incluso.</span>
          </motion.h1>

          <motion.p {...anim(0.16)} className="mt-7 max-w-xl text-lg leading-relaxed text-white/65">
            Design, textos, versão para celular e Google, tudo publicado no seu domínio. Você me conta sobre o negócio no
            WhatsApp e em <strong className="font-semibold text-white">48 horas</strong> já vê a primeira versão.
          </motion.p>

          <motion.div {...anim(0.24)} className="mt-10 flex flex-wrap gap-3">
            <Botao
              mensagem="Oi! Quero colocar o site do meu negócio no ar."
              variante="lima"
              className="shadow-[0_0_0_1px_rgba(217,194,142,0.4),0_10px_40px_-6px_rgba(217,194,142,0.55)]"
            >
              <WhatsAppIcon /> Quero meu site em 7 dias
            </Botao>
            <Botao href="#portfolio" variante="claro">
              Ver sites que entreguei
            </Botao>
          </motion.div>

          <motion.ul {...anim(0.32)} className="mt-12 grid max-w-xl gap-x-6 gap-y-3 text-sm text-white/70 sm:grid-cols-3">
            {[
              { icone: Clock, texto: "1ª versão em 48h" },
              { icone: Wallet, texto: "12x sem entrada" },
              { icone: ShieldCheck, texto: "Seguro por padrão" },
            ].map(({ icone: Icone, texto }) => (
              <li key={texto} className="flex items-center gap-2.5">
                <Icone className="size-4 text-lime" strokeWidth={1.75} /> {texto}
              </li>
            ))}
          </motion.ul>
        </div>

        <Vitrine />
      </div>
    </section>
  );
}

// Trabalho real no lugar de um desenho: o site da 4Core no computador e no celular.
function Vitrine() {
  const reduzir = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, reduzir ? 0 : 60]);
  const projeto = projetos.find((p) => p.imagem) ?? projetos[0];

  return (
    <motion.div
      initial={reduzir ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[680px]"
    >
      <motion.div style={{ y }} className="relative">
        <span className="absolute -top-3 right-6 z-20 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-forest px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">
          No ar
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
        </span>

        <a
          href={projeto.url}
          target="_blank"
          rel="noopener"
          className="group block overflow-hidden rounded-2xl bg-[#141414] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
        >
          <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-[11px] text-white/45">
              https://{projeto.url?.replace("https://", "")}
            </span>
            <ArrowUpRight className="size-4 text-white/30 transition group-hover:text-white" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={projeto.imagem}
            alt={`Site da ${projeto.cliente}, feito por mim`}
            className="aspect-[16/10] w-full object-cover object-top"
            fetchPriority="high"
          />
        </a>

        {projeto.imagemCelular && (
          <div className="absolute -bottom-10 -left-4 w-[26%] min-w-[92px] rounded-[22px] bg-[#0d0d0d] p-1.5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/15 sm:-left-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={projeto.imagemCelular} alt="" className="aspect-[9/19] w-full rounded-[17px] object-cover object-top" />
          </div>
        )}
      </motion.div>

      {/* linha do tempo do projeto */}
      <div className="relative mt-16 ml-[22%] sm:ml-[18%]">
        <div aria-hidden className="h-px bg-gradient-to-r from-lime/70 via-white/25 to-emerald-400" />
        <ol className="mt-3 grid grid-cols-3 text-[12px] leading-tight">
          <li>
            <span className="block font-semibold text-white">Dia 1</span>
            <span className="text-white/50">conversa</span>
          </li>
          <li className="text-center">
            <span className="block font-semibold text-white">Dia 2</span>
            <span className="text-white/50">primeira versão</span>
          </li>
          <li className="text-right">
            <span className="block font-semibold text-emerald-300">Dia 7</span>
            <span className="text-white/50">no ar</span>
          </li>
        </ol>
      </div>
    </motion.div>
  );
}
