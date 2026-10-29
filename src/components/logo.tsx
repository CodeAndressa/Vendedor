import { useId } from "react";
import { config } from "@/lib/config";

// Símbolo da marca: um "A" em forma de seta para cima (crescimento) com o ponto dourado no lugar do traço,
// o mesmo ponto que fecha o nome "Andressa Soares.". O arquivo do ícone da aba fica em src/app/icon.svg.
export function LogoSimbolo({ className = "size-9" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#17392A" />
          <stop offset="1" stopColor="#0B1D15" />
        </linearGradient>
        <linearGradient id={`${id}a`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2FBF71" />
          <stop offset="1" stopColor="#A6EBC3" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${id}f)`} />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="17.25" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="1.5" />
      <path d="M18 47 L32 15 L46 47" fill="none" stroke={`url(#${id}a)`} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="38" r="4.6" fill="#D9C28E" />
    </svg>
  );
}

// Símbolo + nome. "claro" para usar sobre fundo escuro.
export function Logo({ claro = false, className = "" }: { claro?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoSimbolo className="size-9 shrink-0" />
      <span className="font-display text-[22px] leading-none tracking-[-0.035em] whitespace-nowrap">
        {config.marca}
        <span className={claro ? "text-lime" : "text-brand"}>.</span>
      </span>
    </span>
  );
}
