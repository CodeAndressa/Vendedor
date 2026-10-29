"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, Loader2, LogOut, RefreshCw, Search, TriangleAlert } from "lucide-react";
import { reais } from "@/lib/config";
import { CampoChave, useChaveAdmin } from "./chave";
import { Faturamento, SitesProducao, VisaoGeral, VisibilidadeIA } from "./central";
import { WhatsAppIcon } from "../ui";

type Situacao = "novo" | "conversando" | "proposta" | "fechou" | "perdido";
type Evento = { id: string; tipo: string; recebido_em: string; situacao?: Situacao; [campo: string]: unknown };
type Config = { onde: "redis" | "arquivo" | "nenhum"; email: boolean; asaas: boolean; ambiente: string };

const nomesSituacao: Record<Situacao, string> = {
  novo: "Novo",
  conversando: "Conversando",
  proposta: "Proposta enviada",
  fechou: "Fechou",
  perdido: "Perdido",
};
const corSituacao: Record<Situacao, string> = {
  novo: "bg-brand-soft text-brand-dark",
  conversando: "bg-sky-100 text-sky-800",
  proposta: "bg-violet-100 text-violet-800",
  fechou: "bg-forest text-lime",
  perdido: "bg-ink/8 text-ink-soft",
};

const abas = [
  { id: "lead", nome: "Leads" },
  { id: "proposta_aberta", nome: "Propostas abertas" },
  { id: "checkout", nome: "Foram pagar" },
  { id: "pagamento", nome: "Asaas" },
  { id: "todos", nome: "Tudo" },
] as const;

const nomesEventoAsaas: Record<string, string> = {
  PAYMENT_CONFIRMED: "Pagamento confirmado",
  PAYMENT_RECEIVED: "Pagamento recebido",
  PAYMENT_OVERDUE: "Pagamento atrasado",
  PAYMENT_REFUNDED: "Pagamento estornado",
  PAYMENT_DELETED: "Cobrança removida",
  SUBSCRIPTION_DELETED: "Assinatura removida",
  SUBSCRIPTION_INACTIVATED: "Assinatura inativada",
};


const secoes = [
  { id: "geral", nome: "Visão geral" },
  { id: "leads", nome: "Leads" },
  { id: "faturamento", nome: "Faturamento" },
  { id: "sites", nome: "Sites" },
  { id: "ia", nome: "IA" },
] as const;
type Secao = (typeof secoes)[number]["id"];

const texto = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

