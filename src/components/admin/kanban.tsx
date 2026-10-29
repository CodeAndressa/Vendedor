"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { Cartao, Coluna } from "@/lib/kanban";
import { WhatsAppIcon } from "../ui";

// Kanban de leads da aba Leads: arrastar entre colunas (computador), abas por coluna (celular),
// painel do cartão com notas, histórico e proposta montada pela IA.

type Origem = Cartao["origem"];
type Resposta = { ok: boolean; erro?: string; cartoes?: Cartao[]; colunas?: { id: Coluna; nome: string }[]; criados?: number; atualizados?: number };

const nomesOrigem: Record<Origem, string> = { robo: "Robô", site: "Site", "analise-ia": "Análise IA", manual: "Manual" };
const corOrigem: Record<Origem, string> = {
  robo: "bg-forest text-lime",
  site: "bg-brand-soft text-brand-dark",
  "analise-ia": "bg-lime/30 text-[#7A5E2A]",
  manual: "bg-bg-alt text-ink-soft",
};
const nomesSite = { "sem-site": "Sem site", "so-rede-social": "Só rede social", "tem-site": "Tem site" } as const;
const campo = "min-h-11 w-full rounded-xl border border-line bg-bg px-3.5 text-sm outline-none transition focus:border-brand";

// Selos que mostram vontade de comprar ganham destaque
const ehQuente = (s: string) => s.startsWith("clicou") || s === "começou o pagamento" || s === "pagou";

