import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, CalendarClock, Check, ShieldCheck, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { AcoesProposta, ContarVisualizacao } from "@/components/proposta/acoes";
import { Comparativo, ComparativoCarregando } from "@/components/proposta/comparativo";
import { Miniatura } from "@/components/modelo/miniatura";
import { SiteModelo } from "@/components/modelo/site-modelo";
import { bases, extras, metades, parcelaAssinatura, total } from "@/lib/catalogo";
import { assinaturaSite, config, precos, reais, siteUrl } from "@/lib/config";
import { modeloPorSlug } from "@/lib/modelos";
import { decodificar, formatarData, hoje } from "@/lib/proposta";
import { Logo } from "@/components/logo";
import { assinaturaConfere } from "@/lib/servidor";

// a medição do site atual pode levar alguns segundos na primeira abertura
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Sua proposta",
  robots: { index: false, follow: false },
};

export default function PaginaProposta(props: PageProps<"/proposta">) {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-ink-soft">Carregando sua proposta…</div>}>
      <Conteudo searchParams={props.searchParams} />
    </Suspense>
  );
}

const incluso = [
  "Design feito para celular e computador",
  "Textos escritos a partir da nossa conversa",
  "Botão de WhatsApp em todas as páginas",
  "Domínio .com.br registrado no seu nome",
  "Hospedagem do primeiro ano",
  "Cadeado de segurança (HTTPS) e configuração básica para o Google",
  "Ajustes pequenos por 30 dias depois de publicar",
];

