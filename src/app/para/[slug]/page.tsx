import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { ChamadaFinal, ContatoFixo, Rodape } from "@/components/final";
import { Header } from "@/components/header";
import { JsonLd, dadosFaq } from "@/components/json-ld";
import { Miniatura } from "@/components/modelo/miniatura";
import { SiteModelo } from "@/components/modelo/site-modelo";
import { Botao, Eyebrow, Titulo, WhatsAppIcon } from "@/components/ui";
import { precos, prazos, reais } from "@/lib/config";
import { modeloPorSlug } from "@/lib/modelos";
import { Assistente } from "@/components/assistente";
import { nichoPorSlug, nichos } from "@/lib/nichos";

export function generateStaticParams() {
  return nichos.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps<"/para/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const n = nichoPorSlug(slug);
  if (!n) return {};
  const titulo = `Site para ${n.nome} em ${prazos.noAr} · a partir de ${reais(precos.site)}`;
  return {
    title: titulo,
    description: `${n.dor} Site profissional para ${n.singular}, no ar em até ${prazos.noAr}, com domínio incluso.`,
    alternates: { canonical: `/para/${n.slug}` },
    openGraph: { title: titulo },
  };
}

export default async function PaginaNicho({ params }: PageProps<"/para/[slug]">) {
  const { slug } = await params;
  const n = nichoPorSlug(slug);
  if (!n) notFound();
  const modelo = modeloPorSlug(n.modelo);
  const mensagem = `Oi! Quero um site para ${n.singular}. Vi sua página de ${n.nome}.`;

  return (
    <>
      <JsonLd dados={dadosFaq(n.perguntas)} />
      <Header />
      <main>
        <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 md:px-10 xl:px-16 pt-10 pb-20 md:pt-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Eyebrow>Site para {n.nome}</Eyebrow>
            <h1 className="font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[1] tracking-[-0.03em] text-balance">
              Site profissional para {n.singular} <span className="text-brand">no ar em {prazos.noAr}.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">{n.dor}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Botao mensagem={mensagem}>
                <WhatsAppIcon /> Quero meu site
              </Botao>
              <Botao href="/#diagnostico" variante="contorno">
                Receber proposta em 30s
              </Botao>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-ink-soft">
              {[`A partir de ${reais(precos.site)}`, "Domínio .com.br incluso", "Primeira versão em 48h"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-brand" strokeWidth={3} /> {t}
                </li>
              ))}
            </ul>
          </div>
          {modelo && (
            <Link href={`/modelos/${modelo.slug}`} className="group block overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_30px_60px_-40px_rgba(10,42,28,0.5)]">
              <div className="transition duration-500 group-hover:scale-[1.02]">
                <Miniatura>
                  <SiteModelo modelo={modelo} apenasHero />
                </Miniatura>
              </div>
              <div className="flex items-center justify-between border-t border-line p-4 text-sm">
                <span>
                  Exemplo: <strong>modelo {modelo.nome}</strong>
                </span>
                <span className="font-semibold text-brand">Ver ao vivo →</span>
              </div>
            </Link>
          )}
        </section>

        <section className="bg-bg-alt py-20">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
            <Titulo className="max-w-2xl">O que o site faz por {n.singular}</Titulo>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {n.beneficios.map((b) => (
                <div key={b.titulo} className="rounded-3xl border border-line bg-card p-7">
                  <h2 className="font-display text-xl">{b.titulo}</h2>
                  <p className="mt-2 text-ink-soft">{b.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-10 px-5 md:px-10 xl:px-16 py-20 lg:grid-cols-2">
          <div>
            <Titulo>Quanto custa</Titulo>
            <p className="mt-4 text-lg text-ink-soft">
              {reais(precos.site)} com até 5 páginas (ou landing page), textos, domínio e hospedagem do primeiro ano.
              Metade para começar, metade quando estiver no ar.
            </p>
            <Link href="/#orcamento" className="mt-5 inline-block font-semibold text-brand">
              Ver planos e extras →
            </Link>
          </div>
          <div className="grid gap-3">
            {n.perguntas.map((p) => (
              <div key={p.pergunta} className="rounded-2xl border border-line bg-card p-6">
                <h2 className="font-semibold">{p.pergunta}</h2>
                <p className="mt-2 text-ink-soft">{p.resposta}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
          <h2 className="text-sm font-semibold tracking-wider text-ink-soft uppercase">Também faço sites para</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {nichos
              .filter((o) => o.slug !== n.slug)
              .map((o) => (
                <Link key={o.slug} href={`/para/${o.slug}`} className="rounded-full border border-line bg-card px-4 py-2 text-sm hover:border-ink">
                  {o.nome}
                </Link>
              ))}
          </div>
        </section>
        <ChamadaFinal />
      </main>
      <Rodape />
      <ContatoFixo />
      <Assistente />
    </>
  );
}
