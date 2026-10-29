"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { config } from "@/lib/config";
import { Logo } from "./logo";
import { Botao, WhatsAppIcon } from "./ui";

const links = [
  { href: "/analise-ia", label: "Análise de IA grátis" },
  { href: "/modelos", label: "Modelos" },
  { href: "/#orcamento", label: "Preços" },
  { href: "/#mensal", label: "Planos mensais" },
  { href: "/#portfolio", label: "Portfólio" },
  { href: "/#duvidas", label: "Dúvidas" },
];

// "escuro": a página começa com fundo escuro (home); o topo fica claro até a pessoa rolar.
export function Header({ escuro = false }: { escuro?: boolean }) {
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);
  const sobreEscuro = escuro && !rolou && !aberto;

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        rolou || aberto ? "border-b border-line bg-bg/85 backdrop-blur-md" : "border-b border-transparent"
      } ${sobreEscuro ? "text-white" : ""
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10 xl:px-16">
        <Link href="/" aria-label={`${config.marca}, página inicial`}>
          <Logo claro={sobreEscuro} />
        </Link>

        <nav aria-label="Seções" className={`hidden items-center gap-7 text-[15px] lg:flex ${sobreEscuro ? "text-white/70" : "text-ink-soft"}`}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`transition ${sobreEscuro ? "hover:text-white" : "hover:text-ink"}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <Botao mensagem="Oi! Vim pelo seu site e quero um orçamento." className="!min-h-10 !px-5 !py-2 text-sm">
              <WhatsAppIcon className="size-4" /> Pedir orçamento
            </Botao>
          </span>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            className={`grid size-11 place-items-center rounded-full border lg:hidden ${sobreEscuro ? "border-white/20 bg-white/5" : "border-line bg-card"}`}
          >
            {aberto ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aberto && (
          <motion.nav
            aria-label="Seções"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line lg:hidden"
          >
            <div className="mx-auto flex max-w-[1440px] flex-col px-5 md:px-10 xl:px-16 py-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setAberto(false)}
                  className="border-b border-line py-3.5 text-lg font-medium last:border-0"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
