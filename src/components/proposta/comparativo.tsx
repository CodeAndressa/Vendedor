import type { ReactNode } from "react";
import { Bookmark, MapPin, Navigation, Phone, Share2, Star } from "lucide-react";
import type { Proposta } from "@/lib/proposta";
import { modeloPorSlug } from "@/lib/modelos";
import { medirSite, type Medicao } from "@/lib/velocidade";
import { Miniatura } from "../modelo/miniatura";
import { SiteModelo } from "../modelo/site-modelo";

// "Hoje × como vai ficar", lado a lado em dois celulares.
// Dono de negócio local não lê textão: ele entende na hora quando vê o dele do lado do novo.

export function Celular({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px] rounded-[34px] bg-[#111] p-[7px] shadow-[0_30px_50px_-25px_rgba(0,0,0,0.6)] sm:rounded-[44px] sm:p-2.5">
      <div className="absolute top-2.5 left-1/2 z-10 h-3.5 w-16 -translate-x-1/2 rounded-full bg-[#111] sm:top-4 sm:h-5 sm:w-20" />
      <div className="relative aspect-[390/844] overflow-hidden rounded-[27px] bg-white sm:rounded-[34px]">{children}</div>
    </div>
  );
}

function corNota(nota: number) {
  if (nota >= 90) return "bg-brand text-white";
  if (nota >= 50) return "bg-amber-400 text-amber-950";
  return "bg-red-600 text-white";
}

export function SeloVelocidade({ m }: { m: Medicao }) {
  return (
    <div className="mt-3 grid gap-1 text-center">
      <span className={`mx-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold sm:text-sm ${corNota(m.nota)}`}>
        Velocidade {m.nota}/100
      </span>
      {m.tempo && <span className="text-xs text-ink-soft sm:text-sm">aparece em {m.tempo}</span>}
    </div>
  );
}

function TelaMaps({ maps }: { maps: NonNullable<Proposta["maps"]> }) {
  return (
    <div className="flex h-full flex-col bg-white text-[#202124]" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* mapa ilustrativo */}
      <div className="relative h-[34%] bg-[#e8eaed]">
        <div className="absolute inset-0 bg-[linear-gradient(#fff_2px,transparent_2px),linear-gradient(90deg,#fff_2px,transparent_2px)] bg-[size:38px_38px] opacity-80" />
        <div className="absolute top-[20%] left-[-10%] h-3 w-[120%] rotate-[-12deg] bg-[#fdd663]" />
        <MapPin className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-full fill-[#ea4335] text-[#a50e0e]" />
      </div>
      <div className="flex-1 overflow-hidden px-[5%] pt-[5%]">
        <div className="text-sm leading-tight font-bold sm:text-lg">{maps.nome}</div>
        {maps.nota && (
          <div className="mt-1 flex items-center gap-1 text-[11px] sm:text-xs">
            <span>{maps.nota.toLocaleString("pt-BR")}</span>
            <span className="flex text-[#fbbc04]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="size-2.5 fill-current sm:size-3" />
              ))}
            </span>
            {maps.avaliacoes && <span className="text-[#70757a]">({maps.avaliacoes})</span>}
          </div>
        )}
        {maps.categoria && <div className="mt-0.5 text-[11px] text-[#70757a] sm:text-xs">{maps.categoria}</div>}
        <div className="mt-2 rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-2 text-[10px] font-bold text-red-700 sm:text-xs">
          {maps.link ? `Link: ${new URL(maps.link).hostname.replace("www.", "")} (rede social)` : "Site: nenhum"}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1 border-b border-[#e8eaed] pb-3">
          {[
            [Navigation, "Rotas"],
            [Phone, "Ligar"],
            [Bookmark, "Salvar"],
            [Share2, "Enviar"],
          ].map(([I, t]) => {
            const Icone = I as typeof Navigation;
            return (
              <div key={t as string} className="grid justify-items-center gap-1">
                <span className="grid size-7 place-items-center rounded-full bg-[#e8f0fe] text-[#1a73e8] sm:size-9">
                  <Icone className="size-3.5 sm:size-4" />
                </span>
                <span className="text-[9px] text-[#1a73e8] sm:text-[11px]">{t as string}</span>
              </div>
            );
          })}
        </div>
        {maps.endereco && (
          <div className="mt-3 flex gap-2 text-[10px] leading-snug sm:text-xs">
            <MapPin className="size-3.5 shrink-0 text-[#1a73e8]" /> {maps.endereco}
          </div>
        )}

      </div>
    </div>
  );
}

