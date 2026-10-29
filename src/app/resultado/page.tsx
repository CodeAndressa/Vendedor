import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle, Heart, Smartphone, Star } from "lucide-react";
import QRCode from "qrcode";
import { ContarVisualizacao } from "@/components/proposta/acoes";
import { Comparativo, ComparativoCarregando } from "@/components/proposta/comparativo";
import { config, linkWhatsApp, siteUrl } from "@/lib/config";
import { decodificar } from "@/lib/proposta";
import { assinaturaConfere } from "@/lib/servidor";

export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Antes e depois do seu site",
  robots: { index: false, follow: false },
};

export default function PaginaResultado(props: PageProps<"/resultado">) {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-ink-soft">Carregando…</div>}>
      <Conteudo searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/resultado">["searchParams"] }) {
  const sp = await searchParams;
  const codigo = typeof sp.p === "string" ? sp.p : "";
  const assinatura = typeof sp.a === "string" ? sp.a : "";
  const dados = codigo ? decodificar(codigo) : null;
  if (!dados?.entregue) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="font-display text-3xl">Link incompleto</h1>
          <Link href="/" className="mt-4 inline-block font-semibold text-brand">
            Ir para o site
          </Link>
        </div>
      </main>
    );
  }
  const verificada = assinaturaConfere(codigo, assinatura);
  const link = `${siteUrl}/resultado?p=${codigo}&a=${assinatura}`;
  const qr = await QRCode.toString(link, { type: "svg", margin: 1, color: { dark: "#0A2A1C", light: "#FFFFFF" } });
  const nome = dados.negocio || "seu negócio";
  const primeiroNome = dados.cliente.split(" ")[0];
  const indicar = `Olha o site novo da ${nome}: ${dados.entregue}\n\nQuem fez foi a ${config.nome.split(" ")[0]}: ${siteUrl}`;

  return (
    <main className="min-h-screen bg-bg pb-24">
      <ContarVisualizacao p={codigo} a={assinatura} />
      <header className="bg-forest text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link href="/" className="font-display text-lg">
            {config.marca}
            <span className="text-lime">.</span>
          </Link>
          <span className="text-sm text-white/60">Entrega</span>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-5">
        {!verificada && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="size-5 shrink-0" /> Este link foi alterado e não pôde ser confirmado.
          </div>
        )}
        <h1 className="pt-12 pb-8 font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.02] tracking-[-0.03em] text-balance">
          {primeiroNome ? `${primeiroNome}, ` : ""}o site da <span className="text-brand">{nome}</span> está no ar.
        </h1>

        <div className="grid gap-5 lg:grid-cols-[1fr_200px] lg:items-start">
          <Suspense fallback={<ComparativoCarregando />}>
            <Comparativo proposta={dados} depois={dados.entregue} />
          </Suspense>
          <aside className="hidden rounded-3xl border border-line bg-card p-5 text-center lg:block">
            <Smartphone className="mx-auto size-6 text-brand" />
            <p className="mt-2 text-sm font-semibold">Veja no seu celular</p>
            <div className="mx-auto mt-3 w-36" dangerouslySetInnerHTML={{ __html: qr }} />
          </aside>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <a href={dados.entregue} target="_blank" rel="noopener" className="flex min-h-14 items-center justify-center rounded-full bg-forest font-semibold text-white">
            Abrir o site novo
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(indicar)}`} target="_blank" rel="noopener" className="flex min-h-14 items-center justify-center gap-2 rounded-full border-[1.5px] border-line font-semibold">
            <Heart className="size-5 text-brand" /> Mostrar para um amigo
          </a>
        </div>

        <section className="mt-5 grid gap-4 rounded-3xl border border-line bg-card p-7 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="font-display text-xl">Gostou do resultado?</h2>
            <p className="mt-1 text-ink-soft">Uma avaliação sua me ajuda muito a encontrar outros negócios como o seu.</p>
          </div>
          <a
            href={linkWhatsApp(`Oi! Sou ${dados.cliente || nome}. Adorei o site e quero deixar um depoimento:`)}
            target="_blank"
            rel="noopener"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 font-semibold text-white"
          >
            <Star className="size-4 fill-current" /> Deixar depoimento
          </a>
        </section>

        <section className="mt-5 rounded-3xl bg-forest p-7 text-white">
          <h2 className="font-display text-xl">Próximo passo: trazer mais clientes</h2>
          <p className="mt-2 text-white/70">
            Com um plano mensal eu cuido do site, do seu perfil no Google e dos anúncios, e te mando um relatório todo mês.
          </p>
          <Link href="/#mensal" className="mt-4 inline-flex min-h-12 items-center rounded-full bg-lime px-6 font-semibold text-forest">
            Ver planos mensais
          </Link>
        </section>
      </div>
    </main>
  );
}
