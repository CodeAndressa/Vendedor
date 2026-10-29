import type { CSSProperties } from "react";
import { Clock, MapPin, Quote, Star } from "lucide-react";
import type { Fonte, Modelo } from "@/lib/modelos";
import { Cardapio } from "./cardapio";
import { SiteEstetica } from "./estetica";
import { icones } from "./icones";

const fontes: Record<Fonte, string> = {
  bricolage: "var(--font-bricolage)",
  fraunces: "var(--font-fraunces)",
  grotesk: "var(--font-grotesk)",
};

// Renderiza o site de demonstração de um modelo. Com `apenasHero`, só a primeira dobra (usado nas miniaturas).
export function SiteModelo({ modelo, apenasHero = false }: { modelo: Modelo; apenasHero?: boolean }) {
  const { cores, negocio } = modelo;
  const estilo = {
    "--m-fundo": cores.fundo,
    "--m-texto": cores.texto,
    "--m-destaque": cores.destaque,
    "--m-texto-destaque": cores.textoDestaque,
    "--m-suave": cores.suave,
    "--m-cartao": cores.cartao,
    "--m-fonte": fontes[modelo.fonte],
  } as CSSProperties;

  // Layout de clínica de estética: tem seções próprias (procedimentos, resultados, especialista, FAQ...)
  if (modelo.layout === "estetica") {
    return (
      <div style={estilo} className="@container bg-[var(--m-fundo)] font-sans text-[var(--m-texto)]">
        <SiteEstetica modelo={modelo} apenasHero={apenasHero} />
      </div>
    );
  }

  return (
    <div style={estilo} className="@container bg-[var(--m-fundo)] font-sans text-[var(--m-texto)]">
      {modelo.layout === "dividido" && <HeroDividido modelo={modelo} miniatura={apenasHero} />}
      {modelo.layout === "centro" && <HeroCentro modelo={modelo} miniatura={apenasHero} />}
      {modelo.layout === "cinema" && <HeroCinema modelo={modelo} miniatura={apenasHero} />}
      {modelo.layout === "lanchonete" && <HeroLanchonete modelo={modelo} miniatura={apenasHero} />}
      {!apenasHero && (
        <>
          {negocio.cardapio && <Cardapio secoes={negocio.cardapio} />}
          <Servicos modelo={modelo} />
          <Sobre modelo={modelo} />
          {negocio.local && <Local modelo={modelo} />}
          {modelo.tipo === "Landing page" && <Oferta modelo={modelo} />}
          <Contato modelo={modelo} />
          <footer className="border-t border-[color-mix(in_srgb,var(--m-texto)_12%,transparent)] px-6 py-8 text-center text-sm opacity-60">
            © {negocio.nome} · Site de demonstração
          </footer>
        </>
      )}
    </div>
  );
}

// Nas miniaturas (galeria, home, páginas de nicho) o título do modelo não pode ser um <h1>: a página já tem o seu.
function Titulo({ children, className = "", miniatura = false }: { children: React.ReactNode; className?: string; miniatura?: boolean }) {
  const Tag = miniatura ? "p" : "h1";
  return (
    <Tag style={{ fontFamily: "var(--m-fonte)" }} className={`leading-[1.02] font-extrabold tracking-[-0.03em] text-balance ${className}`}>
      {children}
    </Tag>
  );
}

