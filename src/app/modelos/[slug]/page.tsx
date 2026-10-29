import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BarraModelo } from "@/components/modelo/barra-modelo";
import { SiteModelo } from "@/components/modelo/site-modelo";
import { modeloPorSlug, modelos } from "@/lib/modelos";

export function generateStaticParams() {
  return modelos.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/modelos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = modeloPorSlug(slug);
  if (!m) return {};
  return {
    title: `Modelo ${m.nome} · ${m.segmento}`,
    description: `Demonstração do modelo ${m.nome} (${m.tipo.toLowerCase()} para ${m.segmento.toLowerCase()}), com negócio fictício. Eu adapto cores, textos e seções ao seu negócio.`,
    alternates: { canonical: `/modelos/${m.slug}` },
    // demonstração com negócio inventado: não deve aparecer nas buscas como se fosse uma empresa real
    robots: { index: false, follow: true },
  };
}

export default async function PaginaModelo({ params }: PageProps<"/modelos/[slug]">) {
  const { slug } = await params;
  const modelo = modeloPorSlug(slug);
  if (!modelo) notFound();

  return (
    <>
      <BarraModelo slug={modelo.slug} />
      <SiteModelo modelo={modelo} />
    </>
  );
}
