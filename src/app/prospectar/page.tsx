import type { Metadata } from "next";
import { BarraInterna } from "@/components/admin/barra-interna";
import { Prospector } from "@/components/admin/prospector";

export const metadata: Metadata = {
  title: "Robô de prospecção",
  robots: { index: false, follow: false },
};

export default function PaginaProspectar() {
  return (
    <>
      <BarraInterna atual="robo" />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="font-display text-4xl tracking-tight">
          Robô de prospecção
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Procura no mapa negócios sem site, confere se estão funcionando e se o
          telefone é da mesma região, e ordena do mais promissor para o menos.
          As melhores oportunidades ficam no topo.
        </p>
        <Prospector />
      </main>
    </>
  );
}
