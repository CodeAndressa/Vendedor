import {
  CreditCard,
  FileText,
  KeyRound,
  Lock,
  Globe,
  HandHeart,
  MessageCircle,
  PenLine,
  Search,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Zap,
} from "lucide-react";
import { Bot, Braces, Sparkles, MapPin, MessagesSquare, ScanSearch } from "lucide-react";
import { Reveal } from "./reveal";
import { Botao, Eyebrow, Titulo } from "./ui";

export function Numeros() {
  const itens = [
    ["48h", "primeira versão"],
    ["7 dias", "site no ar"],
    ["R$ 997", "preço fechado"],
    ["100%", "seu: domínio e site"],
  ];
  return (
    <div className="border-y border-line">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-5 md:px-10 xl:px-16 md:grid-cols-4">
        {itens.map(([n, t], i) => (
          <div key={t} className={`py-8 text-center ${i % 2 ? "border-l border-line" : ""} ${i === 2 ? "md:border-l" : ""} ${i > 1 ? "border-t border-line md:border-t-0" : ""}`}>
            <div className="font-display text-4xl tracking-tight text-forest">{n}</div>
            <div className="mt-1 text-[13px] tracking-wide text-ink-soft">{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PorQue() {
  const cards = [
    { icone: Search, titulo: "Aparece no Google", texto: "Seu negócio passa a ser encontrado por quem já está procurando o que você vende." },
    { icone: HandHeart, titulo: "Passa confiança", texto: "Endereço próprio e página profissional mostram que você leva o negócio a sério." },
    { icone: MessageCircle, titulo: "Vira conversa", texto: "Cada página termina num botão de WhatsApp. O visitante vira contato em um clique." },
  ];
  return (
    <section className="relative overflow-hidden bg-forest py-24 text-white md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 size-[520px] rounded-full bg-[radial-gradient(circle,var(--color-brand)_0%,transparent_65%)] opacity-40 blur-2xl"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <Reveal>
          <Eyebrow claro>Por que ter um site</Eyebrow>
          <Titulo className="max-w-3xl">
            Quem procura no Google e não acha você, <em className="!text-lime">acha o concorrente.</em>
          </Titulo>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            Instagram ajuda, mas não substitui um endereço próprio. Um site bem feito passa confiança, aparece nas
            buscas e leva o cliente direto para o seu WhatsApp.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.titulo} delay={i * 0.08}>
              <div data-holofote className="h-full rounded-[24px] border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:border-lime/40 hover:bg-white/[0.05]">
                <c.icone className="mb-8 size-7 text-lime" strokeWidth={1.5} />
                <h3 className="font-display text-[28px] leading-tight">{c.titulo}</h3>
                <p className="mt-2 text-white/65">{c.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Incluso() {
  const itens = [
    { icone: FileText, titulo: "Até 5 páginas", texto: "Início, sobre, serviços, contato e mais uma. Ou uma landing page única, se for para anúncio." },
    { icone: Smartphone, titulo: "Feito para celular", texto: "A maioria dos seus clientes vai abrir no celular. O site é pensado primeiro para essa tela." },
    { icone: PenLine, titulo: "Textos prontos", texto: "Você não precisa escrever nada. Eu monto os textos a partir da nossa conversa." },
    { icone: MessageCircle, titulo: "Botão de WhatsApp", texto: "Em todas as páginas, com mensagem pronta para o cliente só apertar enviar." },
    { icone: Globe, titulo: "Domínio .com.br", texto: "Registrado no seu nome ou CNPJ, com hospedagem do primeiro ano inclusa." },
    { icone: Zap, titulo: "Rápido e seguro", texto: "Carrega rápido, tem cadeado de segurança (HTTPS) e segue as boas práticas de segurança do mercado." },
  ];
  return (
    <section id="incluso" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Tudo no pacote de R$ 997</Eyebrow>
          <Titulo>
            O que você <em>recebe</em>
          </Titulo>
          <p className="mt-5 text-lg text-ink-soft">Sem mensalidade escondida e sem você precisar mexer em nada técnico.</p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((it, i) => (
            <Reveal key={it.titulo} delay={(i % 3) * 0.07}>
              <div className="group h-full rounded-[24px] border border-line bg-card p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-36px_rgba(8,30,20,0.4)]">
                <span className="mb-8 grid size-12 place-items-center rounded-full border border-line text-brand transition duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                  <it.icone className="size-5" strokeWidth={1.5} />
                </span>
                <h3 className="font-display text-[26px] leading-tight">{it.titulo}</h3>
                <p className="mt-2 text-ink-soft">{it.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ComoFunciona() {
  const passos = [
    { quando: "Dia 1", titulo: "Conversa no WhatsApp", texto: "Você me conta sobre o negócio e os serviços, e manda fotos e logo, se tiver." },
    { quando: "Dia 1", titulo: "Primeira metade", texto: "Você paga 50% para eu começar, no Pix, cartão ou boleto. Ou assina em 12x sem entrada." },
    { quando: "Até 48h", titulo: "Primeira versão pronta", texto: "Te mando o link para ver no celular. Você pede os ajustes que quiser." },
    { quando: "Até 7 dias", titulo: "Site no ar", texto: "Ajustes feitos, domínio configurado e site publicado. Aí você paga a segunda metade." },
  ];
  return (
    <section id="como-funciona" className="bg-bg-alt py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Simples assim</Eyebrow>
          <Titulo>
            Do primeiro “oi” ao <em>site no ar</em>
          </Titulo>
        </Reveal>
        <div className="relative mt-16 grid gap-6 md:grid-cols-4 md:gap-5">
          <div aria-hidden className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-brand/0 via-brand/40 to-brand/0 md:block" />
          {passos.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.1}>
              <div className="relative flex gap-5 md:flex-col md:items-center md:text-center">
                <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-line bg-card font-display text-2xl text-brand italic shadow-[0_10px_30px_-18px_rgba(8,30,20,0.5)]">
                  {i + 1}
                </span>
                <div>
                  <span className="text-xs font-semibold tracking-wider text-brand uppercase">{p.quando}</span>
                  <h3 className="mt-1 font-display text-2xl leading-tight">{p.titulo}</h3>
                  <p className="mt-1.5 text-[15px] text-ink-soft">{p.texto}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Garantia() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <Reveal>
          <div className="grid items-center gap-8 rounded-[28px] border border-line bg-card p-8 text-center md:grid-cols-[auto_1fr] md:gap-14 md:p-14 md:text-left">
            <div className="mx-auto grid size-36 place-items-center rounded-full border border-lime bg-forest text-white shadow-[0_30px_60px_-30px_rgba(8,30,20,0.7)] ring-8 ring-bg-alt">
              <div className="text-center">
                <ShieldCheck className="mx-auto size-7 text-lime" strokeWidth={1.5} />
                <div className="mt-2 font-display text-lg leading-tight italic">
                  Risco
                  <br />
                  pela metade
                </div>
              </div>
            </div>
            <div>
              <Titulo>
                Não gostou da primeira versão? <em>Não paga o resto.</em>
              </Titulo>
              <p className="mt-4 max-w-2xl text-lg text-ink-soft">
                Se em 48 horas a primeira versão não te agradar, você não paga a segunda metade e fica com o que já viu.
                Simples e justo para os dois lados.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Seguranca() {
  const itens = [
    { icone: Lock, titulo: "Cadeado (HTTPS)", texto: "Todo o tráfego do site é criptografado, do primeiro acesso ao formulário de contato." },
    { icone: ShieldCheck, titulo: "Boas práticas OWASP", texto: "Proteção contra as falhas mais exploradas da web, como injeção de código e formulários abusados." },
    { icone: UserCheck, titulo: "Dados conforme a LGPD", texto: "Aviso de cookies, política de privacidade e só os dados necessários, guardados com cuidado." },
    { icone: CreditCard, titulo: "Pagamento seguro", texto: "Cobranças pelo Asaas, instituição regulada pelo Banco Central. Nenhum dado de cartão passa pelo site." },
    { icone: KeyRound, titulo: "Acesso protegido", texto: "Áreas internas com senha, chaves fora do código e links de proposta assinados contra alteração." },
  ];
  return (
    <section id="seguranca" className="relative overflow-hidden bg-forest py-24 text-white md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_70%_at_20%_40%,black,transparent)]"
      />
      <div className="relative mx-auto grid max-w-[1440px] gap-14 px-5 md:px-10 xl:px-16 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <Eyebrow claro>Segurança</Eyebrow>
          <Titulo>
            Seguro por padrão, <em className="!text-lime">não só um cadeado.</em>
          </Titulo>
          <p className="mt-6 max-w-md text-lg text-white/65">
            Todo site que eu entrego segue as boas práticas de segurança do mercado. O seu cliente confia, o Google
            gosta e você dorme tranquilo.
          </p>
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 sm:grid-cols-2">
          {itens.map((it, i) => (
            <Reveal key={it.titulo} delay={i * 0.06} className={i === itens.length - 1 ? "sm:col-span-2" : ""}>
              <div data-holofote className="h-full bg-forest p-7">
                <it.icone className="size-6 text-lime" strokeWidth={1.5} />
                <h3 className="mt-5 font-display text-2xl">{it.titulo}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/60">{it.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Dados com fonte conferida em 29/10/2026. Ao atualizar, mantenha a fonte e o ano ao lado do número.
const dadosIA = [
  { numero: "1 bi", texto: "de pessoas por mês já usam o Modo IA da busca do Google", fonte: "Google, 2º tri/2026" },
  { numero: "8%", texto: "clicam em algum link quando o Google mostra um resumo de IA (sem o resumo, são 15%)", fonte: "Pew Research, 2025 (EUA)" },
  { numero: "45%", texto: "dos consumidores já usam IA para achar negócios locais (um ano antes, eram 6%)", fonte: "BrightLocal, 2026 (EUA)" },
];

export function BuscaIA() {
  const entregas = [
    { icone: ScanSearch, texto: "Site rápido, com endereço, horário, serviços e preços escritos para pessoas e IAs entenderem" },
    { icone: Braces, texto: "Dados estruturados (schema.org) dizendo às buscas exatamente o que é o seu negócio e onde fica" },
    { icone: MapPin, texto: "Perfil da Empresa no Google e no Bing revisados, com nome, endereço e telefone iguais em todo lugar" },
    { icone: MessagesSquare, texto: "Páginas que respondem às perguntas que seus clientes fazem de verdade" },
    { icone: Bot, texto: "Robôs do Google, do ChatGPT e do Perplexity liberados para ler o seu site" },
  ];
  return (
    <section id="busca-ia" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <Reveal>
            <Eyebrow>A busca mudou</Eyebrow>
            <Titulo>
              Seu cliente agora pergunta para a IA. <em>Ela consegue achar você?</em>
            </Titulo>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Antes, bastava aparecer no Google. Hoje muita gente pergunta direto ao ChatGPT, ao Gemini ou ao Google com
              IA: “qual a melhor hamburgueria aqui perto?”, “tem dentista que atende sábado?”. A resposta vem pronta, com
              poucos nomes, e muita gente nem clica nos links. <strong className="text-ink">A IA só recomenda quem ela
              consegue encontrar e entender.</strong>
            </p>

            <dl className="mt-10 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-3">
              {dadosIA.map((d) => (
                <div key={d.numero} className="flex flex-col bg-card p-6">
                  <dt className="font-display text-[clamp(1.75rem,2.4vw,2.4rem)] tracking-[-0.03em] whitespace-nowrap text-forest">{d.numero}</dt>
                  <dd className="mt-3 flex-1 text-[14px] leading-snug text-ink-soft">{d.texto}</dd>
                  <dd className="mt-4 text-[11px] tracking-wide text-ink-soft/70 uppercase">{d.fonte}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1}>
            <div data-holofote className="relative h-full overflow-hidden rounded-[28px] bg-forest p-8 text-white md:p-10">
              <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,rgba(217,194,142,0.22),transparent_70%)]" />
              <div className="relative">
                <span className="text-[11px] font-medium tracking-[0.22em] text-lime uppercase">Em todo site que eu entrego</span>
                <h3 className="mt-4 font-display text-3xl leading-tight tracking-[-0.03em]">Pronto para ser encontrado pelas pessoas e pelas IAs</h3>
                <ul className="mt-7 grid gap-4">
                  {entregas.map(({ icone: Icone, texto }) => (
                    <li key={texto} className="flex gap-3.5 text-[15px] leading-snug text-white/80">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-lime">
                        <Icone className="size-4" strokeWidth={1.75} />
                      </span>
                      {texto}
                    </li>
                  ))}
                </ul>
                <Botao
                  href="/analise-ia"
                  variante="lima"
                  className="mt-9 w-full shadow-[0_0_0_1px_rgba(217,194,142,0.4),0_10px_40px_-8px_rgba(217,194,142,0.5)] sm:w-auto"
                >
                  <Sparkles className="size-5" /> Ver como a IA enxerga meu negócio
                </Botao>
                <p className="mt-3 text-xs text-white/50">Análise grátis em 30 segundos, com nota de 0 a 100 e o que corrigir.</p>
                <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/45">
                  Nenhuma IA vende lugar na resposta e ninguém pode garantir que você será citado. O que dá para fazer é tirar os
                  obstáculos e dar a ela informação clara e confiável sobre o seu negócio.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
