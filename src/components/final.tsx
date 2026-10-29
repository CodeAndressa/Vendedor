"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { config, linkWhatsApp } from "@/lib/config";
import { nichos } from "@/lib/nichos";
import { Reveal } from "./reveal";
import { Logo } from "./logo";
import { Botao, Titulo, WhatsAppIcon } from "./ui";

export function ChamadaFinal() {
  return (
    <section className="px-5 py-20 md:py-28">
      <Reveal>
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[32px] bg-forest px-6 py-20 text-center text-white ring-1 ring-black/5 md:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-brand)_0%,transparent_65%)] opacity-60"
          />
          <div className="relative">
            <Titulo className="mx-auto max-w-3xl">
              Daqui a 7 dias seu negócio pode estar <em className="!text-lime">no Google.</em>
            </Titulo>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">
              Me chama no WhatsApp, me conta sobre o seu negócio e em 48 horas você vê a primeira versão.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Botao mensagem="Oi! Quero começar meu site." variante="lima">
                <WhatsAppIcon /> Chamar no WhatsApp
              </Botao>
              <Botao href="/analise-ia" variante="claro">
                Ver como a IA me enxerga
              </Botao>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const colunas = [
  {
    titulo: "Navegar",
    links: [
      { href: "/modelos", label: "Modelos prontos" },
      { href: "/#diagnostico", label: "Diagnóstico grátis" },
      { href: "/#orcamento", label: "Planos e preços" },
      { href: "/#portfolio", label: "Portfólio" },
      { href: "/#duvidas", label: "Dúvidas" },
    ],
  },
  {
    titulo: "Serviços",
    links: [
      { href: "/#orcamento", label: "Site institucional" },
      { href: "/#orcamento", label: "Landing page" },
      { href: "/#orcamento", label: "Blog" },
      { href: "/#orcamento", label: "Loja e sistemas" },
    ],
  },
];

export function Rodape() {
  return (
    <footer className="overflow-hidden bg-forest pt-16 pb-28 text-white md:pb-10">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-10 xl:px-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo claro />
          <p className="mt-3 max-w-xs text-white/60">
            Sites e landing pages para pequenos negócios, no ar em 7 dias.
          </p>
        </div>
        {colunas.map((c) => (
          <nav key={c.titulo} aria-label={c.titulo}>
            <div className="text-xs font-semibold tracking-[0.14em] text-lime uppercase">{c.titulo}</div>
            <ul className="mt-4 grid gap-2.5 text-white/75">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <div className="text-xs font-semibold tracking-[0.14em] text-lime uppercase">Contato</div>
          <ul className="mt-4 grid gap-2.5 text-white/75">
            <li>
              <a href={linkWhatsApp("Oi! Vim pelo seu site.")} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-white">
                <WhatsAppIcon className="size-4" /> {config.whatsappVisivel}
              </a>
            </li>
            {config.email && (
              <li>
                <a href={`mailto:${config.email}`} className="hover:text-white">
                  {config.email}
                </a>
              </li>
            )}
            {config.instagram && (
              <li>
                <a href={config.instagram} target="_blank" rel="noopener" className="hover:text-white">
                  Instagram
                </a>
              </li>
            )}
            <li className="text-white/50">{config.cidade}</li>
          </ul>
        </div>
      </div>

      <nav aria-label="Sites por segmento" className="mx-auto mt-12 max-w-[1440px] px-5 md:px-10 xl:px-16 text-sm text-white/50">
        <span className="mr-2 font-semibold text-white/70">Sites para:</span>
        {nichos.map((n, i) => (
          <span key={n.slug}>
            <Link href={`/para/${n.slug}`} className="hover:text-white">
              {n.nome}
            </Link>
            {i < nichos.length - 1 && " · "}
          </span>
        ))}
      </nav>

      {/* nome gigante no rodapé, cortado na base */}
      <div
        aria-hidden
        className="mx-auto mt-16 max-w-[1440px] px-5 md:px-10 xl:px-16 font-display text-[18vw] leading-[0.8] tracking-[-0.05em] whitespace-nowrap text-white/[0.06] select-none md:text-[11.5rem]"
      >
        {config.marca.split(" ")[0]}
      </div>
      <div className="mx-auto mt-6 flex max-w-[1440px] flex-wrap justify-between gap-3 border-t border-white/10 px-5 md:px-10 xl:px-16 pt-6 text-sm text-white/50">
        <span>© {config.marca}</span>
        <span>Feito com cuidado em {config.cidade.split(",")[0]}</span>
      </div>
    </footer>
  );
}

// Botão flutuante no desktop e barra fixa no celular, que aparecem depois do topo.
export function ContatoFixo() {
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const href = linkWhatsApp("Oi! Vim pelo seu site.");
  return (
    <AnimatePresence>
      {visivel && (
        <>
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 p-3 backdrop-blur-md md:hidden"
          >
            <a
              href={href}
              target="_blank"
              rel="noopener"
              className="flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-brand font-semibold text-white"
            >
              <WhatsAppIcon /> Quero meu site por R$ 997
            </a>
          </motion.div>
          <motion.a
            href={href}
            target="_blank"
            rel="noopener"
            aria-label="Falar no WhatsApp"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            className="fixed right-6 bottom-24 z-40 hidden size-14 place-items-center rounded-full bg-wa text-white shadow-[0_14px_30px_-10px_rgba(37,211,102,0.8)] md:grid"
          >
            <WhatsAppIcon className="size-8" />
          </motion.a>
        </>
      )}
    </AnimatePresence>
  );
}
