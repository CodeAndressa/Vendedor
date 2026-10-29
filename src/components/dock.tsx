"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { BriefcaseBusiness, CircleHelp, House, LayoutGrid, Sparkles, Tag } from "lucide-react";

// Menu flutuante no rodapé da tela (inspirado no Prisma): pílula com ícones e rótulos,
// e um círculo verde no item ativo. Na home ele acompanha a seção que está na tela.
const itens = [
  { id: "inicio", href: "/#inicio", rotulo: "Início", icone: House },
  { id: "analise-ia", href: "/analise-ia", rotulo: "IA grátis", icone: Sparkles, destaque: true },
  { id: "modelos", href: "/modelos", rotulo: "Modelos", icone: LayoutGrid },
  { id: "orcamento", href: "/#orcamento", rotulo: "Preços", icone: Tag },
  { id: "portfolio", href: "/#portfolio", rotulo: "Portfólio", icone: BriefcaseBusiness },
  { id: "duvidas", href: "/#duvidas", rotulo: "Dúvidas", icone: CircleHelp },
] as const;

const secoesDaHome = ["inicio", "orcamento", "portfolio", "duvidas"];

export function Dock() {
  const caminho = usePathname();
  const reduzir = useReducedMotion();
  const [secao, setSecao] = useState("inicio");

  // na home, marca a seção que ocupa o meio da tela
  useEffect(() => {
    if (caminho !== "/") return;
    const alvos = secoesDaHome.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visivel) setSecao(visivel.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    alvos.forEach((a) => observador.observe(a));
    return () => observador.disconnect();
  }, [caminho]);

  const ativo = caminho === "/" ? secao : caminho.startsWith("/modelos") ? "modelos" : caminho.startsWith("/analise-ia") ? "analise-ia" : "";

  return (
    <motion.nav
      aria-label="Menu"
      initial={reduzir ? false : { y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 220, damping: 24 }}
      className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-2 sm:bottom-5 print:hidden"
    >
      <ul className="flex items-center gap-0.5 rounded-full border border-ink/10 bg-card/90 p-1.5 shadow-[0_20px_50px_-18px_rgba(8,30,20,0.45)] backdrop-blur-xl sm:gap-1">
        {itens.map(({ id, href, rotulo, icone: Icone, ...resto }) => {
          const esteAtivo = ativo === id;
          const destaque = "destaque" in resto && resto.destaque;
          return (
            <li key={id}>
              <Link
                href={href}
                aria-current={esteAtivo ? "page" : undefined}
                className={`relative flex w-[54px] flex-col items-center gap-0.5 rounded-full py-1.5 text-[10.5px] font-medium transition sm:w-[68px] sm:text-[11px] ${
                  esteAtivo ? "text-white" : destaque ? "text-[#9C7B3C] hover:text-[#7A5E2A]" : "text-ink-soft hover:text-ink"
                }`}
              >
                {esteAtivo && (
                  <motion.span
                    layoutId="dock-ativo"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[#0A4A2B] shadow-[0_8px_20px_-8px_rgba(10,74,43,0.8)]"
                  />
                )}
                <Icone className={`relative size-[18px] ${esteAtivo ? "text-lime" : ""}`} strokeWidth={1.8} />
                <span className="relative">{rotulo}</span>
                {destaque && !esteAtivo && <span className="absolute top-1 right-3 size-1.5 rounded-full bg-lime sm:right-4" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
