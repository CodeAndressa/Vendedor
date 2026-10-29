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
  return m ? { title: `Modelo ${m.nome} · ${m.segmento}` } : {};
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