function BotaoModelo({ children, contorno = false }: { children: React.ReactNode; contorno?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold ${
        contorno
          ? "border-[1.5px] border-[color-mix(in_srgb,var(--m-texto)_25%,transparent)]"
          : "bg-[var(--m-destaque)] text-[var(--m-texto-destaque)]"
      }`}
    >
      {children}
    </span>
  );
}

function Nav({ modelo }: { modelo: Modelo }) {
  const Logo = icones[modelo.negocio.icone];
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <span className="flex items-center gap-2.5 font-semibold" style={{ fontFamily: "var(--m-fonte)" }}>
        <span className="grid size-9 place-items-center rounded-xl bg-[var(--m-destaque)] text-[var(--m-texto-destaque)]">
          <Logo className="size-5" />
        </span>
        <span className="text-lg">{modelo.negocio.nome}</span>
      </span>
      <span className="hidden items-center gap-8 text-sm opacity-75 @3xl:flex">
        <span>Serviços</span>
        <span>Sobre</span>
        <span>Contato</span>
      </span>
      <span className="hidden rounded-full bg-[var(--m-destaque)] px-5 py-2.5 text-sm font-semibold text-[var(--m-texto-destaque)] @xl:inline-flex">
        {modelo.negocio.cta}
      </span>
    </nav>
  );
}

function HeroDividido({ modelo, miniatura = false }: { modelo: Modelo; miniatura?: boolean }) {
  const { negocio } = modelo;
  const Grande = icones[negocio.icone];
  const S1 = icones[negocio.servicos[1].icone];
  return (
    <header className="min-h-[800px]">
      <Nav modelo={modelo} />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-10 pb-20 @3xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--m-suave)] px-4 py-1.5 text-sm font-medium">
            <Star className="size-4 fill-[var(--m-destaque)] text-[var(--m-destaque)]" /> {modelo.segmento}
          </span>
          <Titulo miniatura={miniatura} className="mt-6 text-[clamp(2.6rem,5.5cqw,4.6rem)]">{negocio.chamada}</Titulo>
          <p className="mt-6 max-w-lg text-lg opacity-75">{negocio.subtitulo}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <BotaoModelo>{negocio.cta}</BotaoModelo>
            <BotaoModelo contorno>Ver serviços</BotaoModelo>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] bg-[var(--m-suave)]">
            <div className="absolute -top-16 -right-16 size-72 rounded-full bg-[var(--m-destaque)] opacity-25 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-1/2 w-full bg-[linear-gradient(to_top,color-mix(in_srgb,var(--m-destaque)_30%,transparent),transparent)]" />
            <Grande className="absolute top-1/2 left-1/2 size-48 -translate-x-1/2 -translate-y-1/2 text-[var(--m-destaque)]" strokeWidth={1.1} />
          </div>
          <div className="absolute top-10 -left-8 flex items-center gap-3 rounded-2xl bg-[var(--m-cartao)] px-5 py-4 shadow-xl">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--m-suave)] text-[var(--m-destaque)]">
              <S1 className="size-5" />
            </span>
            <span className="text-sm">
              <span className="block font-semibold">{negocio.servicos[1].titulo}</span>
              <span className="opacity-60">e muito mais</span>
            </span>
          </div>
          <div className="absolute -right-4 bottom-12 rounded-2xl bg-[var(--m-cartao)] px-5 py-4 shadow-xl">
            <div className="text-2xl font-extrabold" style={{ fontFamily: "var(--m-fonte)" }}>
              {negocio.numeros[2][0]}
            </div>
            <div className="text-sm opacity-60">{negocio.numeros[2][1]}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroCentro({ modelo, miniatura = false }: { modelo: Modelo; miniatura?: boolean }) {
  const { negocio } = modelo;
  return (
    <header className="min-h-[800px]">
      <Nav modelo={modelo} />
      <div className="mx-auto max-w-5xl px-6 pt-14 text-center">
        <span className="text-sm font-semibold tracking-[0.2em] uppercase opacity-60">{modelo.segmento}</span>
        <Titulo miniatura={miniatura} className="mx-auto mt-5 max-w-4xl text-[clamp(2.8rem,6.5cqw,5.6rem)]">{negocio.chamada}</Titulo>
        <p className="mx-auto mt-6 max-w-xl text-lg opacity-75">{negocio.subtitulo}</p>
        <div className="mt-9 flex justify-center gap-3">
          <BotaoModelo>{negocio.cta}</BotaoModelo>
        </div>
      </div>
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-3 gap-4 px-6 pb-16">
        {negocio.servicos.map((s, i) => {
          const I = icones[s.icone];
          return (
            <div
              key={s.titulo}
              className={`relative flex h-36 flex-col justify-between overflow-hidden rounded-[22px] p-4 text-left @xl:h-56 @xl:rounded-[28px] @xl:p-6 ${
                i === 1 ? "bg-[var(--m-destaque)] text-[var(--m-texto-destaque)]" : "bg-[var(--m-suave)]"
              }`}
            >
              <I className="size-9" strokeWidth={1.5} />
              <div className="absolute -right-6 -bottom-6 size-16 rounded-full bg-current opacity-10 @xl:size-32" />
              <span className="text-sm font-semibold @xl:text-lg" style={{ fontFamily: "var(--m-fonte)" }}>
                {s.titulo}
              </span>
            </div>
          );
        })}
      </div>
    </header>
  );
}

function HeroCinema({ modelo, miniatura = false }: { modelo: Modelo; miniatura?: boolean }) {
  const { negocio } = modelo;
  const Grande = icones[negocio.icone];
  return (
    <header className="relative min-h-[800px] overflow-hidden">
      <div className="absolute top-1/3 right-[-10%] size-[700px] rounded-full bg-[radial-gradient(circle,var(--m-destaque)_0%,transparent_60%)] opacity-35" />
      <Grande
        className="absolute top-28 right-10 size-[420px] text-[var(--m-destaque)] opacity-15"
        strokeWidth={0.6}
      />
      <div className="relative">
        <Nav modelo={modelo} />
        <div className="mx-auto max-w-6xl px-6 pt-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--m-texto)_20%,transparent)] px-4 py-1.5 text-sm">
            <span className="size-2 rounded-full bg-[var(--m-destaque)]" /> {modelo.segmento}
          </span>
          <Titulo miniatura={miniatura} className="mt-6 max-w-4xl text-[clamp(3rem,8cqw,7rem)] uppercase">
            {negocio.chamada}
          </Titulo>
          <p className="mt-6 max-w-lg text-lg opacity-70">{negocio.subtitulo}</p>
          <div className="mt-9 flex gap-3">
            <BotaoModelo>{negocio.cta}</BotaoModelo>
            <BotaoModelo contorno>Saiba mais</BotaoModelo>
          </div>
        </div>
        <div className="mt-20 flex gap-10 overflow-hidden border-y border-[color-mix(in_srgb,var(--m-texto)_12%,transparent)] py-5 text-2xl font-extrabold whitespace-nowrap uppercase opacity-80" style={{ fontFamily: "var(--m-fonte)" }}>
          {[...negocio.servicos, ...negocio.servicos, ...negocio.servicos].map((s, i) => (
            <span key={i} className="flex items-center gap-10">
              {s.titulo} <span className="text-[var(--m-destaque)]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

function Servicos({ modelo }: { modelo: Modelo }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 style={{ fontFamily: "var(--m-fonte)" }} className="max-w-xl text-4xl font-extrabold tracking-tight">
        O que fazemos por você
      </h2>
      <div className="mt-12 grid gap-5 @3xl:grid-cols-3">
        {modelo.negocio.servicos.map((s) => {
          const I = icones[s.icone];
          return (
            <div key={s.titulo} className="rounded-3xl bg-[var(--m-cartao)] p-7 shadow-[0_1px_0_color-mix(in_srgb,var(--m-texto)_8%,transparent)]">
              <span className="grid size-12 place-items-center rounded-2xl bg-[var(--m-suave)] text-[var(--m-destaque)]">
                <I className="size-6" />
              </span>
              <h3 style={{ fontFamily: "var(--m-fonte)" }} className="mt-6 text-xl font-bold">
                {s.titulo}
              </h3>
              <p className="mt-2 opacity-70">{s.texto}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Sobre({ modelo }: { modelo: Modelo }) {
  const { negocio } = modelo;
  return (
    <section className="bg-[var(--m-suave)] py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 @3xl:grid-cols-2">
        <div>
          <h2 style={{ fontFamily: "var(--m-fonte)" }} className="text-4xl font-extrabold tracking-tight">
            Sobre {negocio.nome}
          </h2>
          <p className="mt-5 text-lg opacity-75">{negocio.sobre}</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {negocio.numeros.map(([n, t]) => (
              <div key={t}>
                <div style={{ fontFamily: "var(--m-fonte)" }} className="text-3xl font-extrabold text-[var(--m-destaque)]">
                  {n}
                </div>
                <div className="text-sm opacity-65">{t}</div>
              </div>
            ))}
          </div>
        </div>
        <figure className="self-center rounded-3xl bg-[var(--m-cartao)] p-8">
          <Quote className="size-8 text-[var(--m-destaque)]" />
          <blockquote style={{ fontFamily: "var(--m-fonte)" }} className="mt-4 text-2xl leading-snug font-semibold">
            “{negocio.depoimento.texto}”
          </blockquote>
          <figcaption className="mt-5 text-sm opacity-60">{negocio.depoimento.nome}</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Oferta({ modelo }: { modelo: Modelo }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <span className="text-sm font-semibold tracking-[0.2em] text-[var(--m-destaque)] uppercase">Condição especial</span>
      <h2 style={{ fontFamily: "var(--m-fonte)" }} className="mt-4 text-4xl font-extrabold tracking-tight">
        Primeira visita com 20% de desconto
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-lg opacity-75">
        Válido para novos clientes que agendarem pelo site esta semana.
      </p>
      <div className="mt-8">
        <BotaoModelo>{modelo.negocio.cta}</BotaoModelo>
      </div>
    </section>
  );
}

function Contato({ modelo }: { modelo: Modelo }) {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-6xl rounded-[36px] bg-[var(--m-destaque)] px-8 py-16 text-center text-[var(--m-texto-destaque)]">
        <h2 style={{ fontFamily: "var(--m-fonte)" }} className="text-4xl font-extrabold tracking-tight">
          Vamos conversar?
        </h2>
        <p className="mt-3 text-lg opacity-80">Resposta rápida pelo WhatsApp.</p>
        <span className="mt-8 inline-flex rounded-full bg-[var(--m-texto-destaque)] px-6 py-3.5 font-semibold text-[var(--m-destaque)]">
          {modelo.negocio.cta}
        </span>
      </div>
    </section>
  );
}

// Hambúrguer desenhado só com CSS, para o modelo de lanchonete não depender de foto.
function Hamburguer() {
  return (
    <div className="relative w-[300px]" aria-hidden>
      <div className="relative h-28 rounded-t-[150px] rounded-b-2xl bg-[#F0A23B] shadow-[inset_-14px_-10px_0_rgba(0,0,0,0.08)]">
        {[
          [30, 40], [70, 22], [120, 30], [170, 18], [215, 34], [95, 60], [150, 55], [200, 66], [55, 72],
        ].map(([x, y], i) => (
          <span key={i} className="absolute h-2 w-3.5 rounded-full bg-[#FFF3D6]" style={{ left: x, top: y, rotate: `${(i * 37) % 60 - 30}deg` }} />
        ))}
      </div>
      <div className="-mt-1 h-5 rounded-full bg-[#6CBF3F] [clip-path:polygon(0_0,100%_0,100%_60%,95%_100%,88%_55%,80%_100%,72%_55%,64%_100%,56%_55%,48%_100%,40%_55%,32%_100%,24%_55%,16%_100%,8%_55%,0_100%)]" />
      <div className="-mt-1 h-3 bg-[#E2412A] mx-2 rounded-full" />
      <div className="-mt-0.5 h-7 bg-[#FFC93C] mx-1 [clip-path:polygon(0_0,100%_0,100%_40%,92%_40%,88%_100%,84%_40%,60%_40%,55%_85%,50%_40%,25%_40%,20%_100%,15%_40%,0_40%)]" />
      <div className="-mt-4 h-14 rounded-[22px] bg-[#5B2B17] shadow-[inset_0_-8px_0_rgba(0,0,0,0.18)]" />
      <div className="mt-1 h-12 rounded-t-lg rounded-b-[40px] bg-[#E9963A] shadow-[inset_-12px_-8px_0_rgba(0,0,0,0.08)]" />
    </div>
  );
}

function HeroLanchonete({ modelo, miniatura = false }: { modelo: Modelo; miniatura?: boolean }) {
  const { negocio } = modelo;
  const aviso = [`Aberto hoje a partir das ${negocio.numeros[2][0]}`, "Delivery e salão", negocio.local?.avaliacao ?? "Feito na hora"];
  return (
    <header className="relative min-h-[800px] overflow-hidden">
      <div className="flex gap-8 overflow-hidden bg-[var(--m-destaque)] py-2.5 text-sm font-bold whitespace-nowrap text-[var(--m-texto-destaque)] uppercase">
        {[...aviso, ...aviso, ...aviso, ...aviso].map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            {t} <span>✦</span>
          </span>
        ))}
      </div>
      <Nav modelo={modelo} />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-6 pb-28 @3xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          {negocio.local && (
            <span className="inline-flex rotate-[-3deg] items-center gap-2 rounded-full bg-[var(--m-suave)] px-4 py-2 text-sm font-bold">
              <Star className="size-4 fill-current" /> {negocio.local.avaliacao}
            </span>
          )}
          <Titulo miniatura={miniatura} className="mt-6 text-[clamp(3rem,8cqw,6.4rem)] leading-[0.92] uppercase">{negocio.chamada}</Titulo>
          <p className="mt-6 max-w-md text-lg opacity-75">{negocio.subtitulo}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <BotaoModelo>{negocio.cta}</BotaoModelo>
            <BotaoModelo contorno>Ver cardápio</BotaoModelo>
          </div>
        </div>
        <div className="relative mx-auto grid size-[320px] place-items-center @xl:size-[440px]">
          <div className="absolute inset-0 rounded-full bg-[var(--m-suave)]" />
          <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-[spin_24s_linear_infinite] motion-reduce:animate-none">
            <defs>
              <path id="circulo-lanchonete" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" />
            </defs>
            <text className="fill-[var(--m-texto)] text-[11px] font-bold tracking-[0.3em] uppercase">
              <textPath href="#circulo-lanchonete">Artesanal ✦ Feito na chapa ✦ Pão brioche ✦ Fritas crocantes ✦</textPath>
            </text>
          </svg>
          <div className="relative rotate-[-6deg] scale-[0.72] @xl:scale-100">
            <Hamburguer />
          </div>
          <div className="absolute -right-2 bottom-10 rotate-[8deg] rounded-2xl bg-[var(--m-destaque)] px-5 py-3 text-[var(--m-texto-destaque)] shadow-xl">
            <div className="text-xs font-bold uppercase opacity-80">Smash a partir de</div>
            <div style={{ fontFamily: "var(--m-fonte)" }} className="text-3xl font-extrabold">
              {negocio.cardapio?.[1]?.itens.at(-1)?.preco ?? "R$ 29,90"}
            </div>
          </div>
        </div>
      </div>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-16 w-full text-[var(--m-cartao)]" aria-hidden>
        <path fill="currentColor" d="M0,40 C240,90 480,-10 720,40 C960,90 1200,-10 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </header>
  );
}

function Local({ modelo }: { modelo: Modelo }) {
  const local = modelo.negocio.local!;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="grid gap-4 @3xl:grid-cols-3">
        {[
          { titulo: "Endereço", texto: local.endereco },
          { titulo: "Horário", texto: local.horario },
          { titulo: "Avaliação", texto: local.avaliacao },
        ].map((b, i) => (
          <div key={b.titulo} className={`rounded-3xl p-7 ${i === 0 ? "bg-[var(--m-texto)] text-[var(--m-fundo)]" : "bg-[var(--m-cartao)]"}`}>
            {i === 0 ? <MapPin className="size-7" /> : i === 1 ? <Clock className="size-7" /> : <Star className="size-7" />}
            <div className="mt-6 text-sm font-bold tracking-wider uppercase opacity-60">{b.titulo}</div>
            <div style={{ fontFamily: "var(--m-fonte)" }} className="mt-1 text-xl font-extrabold">
              {b.texto}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
