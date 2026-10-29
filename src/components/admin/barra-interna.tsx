import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

// Barra do topo das telas internas (robô e gerador de propostas): volta para a Central e troca de tela.
const telas = [
  { id: "central", nome: "Central", href: "/admin" },
  { id: "robo", nome: "Robô de prospecção", href: "/prospectar" },
  { id: "proposta", nome: "Gerar proposta", href: "/proposta/nova" },
] as const;

export function BarraInterna({ atual }: { atual: (typeof telas)[number]["id"] }) {
  return (
    <nav aria-label="Telas internas" className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-5 py-3">
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold transition hover:border-brand hover:text-brand"
        >
          <ArrowLeft className="size-4" aria-hidden /> Voltar para a Central
        </Link>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {telas
            .filter((t) => t.id !== "central")
            .map((t) => (
              <Link
                key={t.id}
                href={t.href}
                aria-current={t.id === atual ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium text-ink-soft transition hover:text-ink aria-[current=page]:bg-forest aria-[current=page]:text-white"
              >
                {t.nome}
              </Link>
            ))}
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            Ver site <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </nav>
  );
}
