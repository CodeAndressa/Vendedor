import { ArrowUpRight, Check, Star } from "lucide-react";
import { config } from "@/lib/config";
import { depoimentosVisiveis, projetos } from "@/lib/content";
import { Reveal } from "./reveal";
import { Botao, Eyebrow, Titulo, WhatsAppIcon } from "./ui";

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Eyebrow>Portfólio</Eyebrow>
            <Titulo>
              Projetos que já estão <em>trazendo clientes</em>
            </Titulo>
          </div>
          <p className="max-w-sm text-ink-soft">
            Cada projeto é feito do zero para o negócio: texto, design e tecnologia pensados para vender.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5">
          {projetos.map((p) => (
            <Reveal key={p.cliente}>
              <article data-holofote className="group relative overflow-hidden rounded-[28px] bg-forest text-white ring-1 ring-black/5">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-40 -right-40 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(23,120,74,0.45)_0%,transparent_65%)]"
                />
                <div className="relative grid gap-10 p-7 md:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                  <div>
                    <span className="text-[11px] font-medium tracking-[0.22em] text-lime uppercase">{p.tipo}</span>
                    <h3 className="mt-4 font-display text-5xl tracking-[-0.03em] md:text-6xl">{p.cliente}</h3>
                    <p className="mt-5 text-[17px] leading-relaxed text-white/70">{p.descricao}</p>
                    {p.destaques && (
                      <ul className="mt-7 grid gap-3 border-t border-white/10 pt-7 text-[15px]">
                        {p.destaques.map((d) => (
                          <li key={d} className="flex gap-3">
                            <Check className="mt-0.5 size-4 shrink-0 text-lime" strokeWidth={2.5} /> {d}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-7 flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <span key={t} className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/70">
                          {t}
                        </span>
                      ))}
                    </div>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener"
                        className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-lime px-6 text-[15px] font-medium text-forest transition hover:-translate-y-0.5 hover:bg-[#E6D3A6]"
                      >
                        Ver o site no ar <ArrowUpRight className="size-4" />
                      </a>
                    )}
                  </div>

                  {/* computador com o celular por cima */}
                  <div className="relative pb-10 lg:pb-0">
                    <div className="overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-[0_50px_90px_-40px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="size-2.5 rounded-full bg-white/15" />
                        <span className="size-2.5 rounded-full bg-white/15" />
                        {p.url && (
                          <span className="mx-auto rounded-md bg-white/5 px-10 py-1 text-[11px] text-white/45">{p.url.replace("https://", "")}</span>
                        )}
                      </div>
                      <div className="aspect-[16/10] overflow-hidden">
                        {p.imagem ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imagem}
                            alt={`Site da ${p.cliente} no computador`}
                            loading="lazy"
                            className="size-full object-cover object-top transition duration-700 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="grid size-full place-items-center bg-forest-2 font-display text-5xl">{p.cliente}</div>
                        )}
                      </div>
                    </div>
                    {p.imagemCelular && (
                      <div className="absolute -bottom-2 left-4 w-[24%] min-w-[96px] rounded-[22px] bg-[#111] p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/15 lg:-bottom-8 lg:-left-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imagemCelular}
                          alt={`Site da ${p.cliente} no celular`}
                          loading="lazy"
                          className="aspect-[9/19] w-full rounded-[17px] object-cover object-top"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}

          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-line bg-card p-7 md:p-9">
              <div>
                <h3 className="font-display text-3xl tracking-[-0.03em]">
                  O próximo pode ser <em className="text-brand italic">o seu.</em>
                </h3>
                <p className="mt-2 text-ink-soft">Do site simples ao sistema completo, com o mesmo cuidado em cada detalhe.</p>
              </div>
              <Botao mensagem="Oi! Vi seu portfólio e quero conversar sobre o meu projeto.">
                <WhatsAppIcon /> Quero ser o próximo
              </Botao>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Depoimentos() {
  if (depoimentosVisiveis.length === 0) return null;
  // duplica a lista para o carrossel rodar sem emenda
  const faixa = [...depoimentosVisiveis, ...depoimentosVisiveis];
  return (
    <section id="avaliacoes" className="overflow-hidden border-y border-line bg-bg-alt py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Avaliações</Eyebrow>
          <Titulo>
            Quem já tirou o site <em>do papel</em>
          </Titulo>
        </Reveal>
      </div>
      <div className="relative mt-14 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex w-max gap-5 px-5">
          {faixa.map((d, i) => (
            <figure
              key={i}
              aria-hidden={i >= depoimentosVisiveis.length || undefined}
              className="relative flex w-[320px] shrink-0 flex-col rounded-[24px] border border-line bg-card p-8 sm:w-[400px]"
            >
              {d.exemplo && (
                <span className="absolute top-4 right-4 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                  EXEMPLO · não publica
                </span>
              )}
              <div className="flex gap-0.5 text-[#B89A5A]">
                {Array.from({ length: d.estrelas }).map((_, k) => (
                  <Star key={k} className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 font-display text-[22px] leading-[1.25] tracking-[-0.01em] text-ink">“{d.texto}”</blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                <span className="grid size-10 place-items-center rounded-full bg-forest font-display text-lg text-lime">
                  {d.nome.charAt(0)}
                </span>
                <span className="text-sm">
                  <span className="block font-semibold">{d.nome}</span>
                  <span className="text-ink-soft">{d.negocio}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Sobre() {
  const primeiroNome = config.nome.split(" ")[0];
  return (
    <section id="sobre" className="py-24 md:py-36">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 md:px-10 xl:px-16 md:grid-cols-[360px_1fr] md:gap-20">
        <Reveal>
          {/* Troque por <img src="/foto.jpg" ...> quando tiver sua foto em /public */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] md:max-w-none">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[28px] border border-lime/70" />
            <div className="relative grid size-full place-items-center overflow-hidden rounded-[28px] bg-forest">
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(23,120,74,0.55),transparent_60%)]" />
              <span className="relative font-display text-[160px] leading-none text-lime italic">{primeiroNome.charAt(0)}</span>
              <span className="absolute bottom-6 left-6 text-[11px] tracking-[0.22em] text-white/50 uppercase">{config.cidade}</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Eyebrow>Quem vai fazer o seu site</Eyebrow>
          <Titulo>
            Oi, eu sou a <em>{primeiroNome}.</em>
          </Titulo>
          <p className="mt-7 text-lg leading-relaxed text-ink-soft">
            Sou desenvolvedora e trabalho todos os dias com sistemas, dados e inteligência artificial. Construí do zero o
            site e a plataforma de gestão da 4Core, com financeiro, cobrança automática, marketing e atendimento com IA, e
            uma plataforma corporativa de gestão usada por 19 áreas de uma empresa de tecnologia.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Agora coloco essa mesma experiência no site do seu negócio: bonito, rápido, seguro e feito para trazer
            clientes. Você fala direto comigo do começo ao fim, sem agência no meio e sem esperar dias por resposta.
          </p>
          <dl className="mt-9 grid grid-cols-3 divide-x divide-line border-y border-line py-5">
            {[
              ["19", "áreas usando um sistema meu"],
              ["IA", "em produção no dia a dia"],
              ["1:1", "atendimento direto comigo"],
            ].map(([n, t]) => (
              <div key={t} className="px-4 first:pl-0">
                <dt className="font-display text-2xl tracking-tight whitespace-nowrap sm:text-3xl">{n}</dt>
                <dd className="mt-1 text-[13px] leading-snug text-ink-soft">{t}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex flex-wrap gap-2">
            {["Next.js", "React", "TypeScript", "Python", "IA generativa", "Dados e BI"].map((t) => (
              <span key={t} className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-soft">
                {t}
              </span>
            ))}
          </div>
          <Botao mensagem="Oi! Vi seu site e queria conversar sobre um projeto." className="mt-9">
            <WhatsAppIcon /> Falar comigo
          </Botao>
        </Reveal>
      </div>
    </section>
  );
}
