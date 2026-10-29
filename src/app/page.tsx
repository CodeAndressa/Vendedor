import type { Metadata } from "next";
import { Calculadora } from "@/components/calculadora";
import { JsonLd, dadosFaq, dadosNegocio } from "@/components/json-ld";
import { Diagnostico } from "@/components/diagnostico";
import { Duvidas } from "@/components/faq";
import { ChamadaFinal, ContatoFixo, Rodape } from "@/components/final";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { PlanosMensais } from "@/components/planos-mensais";
import { Miniatura } from "@/components/modelo/miniatura";
import { SiteModelo } from "@/components/modelo/site-modelo";
import { Vitrine } from "@/components/modelo/vitrine";
import { Depoimentos, Portfolio, Sobre } from "@/components/prova";
import { BuscaIA, ComoFunciona, Garantia, Incluso, PorQue, Seguranca } from "@/components/secoes";
import { Assistente } from "@/components/assistente";
import { Abertura } from "@/components/abertura";
import { Efeitos } from "@/components/efeitos";
import { modelos } from "@/lib/modelos";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  const vitrine = modelos.slice(0, 6).map((m) => ({
    modelo: m,
    previa: (
      <Miniatura>
        <SiteModelo modelo={m} apenasHero />
      </Miniatura>
    ),
  }));

  return (
    <>
      <JsonLd dados={dadosNegocio()} />
      <JsonLd dados={dadosFaq()} />
      <Abertura />
      <Efeitos />
      <Header escuro />
      <main>
        <Hero />
        <BuscaIA />
        <PorQue />
        <Diagnostico />
        <Incluso />
        <Vitrine itens={vitrine} total={modelos.length} />
        <ComoFunciona />
        <Seguranca />
        <Garantia />
        <Calculadora />
        <PlanosMensais />
        <Portfolio />
        <Depoimentos />
        <Sobre />
        <Duvidas />
        <ChamadaFinal />
      </main>
      <Rodape />
      <ContatoFixo />
      <Assistente />
    </>
  );
}
