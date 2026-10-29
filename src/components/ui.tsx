import type { ReactNode } from "react";
import { linkWhatsApp } from "@/lib/config";

export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43zm8.03-17.47A11.3 11.3 0 0 0 12.05.7C5.79.7.7 5.79.7 12.04c0 2 .52 3.95 1.52 5.67L.6 23.3l5.73-1.5a11.3 11.3 0 0 0 5.72 1.46h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02z" />
    </svg>
  );
}

const variantes = {
  primario:
    "bg-brand text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_14px_30px_-14px_rgba(23,120,74,0.75)] hover:bg-brand-dark",
  lima: "bg-lime text-forest shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:bg-[#E6D3A6]",
  contorno: "border border-ink/15 text-ink hover:border-ink/50 bg-card/60 backdrop-blur",
  claro: "border border-white/20 text-white hover:border-white/60 bg-white/[0.03]",
} as const;

type BotaoProps = {
  children: ReactNode;
  variante?: keyof typeof variantes;
  className?: string;
} & ({ mensagem: string; href?: never } | { href: string; mensagem?: never });

// Botão-link. Com `mensagem`, abre o WhatsApp com o texto pronto.
export function Botao({ children, variante = "primario", className = "", mensagem, href }: BotaoProps) {
  const externo = mensagem !== undefined;
  return (
    <a
      href={externo ? linkWhatsApp(mensagem) : href}
      {...(externo ? { target: "_blank", rel: "noopener" } : {})}
      className={`inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 py-3 text-[15px] font-medium tracking-[-0.005em] transition duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${variantes[variante]} ${className}`}
    >
      {children}
    </a>
  );
}

export function Eyebrow({ children, claro = false }: { children: ReactNode; claro?: boolean }) {
  return (
    <span
      className={`mb-5 inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.22em] uppercase ${claro ? "text-lime" : "text-brand"}`}
    >
      <span className={`h-px w-8 ${claro ? "bg-lime/60" : "bg-brand/50"}`} />
      {children}
    </span>
  );
}

export function Titulo({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`font-display text-[clamp(2.1rem,3.8vw,4rem)] leading-[1.04] tracking-[-0.03em] text-balance [&_em]:text-brand ${className}`}
    >
      {children}
    </h2>
  );
}