function quando(iso: string) {
  const d = new Date(iso);
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  if (min < 60 * 24) return `há ${Math.round(min / 60)} h`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const dias = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86400000;

export function PainelAdmin() {
  const admin = useChaveAdmin();
  const [dados, setDados] = useState<{ eventos: Evento[]; config: Config } | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aba, setAba] = useState<(typeof abas)[number]["id"]>("lead");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const [secao, setSecao] = useState<Secao>("geral");

  const carregar = useCallback(
    async (chave: string, lembrar = false) => {
      if (!chave) return;
      setCarregando(true);
      setErro("");
      const r = await fetch("/api/admin/eventos", { headers: { "x-admin-chave": chave }, cache: "no-store" }).catch(() => null);
      setCarregando(false);
      if (r?.status === 401) return setErro("Chave incorreta.");
      const json = r ? await r.json().catch(() => null) : null;
      if (!json?.ok) return setErro("Não consegui carregar os dados.");
      if (lembrar) admin.lembrar();
      setDados({ eventos: json.eventos, config: json.config });
    },
    [admin],
  );

  // entra direto se a chave já está salva neste navegador
  const salva = admin.salva;
  useEffect(() => {
    if (!salva) return;
    const t = setTimeout(() => carregar(salva), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salva]);

  const sair = () => {
    try {
      localStorage.removeItem("chave-admin");
    } catch {}
    location.reload();
  };

  const mudarSituacao = async (id: string, situacao: Situacao) => {
    setDados((d) => d && { ...d, eventos: d.eventos.map((e) => (e.id === id ? { ...e, situacao } : e)) });
    await fetch("/api/admin/eventos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-chave": admin.chave },
      body: JSON.stringify({ id, situacao }),
    }).catch(() => null);
  };

  const eventos = useMemo(() => dados?.eventos ?? [], [dados]);
  const numeros = useMemo(() => {
    const ultimos = eventos.filter((e) => dias(e.recebido_em) <= 30);
    const leads = ultimos.filter((e) => e.tipo === "lead");
    const fechados = leads.filter((e) => e.situacao === "fechou").length;
    const recebido = ultimos
      .filter((e) => e.tipo === "pagamento" && (e.evento === "PAYMENT_RECEIVED" || e.evento === "PAYMENT_CONFIRMED"))
      .reduce((s, e) => s + (typeof e.valor === "number" ? e.valor : 0), 0);
    return [
      { nome: "Leads", valor: String(leads.length), detalhe: `${leads.filter((e) => (e.situacao ?? "novo") === "novo").length} sem resposta` },
      { nome: "Propostas abertas", valor: String(ultimos.filter((e) => e.tipo === "proposta_aberta").length), detalhe: "clientes que abriram o link" },
      { nome: "Foram pagar", valor: String(ultimos.filter((e) => e.tipo === "checkout").length), detalhe: "abriram a cobrança" },
      { nome: "Recebido", valor: reais(recebido), detalhe: `${fechados} ${fechados === 1 ? "lead fechou" : "leads fecharam"}` },
    ];
  }, [eventos]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return eventos
      .filter((e) => aba === "todos" || e.tipo === aba)
      .filter((e) => !termo || JSON.stringify(e).toLowerCase().includes(termo));
  }, [eventos, aba, busca]);

  if (!dados)
    return (
      <main className="grid min-h-svh place-items-center bg-bg px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            carregar(admin.chave, true);
          }}
          className="w-full max-w-sm rounded-[28px] border border-line bg-card p-8 shadow-[0_40px_80px_-50px_rgba(8,30,20,0.45)]"
        >
          <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">Área restrita</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Painel de leads</h1>
          <div className="mt-6">
            <CampoChave {...admin} />
          </div>
          <button
            type="submit"
            disabled={!admin.chave || carregando}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-semibold text-bg transition hover:bg-forest disabled:opacity-40"
          >
            {carregando && <Loader2 className="size-4 animate-spin" />} Entrar
          </button>
          {erro && <p className="mt-3 text-center text-sm text-red-700">{erro}</p>}
        </form>
      </main>
    );

  const { config } = dados;
  return (
    <main className="min-h-svh bg-bg pb-20">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-5 md:px-10 xl:px-16 py-4">
          <h1 className="font-display text-xl tracking-tight">Central</h1>
          <nav className="ml-auto flex flex-wrap items-center gap-1 text-sm">
            <Link href="/proposta/nova" className="rounded-full px-3 py-2 hover:bg-bg-alt">Gerar proposta</Link>
            <Link href="/prospectar" className="rounded-full px-3 py-2 hover:bg-bg-alt">Robô de prospecção</Link>
            <button type="button" onClick={() => carregar(admin.chave)} aria-label="Atualizar" className="grid size-9 place-items-center rounded-full hover:bg-bg-alt">
              <RefreshCw className={`size-4 ${carregando ? "animate-spin" : ""}`} />
            </button>
            <button type="button" onClick={sair} aria-label="Sair" className="grid size-9 place-items-center rounded-full hover:bg-bg-alt">
              <LogOut className="size-4" />
            </button>
          </nav>
        </div>
        <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-5 pb-3 md:px-10 xl:px-16">
          {secoes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSecao(s.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${secao === s.id ? "bg-[#0A4A2B] text-white" : "text-ink-soft hover:bg-bg-alt hover:text-ink"}`}
            >
              {s.nome}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 md:px-10 xl:px-16">
        {(config.onde !== "redis" || !config.email) && (
          <div className="mt-6 grid gap-2 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-950">
            {config.onde === "arquivo" && (
              <p className="flex gap-2"><TriangleAlert className="size-4 shrink-0" /> Rodando no computador: os avisos ficam em <code>.dados/eventos.json</code>. Na Vercel, instale o Upstash Redis para guardar de verdade.</p>
            )}
            {config.onde === "nenhum" && (
              <p className="flex gap-2"><TriangleAlert className="size-4 shrink-0" /> Nenhum banco configurado: os leads só aparecem no log da Vercel. Instale o Upstash Redis em Storage na Vercel.</p>
            )}
            {!config.email && (
              <p className="flex gap-2"><TriangleAlert className="size-4 shrink-0" /> E-mail desligado: configure RESEND_API_KEY e AVISO_EMAIL_PARA para receber cada lead no seu e-mail.</p>
            )}
          </div>
        )}

        {secao === "geral" && <VisaoGeral chave={admin.chave} />}
        {secao === "faturamento" && <Faturamento chave={admin.chave} />}
        {secao === "sites" && <SitesProducao chave={admin.chave} />}
        {secao === "ia" && <VisibilidadeIA chave={admin.chave} />}
        {secao === "leads" && (
        <>
        <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {numeros.map((n) => (
            <div key={n.nome} className="rounded-3xl border border-line bg-card p-5">
              <div className="text-sm text-ink-soft">{n.nome}</div>
              <div className="mt-2 font-display text-3xl tracking-tight">{n.valor}</div>
              <div className="mt-1 text-xs text-ink-soft">{n.detalhe}</div>
            </div>
          ))}
        </section>
        <p className="mt-2 text-xs text-ink-soft">
          Últimos 30 dias · Asaas {config.asaas ? `ligado (${config.ambiente})` : "desligado"}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 rounded-full border border-line bg-card p-1">
            {abas.map((a) => {
              const qtd = a.id === "todos" ? eventos.length : eventos.filter((e) => e.tipo === a.id).length;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAba(a.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${aba === a.id ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"}`}
                >
                  {a.nome} <span className="opacity-60">{qtd}</span>
                </button>
              );
            })}
          </div>
          <label className="relative ml-auto w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nome, negócio, telefone"
              aria-label="Buscar"
              className="min-h-11 w-full rounded-full border border-line bg-card pr-4 pl-10 text-sm outline-none focus:border-brand"
            />
          </label>
        </div>

        <ul className="mt-5 grid gap-2">
          {lista.length === 0 && (
            <li className="rounded-3xl border border-dashed border-line p-10 text-center text-ink-soft">
              Nada por aqui ainda. Quando alguém fizer o diagnóstico ou abrir uma proposta, aparece aqui.
            </li>
          )}
          {lista.map((e) => {
            const situacao = e.situacao ?? "novo";
            const titulo = texto(e.nome) || nomesEventoAsaas[texto(e.evento)] || texto(e.descricao) || "Aviso";
            const sub = [texto(e.negocio), texto(e.plano), e.tipo === "pagamento" ? texto(e.descricao) : "", texto(e.origem), texto(e.dispositivo)]
              .filter(Boolean)
              .join(" · ");
            const whats = texto(e.whatsapp).replace(/\D/g, "");
            const expandido = aberto === e.id;
            const respostas = e.respostas && typeof e.respostas === "object" ? Object.entries(e.respostas as Record<string, unknown>) : [];
            return (
              <li key={e.id} className="rounded-3xl border border-line bg-card">
                <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                  <button type="button" onClick={() => setAberto(expandido ? null : e.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg-alt font-display text-ink">
                      {titulo.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{titulo}</span>
                      <span className="block truncate text-sm text-ink-soft">{sub || e.tipo}</span>
                    </span>
                    <ChevronDown className={`ml-auto size-4 shrink-0 text-ink-soft transition ${expandido ? "rotate-180" : ""}`} />
                  </button>
                  <span className="w-24 text-right text-xs text-ink-soft">{quando(e.recebido_em)}</span>
                  {typeof e.valor === "number" && <span className="font-display">{reais(e.valor)}</span>}
                  {e.tipo === "lead" && (
                    <select
                      value={situacao}
                      onChange={(ev) => mudarSituacao(e.id, ev.target.value as Situacao)}
                      aria-label="Situação"
                      className={`min-h-9 rounded-full border-0 px-3 text-sm font-medium ${corSituacao[situacao]}`}
                    >
                      {(Object.keys(nomesSituacao) as Situacao[]).map((s) => (
                        <option key={s} value={s}>{nomesSituacao[s]}</option>
                      ))}
                    </select>
                  )}
                  {whats && (
                    <a
                      href={`https://wa.me/${whats}`}
                      target="_blank"
                      rel="noopener"
                      aria-label="Chamar no WhatsApp"
                      className="grid size-9 place-items-center rounded-full bg-wa text-white"
                    >
                      <WhatsAppIcon className="size-4" />
                    </a>
                  )}
                </div>
                {expandido && (
                  <div className="grid gap-4 border-t border-line p-5 text-sm sm:grid-cols-2">
                    <dl className="grid content-start gap-2">
                      {whats && <Linha rotulo="WhatsApp" valor={whats} />}
                      {texto(e.evento) && <Linha rotulo="Evento" valor={nomesEventoAsaas[texto(e.evento)] ?? texto(e.evento)} />}
                      {texto(e.forma) && <Linha rotulo="Forma" valor={texto(e.forma)} />}
                      {texto(e.referencia) && <Linha rotulo="Referência" valor={texto(e.referencia)} />}
                      {texto(e.pagina) && <Linha rotulo="Página" valor={texto(e.pagina)} />}
                      <Linha rotulo="Recebido" valor={new Date(e.recebido_em).toLocaleString("pt-BR")} />
                      {[texto(e.proposta), texto(e.link)].filter(Boolean).map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-semibold text-brand">
                          <ExternalLink className="size-4" /> {url.includes("/proposta") ? "Abrir proposta" : "Abrir link"}
                        </a>
                      ))}
                    </dl>
                    {respostas.length > 0 && (
                      <dl className="grid content-start gap-2 rounded-2xl bg-bg-alt p-4">
                        <dt className="text-xs font-semibold tracking-wider text-ink-soft uppercase">Respostas do diagnóstico</dt>
                        {respostas.map(([k, v]) => (
                          <Linha key={k} rotulo={k} valor={Array.isArray(v) ? v.join(", ") : texto(v)} />
                        ))}
                      </dl>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        </>
        )}
      </div>
    </main>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-ink-soft capitalize">{rotulo}</dt>
      <dd className="min-w-0 break-words">{valor}</dd>
    </div>
  );
}
