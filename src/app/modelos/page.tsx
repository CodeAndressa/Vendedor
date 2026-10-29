import type { Metadata } from "next";
import { ChamadaFinal, ContatoFixo, Rodape } from "@/components/final";
import { Header } from "@/components/header";
import { Galeria } from "@/components/modelo/galeria";
import { Miniatura } from "@/components/modelo/miniatura";
import { SiteModelo } from "@/components/modelo/site-modelo";
import { Eyebrow } from "@/components/ui";
import { Efeitos } from "@/components/efeitos";
import { modelos } from "@/lib/modelos";

export const metadata: Metadata = {
  title: "Modelos de sites prontos para o seu negócio",
  description: "Escolha um modelo de site ou landing page e eu adapto para o seu negócio em até 7 dias, a partir de R$ 997.",
};

export default function PaginaModelos() {
  const previas = Object.fromEntries(
    modelos.map((m) => [
      m.slug,
      <Miniatura key={m.slug}>
        <SiteModelo modelo={m} apenasHero />
      </Miniatura>,
    ]),
  );

  return (
    <>
      <Efeitos />
      <Header />
      <main className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16 pt-10 pb-10 md:pt-16">
        <Eyebrow>Modelos prontos</Eyebrow>
        <h1 className="max-w-3xl font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-[1] tracking-[-0.03em] text-balance">
          Escolha um modelo. <span className="text-brand">Eu deixo com a cara do seu negócio.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-soft">
          Navegue pelos modelos, abra a versão ao vivo e escolha o seu ponto de partida. Cores, textos, fotos e seções
          são adaptados para você.
        </p>
        <div className="mt-10">
          <Galeria previas={previas} />
        </div>
      </main>
      <ChamadaFinal />
      <Rodape />
      <ContatoFixo />
    </>
  );
}
