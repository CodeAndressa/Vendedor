import { config } from "@/lib/config";

// Marca: "soares" em minúsculas, bem fechado, em verde, com um cursor dourado piscando no fim
// (o site sendo digitado). O ícone da aba (src/app/icon.svg) é o "a" com o mesmo cursor.
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

// "claro" para usar sobre fundo escuro.
export function Logo({ claro = false, className = "" }: { claro?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center font-sans text-[27px] leading-none font-black tracking-[-0.06em] whitespace-nowrap lowercase ${
        claro ? "text-[#3FC47E]" : "text-[#0A4A2B]"
      } ${className}`}
    >
      <span className="sr-only">{config.marca}</span>
      <span aria-hidden>{config.logo}</span>
      <span aria-hidden className="cursor-piscando ml-[3px] inline-block h-[0.95em] w-[3px] translate-y-[0.04em] rounded-full bg-lime" />
    </span>
  );
}
