import type { Metadata } from "next";
import { Suspense } from "react";
import { GeradorProposta } from "@/components/proposta/gerador";

export const metadata: Metadata = {
  title: "Gerar proposta",
  robots: { index: false, follow: false },
};

export default function PaginaNovaProposta() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-4xl tracking-tight">Gerar proposta</h1>
      <p className="mt-2 text-ink-soft">
        Sem textão: o cliente vê o negócio dele hoje do lado do site novo, no próprio celular. O link é assinado; se
        alguém mudar valores, aparece como não verificado.
      </p>
      <Suspense fallback={<div className="mt-10 h-96 animate-pulse rounded-3xl bg-bg-alt" />}>
        <GeradorProposta />
      </Suspense>
    </main>
  );
}
