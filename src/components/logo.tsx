"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";

// Marca: "soares" em minúsculas, em verde, com um cursor dourado piscando no fim (o site sendo digitado).
// Ao abrir o site, o nome é digitado letra por letra, uma vez por sessão. O ícone da aba
// (src/app/icon.svg) é o "a" com o mesmo cursor.
export function LogoSimbolo({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#0A4A2B" />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="1.5" />
      <text x="27" y="44" textAnchor="middle" fontFamily="var(--font-inter), Inter, sans-serif" fontWeight="900" fontSize="34" fill="#fff" letterSpacing="-2">
        a
      </text>
      <rect x="41" y="18" width="5" height="30" rx="2.5" fill="#D9C28E" className="cursor-piscando" />
    </svg>
  );
}

// "claro" para usar sobre fundo escuro; "digitar" anima a escrita do nome.
export function Logo({ claro = false, digitar = false, className = "" }: { claro?: boolean; digitar?: boolean; className?: string }) {
  const nome = config.logo;
  const [letras, setLetras] = useState(nome.length);

  useEffect(() => {
    if (!digitar || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("logo-digitada")) return;
      sessionStorage.setItem("logo-digitada", "1");
    } catch {
      return;
    }
    // espera a abertura terminar, se ela estiver na tela
    const atraso = document.documentElement.classList.contains("abrindo") ? 1900 : 250;
    const timers: ReturnType<typeof setTimeout>[] = [setTimeout(() => setLetras(0), 0)];
    for (let i = 1; i <= nome.length; i++) timers.push(setTimeout(() => setLetras(i), atraso + i * 95));
    return () => timers.forEach(clearTimeout);
  }, [digitar, nome]);

  return (
    <span
      className={`inline-flex items-center font-sans text-[27px] leading-none font-black tracking-[-0.06em] whitespace-nowrap lowercase ${
        claro ? "text-[#3FC47E]" : "text-[#0A4A2B]"
      } ${className}`}
    >
      <span className="sr-only">{config.marca}</span>
      {/* duas camadas na mesma célula: a invisível reserva a largura final, para o menu não pular enquanto digita */}
      <span aria-hidden className="inline-grid">
        <span className="invisible col-start-1 row-start-1 inline-flex items-center">
          {nome}
          <Cursor />
        </span>
        <span className="col-start-1 row-start-1 inline-flex items-center">
          {nome.slice(0, letras)}
          <Cursor />
        </span>
      </span>
    </span>
  );
}

function Cursor() {
  return <span className="cursor-piscando ml-[3px] inline-block h-[0.95em] w-[3px] translate-y-[0.04em] rounded-full bg-lime" />;
}
