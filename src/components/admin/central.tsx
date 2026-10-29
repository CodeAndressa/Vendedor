"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Bot, CircleCheck, CircleX, ExternalLink, Globe, Loader2, Plus, RefreshCw, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { reais } from "@/lib/config";

// Abas da central do painel: visão geral (funil), faturamento, sites em produção e visibilidade na IA.

function useDados<T>(chave: string, url: string) {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const carregar = useCallback(
    async (opcoes?: { metodo?: "GET" | "POST"; corpo?: object; sufixo?: string }) => {
      setCarregando(true);
      setErro("");
      const r = await fetch(url + (opcoes?.sufixo ?? ""), {
        method: opcoes?.metodo ?? "GET",
        headers: { "x-admin-chave": chave, "Content-Type": "application/json" },
        body: opcoes?.corpo ? JSON.stringify(opcoes.corpo) : undefined,
        cache: "no-store",
      }).catch(() => null);
      const json = r ? await r.json().catch(() => null) : null;
      setCarregando(false);
      if (!json?.ok) return setErro(json?.erro ?? "Não consegui carregar.");
      setDados(json as T);
    },
    [chave, url],
  );
  useEffect(() => {
    const t = setTimeout(() => carregar(), 0);
    return () => clearTimeout(t);
  }, [carregar]);
  return { dados, carregando, erro, carregar };
}

const numero = (n: number) => n.toLocaleString("pt-BR");
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");

function Cartao({ titulo, valor, detalhe, destaque = false }: { titulo: string; valor: string; detalhe?: string; destaque?: boolean }) {
  return (
    <div className={`rounded-3xl border p-5 ${destaque ? "border-transparent bg-forest text-white" : "border-line bg-card"}`}>
      <div className={`text-sm ${destaque ? "text-white/60" : "text-ink-soft"}`}>{titulo}</div>
      <div className="mt-2 font-display text-3xl tracking-tight">{valor}</div>
      {detalhe && <div className={`mt-1 text-xs ${destaque ? "text-lime" : "text-ink-soft"}`}>{detalhe}</div>}
    </div>
  );
}