export function relativo(iso?: string) {
  if (!iso) return "";
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  if (min < 60 * 24) return `há ${Math.round(min / 60)} h`;
  const d = Math.round(min / 1440);
  if (d < 30) return d === 1 ? "ontem" : `há ${d} dias`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const cidade = (endereco?: string) => (endereco ? endereco.split(",").slice(-2).join(",").replace(/\s*-\s*[A-Z]{2}$/, "").trim() : "");

export function Kanban({ chave }: { chave: string }) {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [colunas, setColunas] = useState<{ id: Coluna; nome: string }[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [origem, setOrigem] = useState<Origem | "todas">("todas");
  const [aberto, setAberto] = useState<string | null>(null);
  const [escolhida, setColunaMovel] = useState<Coluna | null>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Coluna | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);

  // Chama a API do kanban; com corpo é POST. Atualiza a lista com o que voltar.
  const api = useCallback(
    async (corpo?: Record<string, unknown>): Promise<Resposta> => {
      const r = await fetch("/api/admin/kanban", {
        method: corpo ? "POST" : "GET",
        headers: { "x-admin-chave": chave, "Content-Type": "application/json" },
        body: corpo ? JSON.stringify(corpo) : undefined,
        cache: "no-store",
      }).catch(() => null);
      const json = ((r ? await r.json().catch(() => null) : null) ?? { ok: false, erro: "Não consegui falar com o servidor." }) as Resposta;
      if (json.ok && json.cartoes) setCartoes(json.cartoes);
      if (json.colunas) setColunas(json.colunas);
      return json;
    },
    [chave],
  );

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    const r = await api();
    setCarregando(false);
    if (!r.ok) setErro(r.erro ?? "Não consegui carregar o kanban.");
  }, [api]);

  useEffect(() => {
    const t = setTimeout(() => carregar(), 0);
    return () => clearTimeout(t);
  }, [carregar]);

  const mover = async (id: string, coluna: Coluna) => {
    const atual = cartoes.find((c) => c.id === id);
    if (!atual || atual.coluna === coluna) return;
    setCartoes((lista) => lista.map((c) => (c.id === id ? { ...c, coluna } : c)));
    const r = await api({ acao: "mover", id, coluna });
    if (!r.ok) {
      setErro(r.erro ?? "Não consegui mover.");
      carregar();
    }
  };

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return cartoes
      .filter((c) => origem === "todas" || c.origem === origem)
      .filter((c) => !termo || [c.negocio, c.contato, c.categoria, c.endereco, c.whatsapp, c.email, c.telefoneVisivel].join(" ").toLowerCase().includes(termo));
  }, [cartoes, busca, origem]);

  const porColuna = (id: Coluna) => filtrados.filter((c) => c.coluna === id);
  // no celular abre na primeira coluna com cartões, até ela escolher outra
  const colunaMovel = escolhida ?? colunas.find((c) => porColuna(c.id).length)?.id ?? "novos";
  const cartaoAberto = cartoes.find((c) => c.id === aberto) ?? null;
  const quentes = cartoes.filter((c) => c.selos?.some(ehQuente) && c.coluna !== "fechou" && c.coluna !== "perdido").length;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Kanban de leads</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            {cartoes.length} {cartoes.length === 1 ? "lead" : "leads"}
            {quentes > 0 && <span className="font-semibold text-[#7A5E2A]"> · {quentes} {quentes === 1 ? "quente" : "quentes"} esperando você</span>}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => carregar()} aria-label="Atualizar kanban" className="grid size-10 place-items-center rounded-full border border-line bg-card">
            <RefreshCw className={`size-4 ${carregando ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => setNovoAberto((v) => !v)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-bg">
            <Plus className="size-4" /> Adicionar lead
          </button>
        </div>
      </div>

      {novoAberto && <NovoLead api={api} fechar={() => setNovoAberto(false)} />}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar negócio, cidade, telefone"
            aria-label="Buscar no kanban"
            className="min-h-11 w-full rounded-full border border-line bg-card pr-4 pl-10 text-sm outline-none focus:border-brand"
          />
        </label>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-card p-1">
          {(["todas", "robo", "site", "analise-ia", "manual"] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOrigem(o)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${origem === o ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"}`}
            >
              {o === "todas" ? "Todas" : nomesOrigem[o]}
            </button>
          ))}
        </div>
      </div>

      {erro && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{erro}</p>}
      {!colunas.length && carregando && (
        <div className="mt-10 grid place-items-center text-ink-soft">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}

      {/* computador: colunas lado a lado, arrastar e soltar */}
      <div className="-mx-5 mt-5 hidden gap-3 overflow-x-auto px-5 pb-4 md:-mx-10 md:flex md:px-10 xl:-mx-16 xl:px-16">
        {colunas.map((col) => {
          const lista = porColuna(col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (sobre !== col.id) setSobre(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setSobre(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain") || arrastando;
                setSobre(null);
                setArrastando(null);
                if (id) mover(id, col.id);
              }}
              className={`flex w-72 shrink-0 flex-col rounded-3xl border p-2.5 transition ${sobre === col.id ? "border-brand bg-brand-soft/60" : "border-line bg-bg-alt/60"}`}
            >
              <CabecaColuna nome={col.nome} qtd={lista.length} id={col.id} />
              <ul className="mt-2 grid min-h-24 content-start gap-2">
                {lista.map((c) => (
                  <li
                    key={c.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", c.id);
                      e.dataTransfer.effectAllowed = "move";
                      setArrastando(c.id);
                    }}
                    onDragEnd={() => {
                      setArrastando(null);
                      setSobre(null);
                    }}
                    className={`cursor-grab active:cursor-grabbing ${arrastando === c.id ? "opacity-40" : ""}`}
                  >
                    <CartaoLead c={c} abrir={() => setAberto(c.id)} />
                  </li>
                ))}
                {lista.length === 0 && <li className="rounded-2xl border border-dashed border-line p-4 text-center text-xs text-ink-soft">Solte um cartão aqui</li>}
              </ul>
            </div>
          );
        })}
      </div>

      {/* celular: uma coluna por vez */}
      <div className="mt-5 md:hidden">
        <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-2">
          {colunas.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setColunaMovel(col.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium ${colunaMovel === col.id ? "bg-[#0A4A2B] text-white" : "border border-line bg-card text-ink-soft"}`}
            >
              {col.nome} <span className="opacity-60">{porColuna(col.id).length}</span>
            </button>
          ))}
        </div>
        <ul className="mt-2 grid gap-2">
          {porColuna(colunaMovel).map((c) => (
            <li key={c.id}>
              <CartaoLead c={c} abrir={() => setAberto(c.id)} />
              <label className="mt-1 flex items-center justify-end gap-2 px-2 text-xs text-ink-soft">
                Mover para
                <select value={c.coluna} onChange={(e) => mover(c.id, e.target.value as Coluna)} className="min-h-9 rounded-full border border-line bg-card px-3 text-xs font-medium text-ink">
                  {colunas.map((col) => (
                    <option key={col.id} value={col.id}>{col.nome}</option>
                  ))}
                </select>
              </label>
            </li>
          ))}
          {colunas.length > 0 && porColuna(colunaMovel).length === 0 && (
            <li className="rounded-3xl border border-dashed border-line p-8 text-center text-sm text-ink-soft">Nenhum lead nesta coluna.</li>
          )}
        </ul>
      </div>

      <AnimatePresence>
        {cartaoAberto && <PainelCartao key={cartaoAberto.id} c={cartaoAberto} colunas={colunas} api={api} mover={mover} fechar={() => setAberto(null)} />}
      </AnimatePresence>
    </section>
  );
}

function CabecaColuna({ nome, qtd, id }: { nome: string; qtd: number; id: Coluna }) {
  const ponto = id === "fechou" ? "bg-brand" : id === "perdido" ? "bg-ink-soft/50" : id === "novos" ? "bg-lime" : "bg-[#0A4A2B]/60";
  return (
    <div className="flex items-center gap-2 px-2 pt-1">
      <span className={`size-2 rounded-full ${ponto}`} />
      <span className="text-sm font-semibold">{nome}</span>
      <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-ink-soft tabular-nums">{qtd}</span>
    </div>
  );
}

function SeloOrigem({ origem }: { origem: Origem }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${corOrigem[origem]}`}>{nomesOrigem[origem]}</span>;
}

