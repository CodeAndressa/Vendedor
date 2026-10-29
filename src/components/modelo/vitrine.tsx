"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Modelo } from "@/lib/modelos";
import { Eyebrow, Titulo } from "../ui";

// Vitrine de modelos na página inicial. No computador, a rolagem vertical move os cartões
// na horizontal (seção "presa" na tela). No celular, é um carrossel de arrastar.
export function Vitrine({ itens, total }: { itens: { modelo: Modelo; previa: ReactNode }[]; total: number }) {
  const secao = useRef<HTMLElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const [distancia, setDistancia] = useState(0);
  const [fixar, setFixar] = useState(false);
  const reduzir = useReducedMotion();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const medir = () => {
      const ativo = mq.matches && !reduzir;
      setFixar(ativo);
      if (trilho.current) setDistancia(Math.max(0, trilho.current.scrollWidth - window.innerWidth + 40));
    };
    medir();
    mq.addEventListener("change", medir);
    window.addEventListener("resize", medir);
    return () => {
      mq.removeEventListener("change", medir);
      window.removeEventListener("resize", medir);
    };
  }, [reduzir]);

  // remede quando troca entre carrossel e trilho fixo (o elemento do trilho muda)
  useEffect(() => {
    if (trilho.current) setDistancia(Math.max(0, trilho.current.scrollWidth - window.innerWidth + 40));
  }, [fixar]);

  const { scrollYProgress } = useScroll({ target: secao, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distancia]);
  const progresso = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  const cartoes = (
    <>
      {itens.map(({ modelo, previa }) => (
        <Link
          key={modelo.slug}
          href={`/modelos/${modelo.slug}`}
          className="group w-[82vw] shrink-0 snap-center overflow-hidden rounded-[28px] border border-white/10 bg-forest-2 sm:w-[440px] lg:w-[520px]"
        >
          <div className="overflow-hidden">
            <div className="transition duration-500 group-hover:scale-[1.04]">{previa}</div>
          </div>
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <div className="font-display text-xl text-white">{modelo.nome}</div>
              <div className="text-sm text-white/60">
                {modelo.segmento} · {modelo.tipo}
              </div>
            </div>
            <span className="grid size-11 place-items-center rounded-full border border-white/20 text-white transition group-hover:border-lime group-hover:bg-lime group-hover:text-forest">
              <ArrowUpRight className="size-5" />
            </span>
          </div>
        </Link>
      ))}
      <Link
        href="/modelos"
        className="flex w-[70vw] shrink-0 snap-center flex-col justify-between rounded-[28px] bg-lime p-8 text-forest sm:w-[320px]"
      >
        <span className="font-display text-6xl">{total}</span>
        <span>
          <span className="block font-display text-2xl">modelos para escolher</span>
          <span className="mt-2 inline-flex items-center gap-1.5 font-semibold">
            Abrir a galeria <ArrowRight className="size-4" />
          </span>
        </span>
      </Link>
    </>
  );

  return (
    <section ref={secao} className="relative bg-forest text-white" style={fixar ? { height: `calc(100vh + ${distancia}px)` } : undefined}>
      <div className={fixar ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-24"}>
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10 xl:px-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow claro>Modelos prontos</Eyebrow>
              <Titulo className="max-w-2xl">
                Escolha um ponto de partida. <span className="text-lime">Eu adapto ao seu negócio.</span>
              </Titulo>
            </div>
            <Link href="/modelos" className="inline-flex items-center gap-2 font-semibold text-lime hover:underline">
              Ver galeria completa <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {fixar ? (
          <motion.div ref={trilho} style={{ x }} className="mt-12 flex w-max gap-6 pl-[max(20px,calc((100vw-72rem)/2+20px))]">
            {cartoes}
          </motion.div>
        ) : (
          <div ref={trilho} className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
            {cartoes}
          </div>
        )}

        {fixar && (
          <div className="mx-auto mt-10 h-1 w-full max-w-[1440px] px-5 md:px-10 xl:px-16">
            <div className="h-full overflow-hidden rounded-full bg-white/10">
              <motion.div style={{ width: progresso }} className="h-full rounded-full bg-lime" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