async function LadoAtual({ proposta }: { proposta: Proposta }) {
  if (proposta.atualSite) {
    const m = await medirSite(proposta.atualSite);
    return (
      <>
        <Celular>
          {m?.tela ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.tela} alt="Site atual no celular" className="size-full object-cover object-top" />
          ) : (
            <div className="grid size-full place-items-center p-4 text-center text-xs text-ink-soft">
              Não consegui capturar o site atual agora.
            </div>
          )}
        </Celular>
        {m && <SeloVelocidade m={m} />}
      </>
    );
  }
  if (proposta.maps) {
    return (
      <>
        <Celular>
          <TelaMaps maps={proposta.maps} />
        </Celular>
        <p className="mt-3 text-center text-xs font-semibold text-red-700 sm:text-sm">Quem te procura não acha site</p>
      </>
    );
  }
  return null;
}

async function LadoNovo({ proposta, url }: { proposta: Proposta; url?: string }) {
  if (url) {
    const m = await medirSite(url);
    if (m?.tela)
      return (
        <>
          <Celular>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.tela} alt="Novo site no celular" className="size-full object-cover object-top" />
          </Celular>
          <SeloVelocidade m={m} />
        </>
      );
  }
  const base = modeloPorSlug(proposta.modelo ?? "") ?? modeloPorSlug("sereno")!;
  const modelo = proposta.negocio ? { ...base, negocio: { ...base.negocio, nome: proposta.negocio } } : base;
  return (
    <>
      <Celular>
        <Miniatura largura={390} altura={844}>
          <SiteModelo modelo={modelo} apenasHero />
        </Miniatura>
      </Celular>
      <p className="mt-3 text-center text-xs font-semibold text-brand sm:text-sm">Rápido, bonito e com WhatsApp</p>
    </>
  );
}

export async function Comparativo({ proposta, depois }: { proposta: Proposta; depois?: string }) {
  if (!proposta.atualSite && !proposta.maps) return null;
  const nome = proposta.negocio || "o seu negócio";
  return (
    <section className="rounded-[32px] bg-bg-alt p-4 sm:p-8 print:break-inside-avoid">
      <h2 className="text-center font-display text-2xl leading-tight sm:text-3xl">
        {nome} hoje <span className="text-ink-soft">×</span> <span className="text-brand">{depois ? "depois" : "como vai ficar"}</span>
      </h2>
      <p className="mt-2 text-center text-sm text-ink-soft">É assim que seu cliente vê no celular.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-8">
        <div>
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold">
            <span className="size-2.5 rounded-full bg-red-500" /> Hoje
          </div>
          <LadoAtual proposta={proposta} />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold">
            <span className="size-2.5 rounded-full bg-brand" /> {depois ? "Novo site" : "Com o novo site"}
          </div>
          <LadoNovo proposta={proposta} url={depois ?? proposta.previa} />
        </div>
      </div>
    </section>
  );
}

export function ComparativoCarregando() {
  return (
    <section className="rounded-[32px] bg-bg-alt p-6 text-center sm:p-8">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
        <div className="aspect-[390/844] animate-pulse rounded-[34px] bg-line" />
        <div className="aspect-[390/844] animate-pulse rounded-[34px] bg-line" />
      </div>
      <p className="mt-4 text-sm text-ink-soft">Medindo o site atual como o Google mede no celular…</p>
    </section>
  );
}