function Bloco({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg tracking-tight">{titulo}</h2>
        {acao}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Barras({ itens, rotulo }: { itens: { nome: string; valor: number; extra?: string }[]; rotulo?: string }) {
  if (!itens.length) return <p className="text-sm text-ink-soft">Nada no período ainda.</p>;
  const maximo = Math.max(...itens.map((i) => i.valor), 1);
  return (
    <ul className="grid gap-2.5">
      {itens.slice(0, 10).map((i) => (
        <li key={i.nome} className="grid grid-cols-[1fr_auto] items-center gap-x-3 text-sm">
          <span className="truncate capitalize">{i.nome}</span>
          <span className="font-semibold tabular-nums">
            {numero(i.valor)}
            {rotulo ? ` ${rotulo}` : ""}
            {i.extra && <span className="ml-2 font-normal text-ink-soft">{i.extra}</span>}
          </span>
          <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-bg-alt">
            <span className="block h-full rounded-full bg-brand" style={{ width: `${(i.valor / maximo) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Erro({ texto }: { texto: string }) {
  return texto ? <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{texto}</p> : null;
}

// ---------- visão geral ----------

type Central = {
  onde: string;
  serie: { dia: string; visitas: number; visitantes: number; robosIA: number }[];
  resumo: { visitas: number; visitantes: number; robosIA: number; visitasIA: number; engajadas: number; medicoes: number; tempoMedio: number; rolagemMedia: number };
  funil: { etapa: string; valor: number }[];
  paginas: { nome: string; valor: number; tempoMedio: number }[];
  origens: { nome: string; valor: number }[];
  fontesIA: { nome: string; valor: number }[];
  robos: { nome: string; valor: number }[];
  paginasLidasPorIA: { nome: string; valor: number }[];
  eventos: Record<string, number>;
};

export function VisaoGeral({ chave }: { chave: string }) {
  const [dias, setDias] = useState(30);
  const { dados, carregando, erro, carregar } = useDados<Central>(chave, `/api/admin/central?dias=${dias}`);
  if (!dados) return carregando ? <Carregando /> : <Erro texto={erro} />;
  const r = dados.resumo;
  const maxSerie = Math.max(...dados.serie.map((s) => s.visitas), 1);
  const maxFunil = Math.max(...dados.funil.map((f) => f.valor), 1);
  const minutos = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}min ${s % 60}s` : `${s}s`);

  return (
    <div className="mt-6 grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((d) => (
          <button key={d} type="button" onClick={() => setDias(d)} className={`rounded-full px-4 py-2 text-sm font-medium ${dias === d ? "bg-ink text-bg" : "border border-line bg-card text-ink-soft"}`}>
            {d} dias
          </button>
        ))}
        <button type="button" onClick={() => carregar()} aria-label="Atualizar" className="ml-auto grid size-9 place-items-center rounded-full border border-line bg-card">
          <RefreshCw className={`size-4 ${carregando ? "animate-spin" : ""}`} />
        </button>
      </div>
      {dados.onde !== "redis" && (
        <p className="rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-950">
          {dados.onde === "arquivo" ? "Rodando no computador: estes números são só dos seus testes locais." : "Sem banco (Upstash Redis) no site publicado: as métricas ainda não estão sendo guardadas."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cartao titulo="Robôs de IA leram seu site" valor={numero(r.robosIA)} detalhe="ChatGPT, Perplexity, Claude e outros" destaque />
        <Cartao titulo="Visitas" valor={numero(r.visitas)} detalhe={`${numero(r.visitantes)} visitantes únicos`} />
        <Cartao titulo="Vieram de uma IA" valor={numero(r.visitasIA)} detalhe={`${pct(r.visitasIA, r.visitas)} das visitas`} />
        <Cartao titulo="Engajamento" valor={pct(r.engajadas, r.medicoes)} detalhe={`tempo médio ${minutos(r.tempoMedio)} · rolagem ${r.rolagemMedia}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Bloco titulo="Funil">
          <ul className="grid gap-2">
            {dados.funil.map((f, i) => {
              const anterior = i > 0 ? dados.funil[i - 1].valor : 0;
              return (
                <li key={f.etapa} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 text-sm">
                  <span>{f.etapa}</span>
                  <span className="text-xs text-ink-soft">{i > 0 && anterior ? pct(f.valor, anterior) : ""}</span>
                  <span className="w-14 text-right font-display text-base tabular-nums">{numero(f.valor)}</span>
                  <span className="col-span-3 h-2 overflow-hidden rounded-full bg-bg-alt">
                    <span className="block h-full rounded-full bg-gradient-to-r from-[#0A4A2B] to-brand" style={{ width: `${Math.max((f.valor / maxFunil) * 100, f.valor ? 2 : 0)}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </Bloco>
        <Bloco titulo="Visitas por dia">
          <div className="flex h-44 items-end gap-[3px]">
            {dados.serie.map((s) => (
              <div key={s.dia} className="group relative flex-1" title={`${s.dia}: ${s.visitas} visitas, ${s.visitantes} visitantes, ${s.robosIA} robôs de IA`}>
                <div className="rounded-t-sm bg-brand/80 transition group-hover:bg-brand" style={{ height: `${(s.visitas / maxSerie) * 160 + (s.visitas ? 4 : 1)}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-ink-soft">
            <span>{dados.serie[0]?.dia.slice(5).split("-").reverse().join("/")}</span>
            <span>hoje</span>
          </div>
        </Bloco>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Bloco titulo="Páginas mais vistas">
          <Barras itens={dados.paginas.map((p) => ({ nome: p.nome, valor: p.valor, extra: p.tempoMedio ? `${p.tempoMedio}s` : undefined }))} />
        </Bloco>
        <Bloco titulo="De onde vieram">
          <Barras itens={dados.origens} />
        </Bloco>
        <Bloco titulo="Quais IAs mandaram visitas">
          <Barras itens={dados.fontesIA} />
        </Bloco>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Bloco titulo="Robôs que leram o site">
          <Barras itens={dados.robos} />
        </Bloco>
        <Bloco titulo="Páginas que as IAs mais leram">
          <Barras itens={dados.paginasLidasPorIA} />
        </Bloco>
      </div>
      <p className="text-xs text-ink-soft">
        Nenhuma IA informa quantas vezes mostrou a sua marca. Aqui você vê o que dá para medir de verdade: robôs de IA lendo o site,
        visitas que chegaram por um link dentro de uma IA e o teste semanal de citação (aba IA).
      </p>
    </div>
  );
}

// ---------- faturamento ----------

type Financeiro = {
  configurado: boolean;
  ambiente: string;
  saldo: number | null;
  recebidoMes: number;
  recebidoMesAnterior: number;
  aReceber: number;
  atrasado: number;
  atrasadas: { cliente: string; valor: number; vencimento?: string; descricao?: string; link?: string }[];
  mrr: number;
  assinaturasAtivas: number;
  clientesAtivos: { nome: string; assinatura: number; ultimoPagamento?: string; desde?: string }[];
  porMes: { mes: string; valor: number }[];
  ultimos: { cliente: string; valor: number; data?: string; forma?: string; descricao?: string }[];
  erro?: string;
  atualizadoEm: string;
};

const nomeMes = (m: string) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
const dataCurta = (d?: string) => (d ? d.slice(0, 10).split("-").reverse().join("/") : "");

export function Faturamento({ chave }: { chave: string }) {
  const { dados, carregando, erro, carregar } = useDados<Financeiro>(chave, "/api/admin/financeiro");
  if (!dados) return carregando ? <Carregando /> : <Erro texto={erro} />;
  if (!dados.configurado) return <Erro texto="O Asaas não está configurado (ASAAS_API_KEY)." />;
  const maximo = Math.max(...dados.porMes.map((m) => m.valor), 1);
  const variacao = dados.recebidoMesAnterior ? Math.round(((dados.recebidoMes - dados.recebidoMesAnterior) / dados.recebidoMesAnterior) * 100) : null;

  return (
    <div className="mt-6 grid gap-4">
      <div className="flex items-center gap-2 text-xs text-ink-soft">
        Direto do Asaas ({dados.ambiente}) · atualizado {new Date(dados.atualizadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        <button type="button" onClick={() => carregar({ sufixo: "?atualizar=1" })} aria-label="Atualizar" className="ml-auto grid size-9 place-items-center rounded-full border border-line bg-card">
          <RefreshCw className={`size-4 ${carregando ? "animate-spin" : ""}`} />
        </button>
      </div>
      {dados.erro && <Erro texto={`Asaas: ${dados.erro}`} />}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Cartao titulo="Saldo no Asaas" valor={dados.saldo === null ? "—" : reais(dados.saldo)} detalhe="disponível para saque" destaque />
        <Cartao titulo="Recebido no mês" valor={reais(dados.recebidoMes)} detalhe={variacao === null ? "primeiro mês com vendas" : `${variacao >= 0 ? "+" : ""}${variacao}% contra o mês passado`} />
        <Cartao titulo="Receita recorrente (MRR)" valor={reais(dados.mrr)} detalhe={`${dados.assinaturasAtivas} assinaturas ativas`} />
        <Cartao titulo="A receber" valor={reais(dados.aReceber)} detalhe="cobranças em aberto" />
        <Cartao titulo="Em atraso" valor={reais(dados.atrasado)} detalhe={`${dados.atrasadas.length} cobranças vencidas`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Bloco titulo="Faturamento dos últimos 6 meses">
          <div className="flex h-44 items-end gap-3">
            {dados.porMes.map((m) => (
              <div key={m.mes} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] text-ink-soft tabular-nums">{m.valor ? reais(m.valor).replace(",00", "") : ""}</span>
                <div className="w-full rounded-t-lg bg-brand/85" style={{ height: `${(m.valor / maximo) * 120 + (m.valor ? 4 : 2)}px` }} />
                <span className="text-xs text-ink-soft capitalize">{nomeMes(m.mes)}</span>
              </div>
            ))}
          </div>
        </Bloco>
        <Bloco titulo={`Clientes ativos (${dados.clientesAtivos.length})`}>
          {dados.clientesAtivos.length ? (
            <ul className="divide-y divide-line text-sm">
              {dados.clientesAtivos.map((c) => (
                <li key={c.nome + c.desde} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate">{c.nome}</span>
                  <span className="text-right text-ink-soft">
                    {c.assinatura ? <strong className="text-ink">{reais(c.assinatura)}/mês</strong> : `pagou em ${dataCurta(c.ultimoPagamento)}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">Ainda nenhum. Cliente ativo é quem tem assinatura ativa ou pagou nos últimos 90 dias.</p>
          )}
        </Bloco>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Bloco titulo="Últimos pagamentos">
          {dados.ultimos.length ? (
            <ul className="divide-y divide-line text-sm">
              {dados.ultimos.map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate">{p.cliente}</span>
                    <span className="block truncate text-xs text-ink-soft">{p.descricao}</span>
                  </span>
                  <span className="text-right">
                    <strong className="block">{reais(p.valor)}</strong>
                    <span className="text-xs text-ink-soft">{dataCurta(p.data)} · {p.forma}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">Nenhum pagamento nos últimos 6 meses.</p>
          )}
        </Bloco>
        <Bloco titulo="Em atraso">
          {dados.atrasadas.length ? (
            <ul className="divide-y divide-line text-sm">
              {dados.atrasadas.map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate">{p.cliente}</span>
                    <span className="block text-xs text-red-700">venceu em {dataCurta(p.vencimento)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <strong>{reais(p.valor)}</strong>
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener" aria-label="Abrir cobrança" className="text-brand">
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">Nenhuma cobrança atrasada. 🎉</p>
          )}
        </Bloco>
      </div>
    </div>
  );
}

// ---------- sites em produção ----------

type Sites = {
  sites: { url: string; nome: string; plano?: string }[];
  verificacoes: Record<string, { noAr: boolean; status: number | null; ms: number | null; https: boolean; diasCertificado?: number; erro?: string; verificadoEm: string }>;
};

export function SitesProducao({ chave }: { chave: string }) {
  const { dados, carregando, erro, carregar } = useDados<Sites>(chave, "/api/admin/sites");
  const [url, setUrl] = useState("");
  const [nome, setNome] = useState("");
  if (!dados) return carregando ? <Carregando /> : <Erro texto={erro} />;
  const noAr = dados.sites.filter((s) => dados.verificacoes[s.url]?.noAr).length;

  return (
    <div className="mt-6 grid gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cartao titulo="Sites monitorados" valor={String(dados.sites.length)} destaque />
        <Cartao titulo="No ar" valor={`${noAr}/${dados.sites.length}`} detalhe={noAr === dados.sites.length ? "tudo funcionando" : "tem site com problema"} />
        <Cartao
          titulo="Mais lento"
          valor={`${Math.max(0, ...Object.values(dados.verificacoes).map((v) => v.ms ?? 0))} ms`}
          detalhe="tempo de resposta"
        />
        <Cartao
          titulo="Certificado mais perto de vencer"
          valor={`${Math.min(999, ...Object.values(dados.verificacoes).map((v) => v.diasCertificado ?? 999))} dias`}
          detalhe="a Vercel renova sozinha"
        />
      </div>
      <Bloco
        titulo="Sites em produção"
        acao={
          <button type="button" onClick={() => carregar({ metodo: "POST", corpo: { acao: "verificar" } })} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium">
            {carregando ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Verificar agora
          </button>
        }
      >
        <ul className="divide-y divide-line">
          {dados.sites.map((s) => {
            const v = dados.verificacoes[s.url];
            return (
              <li key={s.url} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                {v ? v.noAr ? <CircleCheck className="size-5 text-brand" /> : <CircleX className="size-5 text-red-600" /> : <Globe className="size-5 text-ink-soft" />}
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{s.nome}</span>
                  <a href={s.url} target="_blank" rel="noopener" className="text-xs text-ink-soft hover:text-brand">{s.url.replace("https://", "")}</a>
                </span>
                {v && (
                  <span className="flex flex-wrap items-center gap-3 text-xs text-ink-soft">
                    <span>{v.noAr ? `${v.ms} ms` : v.erro}</span>
                    {v.https && <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5 text-brand" /> {v.diasCertificado ?? "?"} dias</span>}
                    <span>{new Date(v.verificadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                  </span>
                )}
                <button type="button" onClick={() => carregar({ metodo: "POST", corpo: { acao: "remover", url: s.url } })} aria-label={`Remover ${s.nome}`} className="grid size-8 place-items-center rounded-full text-ink-soft hover:bg-bg-alt hover:text-red-700">
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!url.trim()) return;
            carregar({ metodo: "POST", corpo: { acao: "adicionar", url, nome } });
            setUrl("");
            setNome("");
          }}
          className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do cliente" className="min-h-11 rounded-full border border-line bg-bg px-4 text-sm outline-none focus:border-brand" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="site.com.br" className="min-h-11 rounded-full border border-line bg-bg px-4 text-sm outline-none focus:border-brand" />
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg">
            <Plus className="size-4" /> Adicionar
          </button>
        </form>
        {erro && <Erro texto={erro} />}
      </Bloco>
      <p className="text-xs text-ink-soft">Todo dia às 8h a lista é verificada sozinha. Se um site cair, voltar ou o certificado estiver para vencer, você recebe um e-mail.</p>
    </div>
  );
}

// ---------- visibilidade na IA ----------

type Testes = { testes: { data: string; perguntas: { pergunta: string; indicados: string[]; apareceu: boolean }[]; conhece: boolean; descricao: string }[] };

export function VisibilidadeIA({ chave }: { chave: string }) {
  const { dados, carregando, erro, carregar } = useDados<Testes>(chave, "/api/admin/visibilidade");
  if (!dados) return carregando ? <Carregando /> : <Erro texto={erro} />;
  const [ultimo, ...anteriores] = dados.testes;
  const citacoes = (t: Testes["testes"][number]) => t.perguntas.filter((p) => p.apareceu).length;

  return (
    <div className="mt-6 grid gap-4">
      <Bloco
        titulo="A IA recomenda você?"
        acao={
          <button type="button" onClick={() => carregar({ metodo: "POST" })} disabled={carregando} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">
            {carregando ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Testar agora
          </button>
        }
      >
        {ultimo ? (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <Cartao titulo="Citada nas perguntas" valor={`${citacoes(ultimo)}/${ultimo.perguntas.length}`} detalhe={`teste de ${dataCurta(ultimo.data)}`} destaque />
              <Cartao titulo="A IA sabe quem você é" valor={ultimo.conhece ? "Sim" : "Ainda não"} detalhe={ultimo.descricao || "sem informação confiável"} />
              <Cartao titulo="Testes feitos" valor={String(dados.testes.length)} detalhe="automático toda segunda-feira" />
            </div>
            <ul className="mt-5 grid gap-3">
              {ultimo.perguntas.map((p) => (
                <li key={p.pergunta} className="rounded-2xl bg-bg-alt p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Bot className="mt-0.5 size-4 shrink-0 text-ink-soft" />
                    <span className="flex-1">“{p.pergunta}”</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.apareceu ? "bg-brand-soft text-brand-dark" : "bg-red-100 text-red-800"}`}>{p.apareceu ? "Citada" : "Não citada"}</span>
                  </div>
                  <p className="mt-2 pl-6 text-ink-soft">{p.indicados.length ? `Indicou: ${p.indicados.join(", ")}` : "A IA não indicou ninguém com segurança."}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-ink-soft">Nenhum teste ainda. Clique em “Testar agora”.</p>
        )}
      </Bloco>
      {anteriores.length > 0 && (
        <Bloco titulo="Evolução">
          <ul className="divide-y divide-line text-sm">
            {dados.testes.map((t) => (
              <li key={t.data} className="flex justify-between py-2.5">
                <span>{dataCurta(t.data)}</span>
                <span>
                  {citacoes(t)}/{t.perguntas.length} citações · {t.conhece ? "conhece" : "não conhece"}
                </span>
              </li>
            ))}
          </ul>
        </Bloco>
      )}
      <p className="text-xs text-ink-soft">
        É um termômetro feito com um modelo de IA sem busca ao vivo: mostra o que as IAs já aprenderam sobre o mercado. Sobe com
        domínio próprio, Perfil da Empresa no Google, avaliações, presença no Bing e links de outros sites para o seu.
      </p>
    </div>
  );
}

function Carregando() {
  return (
    <div className="mt-10 grid place-items-center text-ink-soft">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
