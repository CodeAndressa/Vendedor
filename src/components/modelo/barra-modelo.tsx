"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { config, linkWhatsApp } from "@/lib/config";
import { modelos } from "@/lib/modelos";
import { useIlha } from "../ilha";
import { WhatsAppIcon } from "../ui";
import { mensagemModelo } from "./galeria";

// Barra fixa no topo da demonstração: deixa claro que é um modelo e leva de volta para a venda.
export function BarraModelo({ slug }: { slug: string }) {
  const { avisar } = useIlha();
  const i = modelos.findIndex((m) => m.slug === slug);
  const modelo = modelos[i];
  const anterior = modelos[(i - 1 + modelos.length) % modelos.length];
  const proximo = modelos[(i + 1) % modelos.length];

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-forest font-sans text-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4">
        <Link href="/modelos" className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white">
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Todos os modelos</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href={`/modelos/${anterior.slug}`} aria-label={`Modelo anterior: ${anterior.nome}`} className="grid size-9 place-items-center rounded-full hover:bg-white/10">
            <ChevronLeft className="size-5" />
          </Link>
          <div className="min-w-0 px-1 text-center leading-tight">
            <div className="font-display">Modelo {modelo.nome}</div>
            <div className="hidden text-xs text-white/60 sm:block">
              {modelo.segmento} · demonstração com negócio fictício
            </div>
          </div>
          <Link href={`/modelos/${proximo.slug}`} aria-label={`Próximo modelo: ${proximo.nome}`} className="grid size-9 place-items-center rounded-full hover:bg-white/10">
            <ChevronRight className="size-5" />
          </Link>
        </div>

        <a
          href={linkWhatsApp(mensagemModelo(modelo))}
          target="_blank"
          rel="noopener"
          onClick={() => avisar(`Modelo ${modelo.nome} escolhido`, `Falando com ${config.nome.split(" ")[0]} no WhatsApp`)}
          className="flex min-h-10 items-center gap-1.5 rounded-full bg-lime px-4 text-sm font-semibold text-forest transition hover:bg-white"
        >
          <WhatsAppIcon className="size-4" />
          <span className="hidden sm:inline">Quero este modelo</span>
          <span className="sm:hidden">Quero</span>
        </a>
      </div>
    </div>
  );
}