async function Conteudo({ searchParams }: { searchParams: PageProps<"/proposta">["searchParams"] }) {
  const sp = await searchParams;
  const codigo = typeof sp.p === "string" ? sp.p : "";
  const assinatura = typeof sp.a === "string" ? sp.a : "";
  const proposta = codigo ? decodificar(codigo) : null;

  if (!proposta) {
    return (
      <main className="mx-auto grid min-h-screen max-w-lg place-items-center px-5 text-center">
        <div>
          <h1 className="font-display text-3xl">Proposta não encontrada</h1>
          <p className="mt-3 text-ink-soft">O link pode estar incompleto. Me chama no WhatsApp que eu te mando de novo.</p>
          <Link href="/" className="mt-6 inline-block font-semibold text-brand">
            Ir para o site
          </Link>
        </div>
      </main>
    );
  }

  const verificada = assinaturaConfere(codigo, assinatura);
  const vencida = proposta.validade < hoje();
  const modelo = proposta.modelo ? modeloPorSlug(proposta.modelo) : undefined;
  const valorTotal = total(proposta.extras, proposta.desconto);
  const subtotal = total(proposta.extras);
  const [entrada, saldo] = metades(valorTotal);
  const primeiroNome = proposta.cliente.split(" ")[0];
  const link = `${siteUrl}/proposta?p=${codigo}&a=${assinatura}`;
  const qr = await QRCode.toString(link, { type: "svg", margin: 1, color: { dark: "#0A2A1C", light: "#FFFFFF" } });

  return (
    <main className="min-h-screen bg-bg pb-24 print:bg-white print:pb-0">
      <ContarVisualizacao p={codigo} a={assinatura} />
      <header className="border-b border-line bg-forest text-white print:border-0 print:bg-white print:text-ink">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/" aria-label={config.marca}>
            <Logo claro />
          </Link>
          <span className="text-sm text-white/60 print:text-ink-soft">Proposta comercial</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5">
        {!verificada && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="size-5 shrink-0" />
            Este link foi alterado e não pôde ser confirmado. Os valores abaixo podem não ser os combinados. Peça o link
            original no WhatsApp.
          </div>
        )}
        {verificada && vencida && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <CalendarClock className="size-5 shrink-0" />
            Esta proposta venceu em {formatarData(proposta.validade)}. Me chama no WhatsApp que eu confirmo se os valores
            continuam os mesmos.
          </div>
        )}

        <section className="pt-12 pb-10">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {verificada && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand">
                <BadgeCheck className="size-4" /> Proposta verificada
              </span>
            )}
            <span className="text-ink-soft">
              Emitida em {formatarData(proposta.emitida)} · válida até {formatarData(proposta.validade)}
            </span>
          </div>
          <h1 className="mt-5 font-display text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.02] tracking-[-0.03em] text-balance">
            {primeiroNome ? `${primeiroNome}, aqui está o plano para ` : "Aqui está o plano para "}
            <span className="text-brand">{proposta.negocio || "o seu negócio"}</span> estar no ar em 7 dias.
          </h1>
          {proposta.objetivo && (
            <p className="mt-5 max-w-2xl text-lg text-ink-soft">
              Seu objetivo: <strong className="text-ink">{proposta.objetivo}</strong>. Tudo abaixo foi pensado para isso.
            </p>
          )}
        </section>

        <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_200px] lg:items-start">
          <Suspense fallback={<ComparativoCarregando />}>
            <Comparativo proposta={proposta} />
          </Suspense>
          {/* no computador, um QR para abrir no celular: é lá que o cliente dele vai ver o site */}
          <aside className="hidden rounded-3xl border border-line bg-card p-5 text-center lg:block print:hidden">
            <Smartphone className="mx-auto size-6 text-brand" />
            <p className="mt-2 text-sm font-semibold">Abra no seu celular</p>
            <div className="mx-auto mt-3 w-36" dangerouslySetInnerHTML={{ __html: qr }} />
            <p className="mt-3 text-xs text-ink-soft">É no celular que seus clientes vão ver o site todo dia.</p>
          </aside>
        </div>

        <section className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-line bg-card p-7 print:break-inside-avoid">
            <h2 className="font-display text-2xl">O que você vai receber</h2>
            <ul className="mt-5 grid gap-3">
              <li className="flex justify-between gap-4 border-b border-line pb-3">
                <span className="font-semibold">{bases[proposta.base].titulo}</span>
                <span className="font-semibold whitespace-nowrap">{reais(precos.site)}</span>
              </li>
              {proposta.extras.map((id) => (
                <li key={id} className="flex justify-between gap-4 border-b border-line pb-3">
                  <span className="font-semibold">{extras[id].titulo}</span>
                  <span className="font-semibold whitespace-nowrap">+ {reais(extras[id].valor)}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-6 grid gap-2.5 text-[15px] text-ink-soft">
              {incluso.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={3} /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between rounded-3xl bg-forest p-7 text-white print:border print:border-line print:bg-white print:text-ink">
            <div>
              <div className="text-sm text-white/60 print:text-ink-soft">Investimento</div>
              {proposta.desconto > 0 && (
                <div className="mt-2 text-sm text-white/60 line-through print:text-ink-soft">{reais(subtotal)}</div>
              )}
              <div className="font-display text-5xl tracking-tight">{reais(valorTotal)}</div>
              {proposta.desconto > 0 && (
                <div className="mt-2 inline-flex rounded-full bg-lime px-3 py-1 text-xs font-bold text-forest">
                  Desconto de {reais(proposta.desconto)}
                </div>
              )}
              <div className="mt-6 grid gap-2 rounded-2xl bg-white/5 p-4 text-sm print:bg-bg-alt">
                <div className="flex justify-between">
                  <span className="text-white/70 print:text-ink-soft">Para começar</span>
                  <strong>{reais(entrada)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70 print:text-ink-soft">Quando estiver no ar</span>
                  <strong>{reais(saldo)}</strong>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/60 print:text-ink-soft">
                Pix, cartão ou boleto. Ou, se preferir, {assinaturaSite.parcelas}x de {reais(parcelaAssinatura(valorTotal))} sem entrada.
              </p>
            </div>
          </div>
        </section>

        {modelo && (
          <section className="mt-5 grid items-center gap-6 rounded-3xl border border-line bg-card p-5 md:grid-cols-[1.1fr_0.9fr] print:break-inside-avoid">
            <div className="overflow-hidden rounded-2xl border border-line">
              <Miniatura>
                <SiteModelo modelo={modelo} apenasHero />
              </Miniatura>
            </div>
            <div className="p-2">
              <div className="text-xs font-semibold tracking-wider text-brand uppercase">Ponto de partida</div>
              <h2 className="mt-1 font-display text-2xl">Modelo {modelo.nome}</h2>
              <p className="mt-2 text-ink-soft">
                Vamos usar o modelo {modelo.nome} como base e adaptar cores, textos e fotos para a sua marca.
              </p>
              <Link href={`/modelos/${modelo.slug}`} className="mt-4 inline-block font-semibold text-brand print:hidden">
                Ver o modelo ao vivo →
              </Link>
            </div>
          </section>
        )}

        <section className="mt-5 rounded-3xl border border-line bg-card p-7 print:break-inside-avoid">
          <h2 className="font-display text-2xl">Como vai ser</h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-4">
            {[
              ["Dia 1", "Você aprova e paga a primeira metade. Eu recebo seus textos, fotos e logo."],
              ["Até 48h", "Te mando o link da primeira versão para ver no celular."],
              ["Dias 3 a 6", "Ajustes até ficar do seu jeito, domínio configurado."],
              ["Até 7 dias", "Site no ar. Você paga a segunda metade."],
            ].map(([quando, texto], i) => (
              <li key={quando}>
                <span className="grid size-9 place-items-center rounded-full bg-forest font-display text-lime print:bg-brand-soft print:text-brand">
                  {i + 1}
                </span>
                <div className="mt-3 text-xs font-semibold tracking-wider text-brand uppercase">{quando}</div>
                <p className="mt-1 text-[15px] text-ink-soft">{texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-5 flex gap-4 rounded-3xl border-2 border-dashed border-brand/40 bg-brand-soft p-7 print:break-inside-avoid">
          <ShieldCheck className="size-8 shrink-0 text-brand" />
          <div>
            <h2 className="font-display text-xl">Garantia</h2>
            <p className="mt-1 text-ink-soft">
              Se a primeira versão não te agradar, você não paga a segunda metade e fica com o que já viu.
            </p>
          </div>
        </section>

        {proposta.observacao && (
          <section className="mt-5 rounded-3xl border border-line bg-card p-7 print:break-inside-avoid">
            <h2 className="font-display text-xl">Observações</h2>
            <p className="mt-2 whitespace-pre-line text-ink-soft">{proposta.observacao}</p>
          </section>
        )}

        <AcoesProposta
          link={link}
          p={codigo}
          a={assinatura}
          podePagar={verificada && !vencida}
          cliente={proposta.cliente}
          negocio={proposta.negocio}
          total={reais(valorTotal)}
          entrada={reais(entrada)}
          parcela={reais(parcelaAssinatura(valorTotal))}
        />

        <p className="mt-10 text-center text-sm text-ink-soft">
          {config.nome} · WhatsApp {config.whatsappVisivel} · {config.cidade}
        </p>
      </div>
    </main>
  );
}
