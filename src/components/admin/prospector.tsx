"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, Download, FileText, KanbanSquare, Loader2, MapPin, Phone, Search, Star, XCircle } from "lucide-react";
import type { Prospecto } from "@/lib/prospeccao";
import { config } from "@/lib/config";
import { nichos } from "@/lib/nichos";
import { WhatsAppIcon } from "../ui";
import { CampoChave, useChaveAdmin } from "./chave";

type Resumo = {
  encontrados: number;
  fechados: number;
  comSite: number;
  comTelefone?: number;
  oportunidades: number;
  chamadas: number;
  fonte: "osm" | "google";
  emCache?: boolean;
};

const CONTATADOS = "prospectos-contatados";
const campo = "min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 outline-none transition focus:border-brand";

// Lista de quem já foi contatado, guardada neste navegador para não chamar a mesma empresa duas vezes.
const ouvintes = new Set<() => void>();
function lerContatados(): string {
  try {
    return localStorage.getItem(CONTATADOS) ?? "[]";
  } catch {
    return "[]";
  }
}
function marcarContatado(id: string) {
  try {
    const lista = new Set<string>(JSON.parse(lerContatados()));
    lista.add(id);
    localStorage.setItem(CONTATADOS, JSON.stringify([...lista]));
  } catch {}
  ouvintes.forEach((f) => f());
}

export function mensagemAbordagem(p: Prospecto) {
  const prova = p.avaliacoes >= 10 ? ` com ${p.avaliacoes} avaliações${p.nota && p.nota >= 4.5 ? ` e nota ${p.nota.toLocaleString("pt-BR")}` : ""}` : "";
  const situacao = p.site === "sem-site" ? "ainda não têm site" : "o link de vocês no Google leva só para rede social";
  return `Oi, tudo bem? Sou a ${config.nome.split(" ")[0]}, encontrei a ${p.nome} no Google${prova}. Parabéns pelo trabalho!\n\nVi que vocês ${situacao}. Eu faço sites para negócios locais e montei uma prévia de como ficaria o de vocês. Posso te mandar? Abre direto no celular.`;
}

function linkProposta(p: Prospecto) {
  const q = new URLSearchParams({
    negocio: p.nome,
    segmento: p.categoria,
    telefone: p.telefone,
    mapsNome: p.nome,
    mapsCategoria: p.categoria,
    mapsEndereco: p.endereco,
    mapsUrl: p.maps,
    ...(p.nota ? { mapsNota: String(p.nota) } : {}),
    mapsAvaliacoes: String(p.avaliacoes),
    ...(p.site === "so-rede-social" ? { mapsLink: p.linkAtual } : {}),
  });
  return `/proposta/nova?${q}`;
}