function Selo({ texto }: { texto: string }) {
  const quente = ehQuente(texto);
  const cor = texto === "pagou" ? "bg-forest text-lime" : quente ? "bg-lime text-forest" : "bg-bg-alt text-ink-soft";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cor}`}>
      {quente && <Flame className="size-3" />}
      {texto}
    </span>
  );
}

function CartaoLead({ c, abrir }: { c: Cartao; abrir: () => void }) {
  const selos = c.selos ?? [];
  const quente = selos.some(ehQuente);
  // quentes primeiro, e no máximo 3 no cartão
  const visiveis = [...selos].sort((a, b) => Number(ehQuente(b)) - Number(ehQuente(a))).slice(0, 3);
  const local = [c.categoria, cidade(c.endereco)].filter(Boolean).join(" · ");
  return (
    <button
      type="button"
      onClick={abrir}
      className={`block w-full rounded-2xl border bg-card p-3.5 text-left transition hover:shadow-[0_12px_30px_-20px_rgba(8,30,20,0.5)] ${quente ? "border-lime ring-2 ring-lime/40" : "border-line"}`}
    >
      <span className="flex items-start gap-2">
        <span className="min-w-0 flex-1 font-semibold leading-snug">{c.negocio}</span>
        <SeloOrigem origem={c.origem} />
      </span>
      {local && <span className="mt-1 block truncate text-xs text-ink-soft">{local}</span>}
      {visiveis.length > 0 && (
        <span className="mt-2 flex flex-wrap gap-1">
          {visiveis.map((s) => (
            <Selo key={s} texto={s} />
          ))}
          {selos.length > 3 && <span className="px-1 text-[11px] text-ink-soft">+{selos.length - 3}</span>}
        </span>
      )}
      <span className="mt-2 flex items-center gap-2 text-[11px] text-ink-soft">
        {c.proposta && <span className="inline-flex items-center gap-1 text-brand"><Sparkles className="size-3" /> proposta pronta</span>}
        {(c.notas?.length ?? 0) > 0 && <span>{c.notas!.length} {c.notas!.length === 1 ? "nota" : "notas"}</span>}
        <span className="ml-auto">{relativo(c.atualizadoEm)}</span>
      </span>
    </button>
  );
}

// ---------- adicionar lead manual ----------

function NovoLead({ api, fechar }: { api: (corpo: Record<string, unknown>) => Promise<Resposta>; fechar: () => void }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [categoria, setCategoria] = useState("");
  const [endereco, setEndereco] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!nome.trim()) return setErro("Escreva o nome do negócio.");
        setSalvando(true);
        setErro("");
        const r = await api({ acao: "adicionar", cartoes: [{ nome, telefone, categoria, endereco, origem: "manual" }] });
        setSalvando(false);
        if (!r.ok) return setErro(r.erro ?? "Não consegui adicionar.");
        fechar();
      }}
      className="mt-4 grid gap-3 rounded-3xl border border-line bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">Novo lead</h3>
        <button type="button" onClick={fechar} aria-label="Fechar" className="grid size-9 place-items-center rounded-full hover:bg-bg-alt">
          <X className="size-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1 text-xs font-semibold text-ink-soft">
          Nome do negócio
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={campo} autoFocus />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink-soft">
          WhatsApp
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(41) 99999-0000" inputMode="tel" className={campo} />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink-soft">
          Categoria
          <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Pizzaria, dentista…" className={campo} />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink-soft">
          Endereço (opcional)
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, bairro, cidade" className={campo} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={salvando} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white disabled:opacity-50">
          {salvando ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Adicionar
        </button>
        <span className="text-xs text-ink-soft">Entra na coluna “Prospectados”.</span>
        {erro && <span className="text-sm font-semibold text-red-700">{erro}</span>}
      </div>
    </form>
  );
}

// ---------- painel do cartão ----------

function PainelCartao({
  c,
  colunas,
  api,
  mover,
  fechar,
}: {
  c: Cartao;
  colunas: { id: Coluna; nome: string }[];
  api: (corpo: Record<string, unknown>) => Promise<Resposta>;
  mover: (id: string, coluna: Coluna) => Promise<void>;
  fechar: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [contato, setContato] = useState(c.contato ?? "");
  const [whatsapp, setWhatsapp] = useState(c.whatsapp ?? "");
  const [nota, setNota] = useState("");
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [ocupado, setOcupado] = useState<"" | "editar" | "nota" | "excluir" | "proposta" | "email">("");
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [email, setEmail] = useState(c.email ?? "");
  const [copiado, setCopiado] = useState(false);

  // fecha com Esc
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [fechar]);

  const acao = async (tipo: typeof ocupado, corpo: Record<string, unknown>, sucesso?: string) => {
    setOcupado(tipo);
    setAviso(null);
    const r = await api({ ...corpo, id: c.id });
    setOcupado("");
    if (!r.ok) setAviso({ ok: false, texto: r.erro ?? "Não deu certo. Tente de novo." });
    else if (sucesso) setAviso({ ok: true, texto: sucesso });
    return r.ok;
  };

  const numero = c.whatsapp?.replace(/\D/g, "");
  const nomeColuna = (id?: Coluna) => colunas.find((x) => x.id === id)?.nome ?? id ?? "";

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fechar} className="fixed inset-0 z-40 bg-forest/40 backdrop-blur-[2px]" />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={c.negocio}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-bg shadow-[-30px_0_80px_-40px_rgba(8,30,20,0.6)]"
      >
        <header className="flex items-start gap-3 border-b border-line bg-card px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeloOrigem origem={c.origem} />
              <span className="text-xs text-ink-soft">criado {relativo(c.criadoEm)}</span>
            </div>
            <h3 className="mt-1 font-display text-2xl leading-tight tracking-tight">{c.negocio}</h3>
            {(c.selos?.length ?? 0) > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {c.selos!.map((s) => (
                  <Selo key={s} texto={s} />
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={fechar} aria-label="Fechar" className="grid size-10 shrink-0 place-items-center rounded-full border border-line">
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-4">
            <label className="flex items-center gap-3 text-sm font-semibold">
              Mover para
              <select value={c.coluna} onChange={(e) => mover(c.id, e.target.value as Coluna)} className="min-h-10 flex-1 rounded-full border border-line bg-card px-4 text-sm font-medium">
                {colunas.map((col) => (
                  <option key={col.id} value={col.id}>{col.nome}</option>
                ))}
              </select>
            </label>

            {aviso && <p className={`rounded-2xl p-3 text-sm ${aviso.ok ? "bg-brand-soft text-brand-dark" : "bg-red-50 text-red-800"}`}>{aviso.texto}</p>}

            {/* dados e links */}
            <Caixa
              titulo="Dados"
              acao={
                !editando && (
                  <button type="button" onClick={() => setEditando(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    <Pencil className="size-3.5" /> Editar
                  </button>
                )
              }
            >
              {editando ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (await acao("editar", { acao: "editar", contato, whatsapp }, "Contato salvo.")) setEditando(false);
                  }}
                  className="grid gap-3"
                >
                  <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                    Nome do contato
                    <input value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Quem atende" className={campo} />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                    WhatsApp
                    <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(41) 99999-0000" inputMode="tel" className={campo} />
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" disabled={ocupado === "editar"} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-bg disabled:opacity-50">
                      {ocupado === "editar" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Salvar
                    </button>
                    <button type="button" onClick={() => setEditando(false)} className="min-h-10 rounded-full border border-line px-4 text-sm font-semibold">
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="grid gap-2 text-sm">
                  <Linha rotulo="Contato" valor={c.contato} />
                  <Linha rotulo="WhatsApp" valor={c.telefoneVisivel || (numero ? `+${numero}` : "")} />
                  <Linha rotulo="E-mail" valor={c.email} />
                  <Linha rotulo="Categoria" valor={c.categoria} />
                  <Linha rotulo="Endereço" valor={c.endereco} />
                  <Linha rotulo="Site" valor={c.site ? nomesSite[c.site] : ""} />
                  {c.nota != null && (
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-ink-soft">Google</dt>
                      <dd className="inline-flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" /> {c.nota.toLocaleString("pt-BR")} ({c.avaliacoes ?? 0} avaliações)
                      </dd>
                    </div>
                  )}
                  <Linha rotulo="Pontos" valor={c.pontos != null ? String(c.pontos) : ""} />
                </dl>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {numero && (
                  <a href={`https://wa.me/${numero}`} target="_blank" rel="noopener" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-wa px-4 text-sm font-semibold text-white">
                    <WhatsAppIcon className="size-4" /> WhatsApp
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold">
                    <Mail className="size-4" /> E-mail
                  </a>
                )}
                {c.maps && (
                  <a href={c.maps} target="_blank" rel="noopener" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold">
                    <MapPin className="size-4" /> Maps
                  </a>
                )}
                {c.linkAtual && (
                  <a href={c.linkAtual} target="_blank" rel="noopener" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold">
                    <Globe className="size-4" /> Site atual
                  </a>
                )}
              </div>
            </Caixa>

            {/* proposta */}
            <Caixa titulo="Proposta">
              {!c.proposta ? (
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => acao("proposta", { acao: "proposta" }, "Proposta pronta.")}
                    disabled={!!ocupado || !numero}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-5 font-semibold text-white disabled:opacity-40"
                  >
                    {ocupado === "proposta" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-lime" />}
                    {ocupado === "proposta" ? "Montando… leva uns segundos" : "Montar proposta com IA"}
                  </button>
                  <p className="text-xs text-ink-soft">
                    {numero ? "A IA monta a prévia do site e a mensagem de abordagem." : "Para montar a proposta, adicione o WhatsApp em Editar."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  <p className="text-xs text-ink-soft">Montada {relativo(c.proposta.geradaEm)}</p>
                  <p className="max-h-48 overflow-y-auto rounded-2xl bg-bg-alt p-4 text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">{c.proposta.mensagem}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a href={c.proposta.link} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-card text-sm font-semibold">
                      <ExternalLink className="size-4" /> Ver proposta
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard?.writeText(c.proposta!.mensagem).catch(() => {});
                        setCopiado(true);
                        setTimeout(() => setCopiado(false), 1800);
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-card text-sm font-semibold"
                    >
                      {copiado ? <Check className="size-4 text-brand" /> : <Copy className="size-4" />} {copiado ? "Copiado" : "Copiar mensagem"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.open(c.proposta!.whatsapp, "_blank", "noopener");
                      acao("", { acao: "enviada" }, "Marcado como proposta enviada.");
                    }}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-wa font-semibold text-white"
                  >
                    <WhatsAppIcon className="size-4" /> Enviar no WhatsApp
                  </button>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      acao("email", { acao: "email-proposta", email }, `Proposta enviada para ${email}.`);
                    }}
                    className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-[1fr_auto]"
                  >
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@cliente.com.br" aria-label="E-mail do cliente" className={campo} />
                    <button type="submit" disabled={!!ocupado || !email} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-bg disabled:opacity-40">
                      {ocupado === "email" ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} Enviar por e-mail
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => acao("proposta", { acao: "proposta" }, "Proposta refeita.")}
                    disabled={!!ocupado}
                    className="justify-self-start text-xs font-semibold text-ink-soft underline-offset-2 hover:underline disabled:opacity-40"
                  >
                    {ocupado === "proposta" ? "Refazendo…" : "Refazer com IA"}
                  </button>
                </div>
              )}
            </Caixa>

            {/* notas */}
            <Caixa titulo={`Notas${c.notas?.length ? ` (${c.notas.length})` : ""}`}>
              {c.notas?.length ? (
                <ul className="grid gap-2">
                  {[...c.notas].reverse().map((n, i) => (
                    <li key={n.em + i} className="rounded-2xl bg-bg-alt p-3 text-sm">
                      <p className="whitespace-pre-wrap">{n.texto}</p>
                      <p className="mt-1 text-[11px] text-ink-soft">{dataHora(n.em)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-soft">Nenhuma nota ainda.</p>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!nota.trim()) return;
                  if (await acao("nota", { acao: "nota", texto: nota })) setNota("");
                }}
                className="mt-3 grid gap-2"
              >
                <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={2} placeholder="Ex.: pediu para ligar na segunda" aria-label="Nova nota" className="w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
                <button type="submit" disabled={!nota.trim() || ocupado === "nota"} className="inline-flex min-h-10 items-center justify-center gap-2 justify-self-start rounded-full bg-ink px-4 text-sm font-semibold text-bg disabled:opacity-40">
                  {ocupado === "nota" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Adicionar nota
                </button>
              </form>
            </Caixa>

            {/* histórico */}
            {(c.historico?.length ?? 0) > 0 && (
              <Caixa titulo="Histórico">
                <ol className="grid gap-2 border-l-2 border-line pl-4 text-sm">
                  {[...c.historico!].reverse().map((h, i) => (
                    <li key={h.em + i} className="relative">
                      <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-brand" />
                      {h.de ? (
                        <>
                          {nomeColuna(h.de)} → <strong>{nomeColuna(h.para)}</strong>
                        </>
                      ) : (
                        <>
                          Entrou em <strong>{nomeColuna(h.para)}</strong>
                        </>
                      )}
                      <span className="block text-[11px] text-ink-soft">
                        {dataHora(h.em)} · {h.por === "voce" ? "você" : "automático"}
                      </span>
                    </li>
                  ))}
                </ol>
              </Caixa>
            )}

            {/* excluir */}
            <div className="pb-4">
              {confirmarExcluir ? (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  <span className="flex-1">Excluir {c.negocio}? Não dá para desfazer.</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (await acao("excluir", { acao: "excluir" })) fechar();
                    }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-red-700 px-4 font-semibold text-white"
                  >
                    {ocupado === "excluir" && <Loader2 className="size-4 animate-spin" />} Excluir
                  </button>
                  <button type="button" onClick={() => setConfirmarExcluir(false)} className="min-h-10 rounded-full border border-red-200 bg-card px-4 font-semibold">
                    Cancelar
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmarExcluir(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700">
                  <Trash2 className="size-4" /> Excluir lead
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function Caixa({ titulo, acao, children }: { titulo: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-3xl border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">{titulo}</h4>
        {acao}
      </div>
      {children}
    </section>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor?: string }) {
  if (!valor) return null;
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-ink-soft">{rotulo}</dt>
      <dd className="min-w-0 [overflow-wrap:anywhere]">{valor}</dd>
    </div>
  );
}
