"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { config, linkWhatsApp } from "@/lib/config";
import { Dock } from "./dock";
import { Logo } from "./logo";
import { Botao, WhatsAppIcon } from "./ui";

// Topo enxuto (logo, análise de IA e WhatsApp). A navegação fica no menu flutuante (Dock), embaixo.
// "escuro": a página começa com fundo escuro (home); o topo fica claro até a pessoa rolar.
export function Header({ escuro = false }: { escuro?: boolean }) {
  const [rolou, setRolou] = useState(false);
  const sobreEscuro = escuro && !rolou;

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          rolou ? "border-b border-line bg-bg/85 backdrop-blur-md" : "border-b border-transparent"
        } ${sobreEscuro ? "text-white" : ""}`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10 xl:px-16">
          <Link href="/" aria-label={`${config.marca}, página inicial`} className="inline-flex min-h-11 items-center">
            <Logo claro={sobreEscuro} digitar />
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/analise-ia"
              data-escuro={sobreEscuro}
              className="brilho hidden items-center gap-1.5 rounded-full border border-lime/50 bg-lime/15 px-3.5 py-2 text-sm font-semibold text-[#7A5E2A] transition hover:bg-lime/25 data-[escuro=true]:text-lime md:inline-flex"
            >
              <Sparkles className="size-3.5" aria-hidden /> Como a IA te vê?
            </Link>
            <span className="hidden sm:block">
              <Botao mensagem="Oi! Vim pelo seu site e quero um orçamento para o meu negócio." className="!min-h-11 !px-5 !py-2 text-sm">
                <WhatsAppIcon className="size-4" /> Pedir orçamento
              </Botao>
            </span>
            <a
              href={linkWhatsApp("Oi! Vim pelo seu site e quero um orçamento para o meu negócio.")}
              target="_blank"
              rel="noopener"
              aria-label="Pedir orçamento no WhatsApp (abre em nova aba)"
              title="Pedir orçamento no WhatsApp"
              className="grid size-11 place-items-center rounded-full bg-brand text-white sm:hidden"
            >
              <WhatsAppIcon className="size-5" />
            </a>
          </div>
        </div>
      </header>
      <Dock />
    </>
  );
}