function baixarCsv(lista: Prospecto[]) {
  const colunas = ["pontos", "nome", "categoria", "telefone", "celular", "ddd_confere", "site", "link_atual", "nota", "avaliacoes", "endereco", "maps"];
  const linhas = lista.map((p) =>
    [p.pontos, p.nome, p.categoria, p.telefoneVisivel, p.celular ? "sim" : "não", p.dddConfere === null ? "" : p.dddConfere ? "sim" : "não", p.site, p.linkAtual, p.nota ?? "", p.avaliacoes, p.endereco, p.maps]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(";"),
  );
  const blob = new Blob(["﻿" + [colunas.join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `prospectos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Selo({ ok, children }: { ok: boolean | null; children: React.ReactNode }) {
  const cor = ok === null ? "bg-bg-alt text-ink-soft" : ok ? "bg-brand-soft text-brand" : "bg-red-50 text-red-700";
  const Icone = ok === false ? XCircle : CheckCircle2;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cor}`}>
      <Icone className="size-3.5" /> {children}
    </span>
  );
}

export function Prospector() {
  const admin = useChaveAdmin();
  const [consulta, setConsulta] = useState("hamburgueria");
  const [cidade, setCidade] = useState(config.cidade);
  const [paginas, setPaginas] = useState(1);
  const [incluirComSite, setIncluirComSite] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState("");
  const [lista, setLista] = useState<Prospecto[] | null>(null);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [esconderContatados, setEsconderContatados] = useState(true);
  const [noKanban, setNoKanban] = useState<Set<string>>(new Set());
  const [enviandoKanban, setEnviandoKanban] = useState<string | null>(null);
  const [avisoKanban, setAvisoKanban] = useState<{ ok: boolean; texto: string } | null>(null);
  const contatados = new Set<string>(
    JSON.parse(
      useSyncExternalStore(
        (f) => {
          ouvintes.add(f);
          return () => ouvintes.delete(f);
        },
        lerContatados,
        () => "[]",
      ),
    ),
  );

  const buscar = async () => {
    setErro("");
    setBuscando(true);
    admin.lembrar();
    const r = await fetch("/api/prospectar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-chave": admin.chave },
      body: JSON.stringify({ consulta, cidade, paginas, incluirComSite }),
    }).catch(() => null);
    const json = r ? await r.json().catch(() => null) : null;
    setBuscando(false);
    if (!json?.ok) {
      setErro(json?.erro ?? "Não consegui buscar. Confira a conexão.");
      return;
    }
    setLista(json.lista);
    setResumo(json.resumo);
  };

  // Manda empresas do robô para o kanban da Central (quem já estiver lá só é atualizado)
  const mandarProKanban = async (itens: Prospecto[], qual: string) => {
    if (!itens.length) return;
    setEnviandoKanban(qual);
    setAvisoKanban(null);
    const r = await fetch("/api/admin/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-chave": admin.chave },
      body: JSON.stringify({ acao: "adicionar", cartoes: itens }),
    }).catch(() => null);
    const json = r ? await r.json().catch(() => null) : null;
    setEnviandoKanban(null);
    if (!json?.ok) return setAvisoKanban({ ok: false, texto: json?.erro ?? "Não consegui mandar pro kanban." });
    setNoKanban((s) => new Set([...s, ...itens.map((p) => p.id)]));
    const n = (v: number, um: string, varios: string) => `${v} ${v === 1 ? um : varios}`;
    setAvisoKanban({ ok: true, texto: `No kanban: ${n(json.criados ?? 0, "novo", "novos")}, ${n(json.atualizados ?? 0, "atualizado", "atualizados")}.` });
  };

  const visiveis = (lista ?? []).filter((p) => !esconderContatados || !contatados.has(p.id));

  return (
    <div className="mt-10 grid gap-8">
      <div className="grid gap-4 rounded-3xl border border-line bg-card p-6">
        <CampoChave {...admin} />
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-1.5 text-sm font-semibold">
            Tipo de negócio
            <input list="sugestoes-nicho" value={consulta} onChange={(e) => setConsulta(e.target.value)} className={campo} />
            <datalist id="sugestoes-nicho">
              {["hamburgueria", "pizzaria", "dentista", "salão de beleza", "advogado", "contador", "pet shop", "academia", "barbearia", "padaria", "clínica de estética", "oficina mecânica"].map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Cidade ou bairro
            <input value={cidade} onChange={(e) => setCidade(e.target.value)} className={campo} />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Quantidade
            <select value={paginas} onChange={(e) => setPaginas(Number(e.target.value))} className={campo}>
              <option value={1}>até 20</option>
              <option value={2}>até 40</option>
              <option value={3}>até 60</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input type="checkbox" checked={incluirComSite} onChange={(e) => setIncluirComSite(e.target.checked)} className="size-4 accent-[var(--color-brand)]" />
          Incluir quem já tem site (para oferecer refazer)
        </label>
        <button
          type="button"
          onClick={buscar}
          disabled={buscando || !admin.chave || !consulta || !cidade}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-forest text-lg font-semibold text-white disabled:opacity-40"
        >
          {buscando ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
          {buscando ? (resumo?.fonte === "osm" ? "Procurando no mapa (pode levar até meio minuto)…" : "Procurando…") : "Encontrar empresas sem site"}
        </button>
        <p className="text-xs text-ink-soft">
          {!resumo
            ? "Com a chave do Google Places a busca usa o Google (cada bloco de 20 resultados é 1 consulta; 1.000 grátis por mês). Sem ela, usa o OpenStreetMap, grátis."
            : resumo.fonte === "osm"
              ? "Busca grátis no OpenStreetMap (sem chave do Google). A base é menos completa: telefone e site às vezes faltam. A mesma busca fica guardada por algumas horas."
              : "Cada bloco de 20 resultados é 1 consulta ao Google. As primeiras 1.000 consultas do mês são grátis; depois, cerca de US$ 0,035 cada."}
        </p>
        {erro && <p className="font-semibold text-red-700">{erro}</p>}
      </div>

      {resumo && lista && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-forest px-3 py-1.5 font-semibold text-white">{resumo.oportunidades} oportunidades</span>
            <span className="rounded-full bg-bg-alt px-3 py-1.5">{resumo.encontrados} encontrados</span>
            <span className="rounded-full bg-bg-alt px-3 py-1.5">{resumo.comSite} já têm site</span>
            {resumo.fonte === "osm" ? (
              <>
                {resumo.comTelefone !== undefined && <span className="rounded-full bg-bg-alt px-3 py-1.5">{resumo.comTelefone} com telefone</span>}
                <span className="text-xs text-ink-soft" title="Sem chave do Google Places: dados do OpenStreetMap, sem avaliações nem situação de funcionamento">
                  Fonte: OpenStreetMap{resumo.emCache ? " (busca guardada)" : ""}
                </span>
              </>
            ) : (
              <span className="rounded-full bg-bg-alt px-3 py-1.5">{resumo.fechados} fechados</span>
            )}
            <label className="ml-auto flex items-center gap-2">
              <input type="checkbox" checked={esconderContatados} onChange={(e) => setEsconderContatados(e.target.checked)} className="size-4 accent-[var(--color-brand)]" />
              Esconder já contatados
            </label>
            <button
              type="button"
              onClick={() => mandarProKanban(visiveis, "todos")}
              disabled={!!enviandoKanban || !visiveis.length}
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 font-semibold text-white disabled:opacity-40"
            >
              {enviandoKanban === "todos" ? <Loader2 className="size-4 animate-spin" /> : <KanbanSquare className="size-4" />} Mandar todos pro kanban
            </button>
            <button type="button" onClick={() => baixarCsv(lista)} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 font-semibold">
              <Download className="size-4" /> Planilha (CSV)
            </button>
          </div>

          {avisoKanban && (
            <p className={`rounded-2xl p-4 text-sm font-semibold ${avisoKanban.ok ? "bg-brand-soft text-brand-dark" : "bg-red-50 text-red-800"}`}>
              {avisoKanban.texto}{" "}
              {avisoKanban.ok && (
                <a href="/admin" className="underline underline-offset-2">
                  Abrir a Central
                </a>
              )}
            </p>
          )}

          <ol className="grid gap-4">
            {visiveis.map((p, i) => (
              <li key={p.id} className={`grid gap-4 rounded-3xl border bg-card p-5 md:grid-cols-[auto_1fr_auto] ${i === 0 ? "border-brand ring-2 ring-brand/20" : "border-line"}`}>
                <div className="grid size-16 place-items-center rounded-2xl bg-forest text-center text-white">
                  <div>
                    <div className="font-display text-2xl leading-none text-lime">{p.pontos}</div>
                    <div className="text-[10px] text-white/60">pontos</div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl">{p.nome}</h2>
                    {i === 0 && <span className="rounded-full bg-lime px-2.5 py-0.5 text-xs font-bold text-forest">Melhor oportunidade</span>}
                    {contatados.has(p.id) && <span className="rounded-full bg-bg-alt px-2.5 py-0.5 text-xs font-semibold text-ink-soft">Contatado</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                    {p.categoria && <span>{p.categoria}</span>}
                    {p.nota !== null && (
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" /> {p.nota.toLocaleString("pt-BR")} ({p.avaliacoes})
                      </span>
                    )}
                    {p.telefoneVisivel && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3.5" /> {p.telefoneVisivel}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {p.endereco}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {resumo.fonte !== "osm" && <Selo ok={p.ativo}>Funcionando no Google</Selo>}
                    <Selo ok={p.dddConfere}>{p.dddConfere === null ? "Telefone sem conferência" : p.dddConfere ? "Telefone confere com a região" : "Telefone de outra região"}</Selo>
                    <Selo ok={p.celular}>{p.celular ? "WhatsApp provável" : "Telefone fixo"}</Selo>
                    {resumo.fonte !== "osm" && <Selo ok={p.avaliacoes >= 3}>{p.avaliacoes >= 3 ? "Clientes avaliando" : "Poucas avaliações"}</Selo>}
                    <Selo ok={false}>{p.site === "sem-site" ? "Sem site" : p.site === "so-rede-social" ? "Só rede social" : "Tem site"}</Selo>
                  </div>
                </div>
                <div className="grid content-start gap-2 md:w-52">
                  {p.telefone && (
                    <a
                      href={`https://wa.me/${p.telefone}?text=${encodeURIComponent(mensagemAbordagem(p))}`}
                      target="_blank"
                      rel="noopener"
                      onClick={() => marcarContatado(p.id)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white"
                    >
                      <WhatsAppIcon className="size-4" /> Abordar
                    </a>
                  )}
                  <a href={linkProposta(p)} target="_blank" rel="noopener" className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest text-sm font-semibold text-white">
                    <FileText className="size-4" /> Proposta com prévia
                  </a>
                  <button
                    type="button"
                    onClick={() => mandarProKanban([p], p.id)}
                    disabled={!!enviandoKanban}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold disabled:opacity-50"
                  >
                    {enviandoKanban === p.id ? <Loader2 className="size-4 animate-spin" /> : noKanban.has(p.id) ? <CheckCircle2 className="size-4 text-brand" /> : <KanbanSquare className="size-4" />}
                    {noKanban.has(p.id) ? "Está no kanban" : "Mandar pro kanban"}
                  </button>
                  {p.maps && (
                    <a href={p.maps} target="_blank" rel="noopener" className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold">
                      <MapPin className="size-4" /> Ver no Maps
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {visiveis.length === 0 && <p className="text-center text-ink-soft">Nenhuma oportunidade nova nessa busca. Tente outro bairro ou nicho.</p>}
        </>
      )}

      <p className="text-xs text-ink-soft">
        Dica: os nichos com página pronta no seu site são{" "}
        {nichos.map((n) => n.nome).join(", ")}. Use a página do nicho como link na abordagem.
      </p>
    </div>
  );
}
