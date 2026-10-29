"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Loader2, MousePointerClick, RefreshCw } from "lucide-react";
import type { Envio } from "@/lib/envios";
import { reais } from "@/lib/config";
import { WhatsAppIcon } from "../ui";
import { relativo } from "./kanban";

// E-mails para clientes (relatório da análise, proposta, carrinho com cupom) e carrinhos abandonados.

type Resumo = { enviados: number; entregues: number; devolvidos: number; abertos: number; clicados: number; taxaAbertura: number; taxaClique: number };
type Carrinho = {
  email: string;
  nome: string;
  whatsapp?: string;
  negocio?: string;
  origem: string;
  criadoEm: string;
  pagoEm?: string;
  cupom: { desconto: number; validade: string; enviadoEm: string } | null;
  ultimoAvisoEm?: string;
};
type Dados = { resumo: Resumo; porModelo: Record<string, Resumo>; envios: Envio[]; carrinhos: Carrinho[] };

const nomesModelo: Record<string, string> = { "analise-ia": "Relatório da análise", proposta: "Proposta", carrinho: "Carrinho (cupom)" };
const nomesBotao: Record<string, string> = {
  "quero-corrigir": "Quero corrigir isso",
  "ver-proposta": "Ver minha proposta",
  "usar-cupom": "Usar o cupom",
  whatsapp: "WhatsApp",
  precos: "Ver preços",
  modelos: "Ver modelos",
  pagar: "Ir para o pagamento",
};
const situacoes: Record<Envio["situacao"], { nome: string; cor: string }> = {
  enviado: { nome: "Enviado", cor: "bg-bg-alt text-ink-soft" },
  entregue: { nome: "Entregue", cor: "bg-brand-soft text-brand-dark" },
  atrasado: { nome: "Atrasado", cor: "bg-amber-100 text-amber-900" },
  devolvido: { nome: "Devolvido", cor: "bg-red-100 text-red-800" },
  spam: { nome: "Marcou como spam", cor: "bg-red-100 text-red-800" },
  falhou: { nome: "Falhou", cor: "bg-red-100 text-red-800" },
};
const hora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const dia = (d: string) => d.slice(0, 10).split("-").reverse().join("/");

export function Emails({ chave }: { chave: string }) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [todos, setTodos] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    const r = await fetch("/api/admin/emails", { headers: { "x-admin-chave": chave }, cache: "no-store" }).catch(() => null);
    const json = r ? await r.json().catch(() => null) : null;
    setCarregando(false);
    if (!json?.ok) return setErro(json?.erro ?? "Não consegui carregar os e-mails.");
    setDados(json as Dados);
  }, [chave]);

  useEffect(() => {
    const t = setTimeout(() => carregar(), 0);
    return () => clearTimeout(t);
  }, [carregar]);

  const r = dados?.resumo;
  const envios = dados ? (todos ? dados.envios : dados.envios.slice(0, 15)) : [];

  return (
    <section className="mt-12">
      <div className="flex items-end gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">E-mails</h2>
          <p className="mt-0.5 text-sm text-ink-soft">Relatórios, propostas e cupons enviados aos clientes</p>
        </div>
        <button type="button" onClick={() => carregar()} aria-label="Atualizar e-mails" className="ml-auto grid size-10 place-items-center rounded-full border border-line bg-card">
          <RefreshCw className={`size-4 ${carregando ? "animate-spin" : ""}`} />
        </button>
      </div>

      {erro && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{erro}</p>}
      {!dados && carregando && (
        <div className="mt-8 grid place-items-center text-ink-soft">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}

      {dados && r && (
        <div className="mt-5 grid gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Numero titulo="Enviados" valor={String(r.enviados)} detalhe={`${r.entregues} entregues`} destaque />
            <Numero titulo="Taxa de abertura" valor={`${r.taxaAbertura}%`} detalhe={`${r.abertos} abriram`} />
            <Numero titulo="Taxa de clique" valor={`${r.taxaClique}%`} detalhe={`${r.clicados} clicaram`} />
            <Numero titulo="Devolvidos ou spam" valor={String(r.devolvidos)} detalhe={r.devolvidos ? "confira os endereços" : "nenhum problema"} />
          </div>

          {Object.keys(dados.porModelo).length > 0 && (
            <div className="rounded-3xl border border-line bg-card p-5">
              <h3 className="font-display text-lg tracking-tight">Por tipo de e-mail</h3>
              <ul className="mt-3 divide-y divide-line text-sm">
                {Object.entries(dados.porModelo).map(([m, x]) => (
                  <li key={m} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-3 sm:grid-cols-[1fr_repeat(4,7.5rem)] sm:items-center">
                    <span className="font-semibold">{nomesModelo[m] ?? m}</span>
                    <span className="text-right text-ink-soft sm:hidden">{x.enviados} enviados</span>
                    <span className="hidden text-right tabular-nums sm:block">{x.enviados} <span className="text-xs text-ink-soft">env.</span></span>
                    <span className="text-xs text-ink-soft sm:text-right sm:text-sm sm:text-ink">abertura {x.taxaAbertura}%</span>
                    <span className="text-right text-xs text-ink-soft sm:text-sm sm:text-ink">clique {x.taxaClique}%</span>
                    <span className="hidden text-right text-sm sm:block">{x.devolvidos ? <span className="text-red-700">{x.devolvidos} dev.</span> : <span className="text-ink-soft">—</span>}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-line bg-card p-5">
              <h3 className="font-display text-lg tracking-tight">Envios</h3>
              {envios.length ? (
                <ul className="mt-3 divide-y divide-line">
                  {envios.map((e) => (
                    <li key={e.id} className="py-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="min-w-0 flex-1 truncate font-semibold">{e.negocio || e.para}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${situacoes[e.situacao].cor}`}>{situacoes[e.situacao].nome}</span>
                      </div>
                      <div className="mt-0.5 truncate text-ink-soft">{e.assunto}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                        <span className="truncate">{e.para}</span>
                        <span>{nomesModelo[e.modelo] ?? e.modelo}</span>
                        <span>{relativo(e.enviadoEm)}</span>
                        <span className={`inline-flex items-center gap-1 ${e.aberturas ? "font-semibold text-brand" : ""}`}>
                          <Eye className="size-3.5" /> {e.aberturas ? `${e.aberturas}× aberto` : "não abriu"}
                        </span>
                      </div>
                      {e.cliques.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {e.cliques.map((k, i) => (
                            <li key={k.em + i} className="inline-flex items-center gap-1 rounded-full bg-lime/30 px-2.5 py-1 text-xs font-semibold text-[#7A5E2A]">
                              <MousePointerClick className="size-3.5" /> {nomesBotao[k.botao] ?? k.botao} · {hora(k.em)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-soft">Nenhum e-mail enviado ainda.</p>
              )}
              {dados.envios.length > 15 && (
                <button type="button" onClick={() => setTodos((v) => !v)} className="mt-2 text-sm font-semibold text-brand">
                  {todos ? "Mostrar menos" : `Ver todos (${dados.envios.length})`}
                </button>
              )}
            </div>

            <div className="rounded-3xl border border-line bg-card p-5">
              <h3 className="font-display text-lg tracking-tight">Carrinhos</h3>
              <p className="mt-0.5 text-xs text-ink-soft">Quem preencheu o pagamento. Sem pagar, recebe um cupom no dia seguinte.</p>
              {dados.carrinhos.length ? (
                <ul className="mt-3 divide-y divide-line">
                  {dados.carrinhos.map((c) => {
                    const numero = c.whatsapp?.replace(/\D/g, "");
                    return (
                      <li key={c.email} className="flex items-start gap-3 py-3 text-sm">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate font-semibold">{c.nome || c.email}</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.pagoEm ? "bg-forest text-lime" : "bg-amber-100 text-amber-900"}`}>
                              {c.pagoEm ? "Pagou" : "Aberto"}
                            </span>
                          </div>
                          <div className="truncate text-ink-soft">{[c.negocio, c.email].filter(Boolean).join(" · ")}</div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
                            <span>começou {relativo(c.criadoEm)}</span>
                            {c.pagoEm && <span>pagou {relativo(c.pagoEm)}</span>}
                            {c.cupom ? (
                              <span className="font-semibold text-[#7A5E2A]">
                                cupom de {reais(c.cupom.desconto)} até {dia(c.cupom.validade)}
                              </span>
                            ) : (
                              !c.pagoEm && <span>cupom ainda não enviado</span>
                            )}
                            {c.ultimoAvisoEm && <span>último aviso {relativo(c.ultimoAvisoEm)}</span>}
                          </div>
                        </div>
                        {numero && (
                          <a href={`https://wa.me/${numero}`} target="_blank" rel="noopener" aria-label={`Chamar ${c.nome} no WhatsApp`} className="grid size-9 shrink-0 place-items-center rounded-full bg-wa text-white">
                            <WhatsAppIcon className="size-4" />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-soft">Nenhum carrinho por enquanto.</p>
              )}
            </div>
          </div>
          <p className="text-xs text-ink-soft">Abertura é estimativa: alguns leitores bloqueiam imagens e o Apple Mail abre tudo sozinho.</p>
        </div>
      )}
    </section>
  );
}

function Numero({ titulo, valor, detalhe, destaque = false }: { titulo: string; valor: string; detalhe?: string; destaque?: boolean }) {
  return (
    <div className={`rounded-3xl border p-5 ${destaque ? "border-transparent bg-forest text-white" : "border-line bg-card"}`}>
      <div className={`text-sm ${destaque ? "text-white/60" : "text-ink-soft"}`}>{titulo}</div>
      <div className="mt-2 font-display text-3xl tracking-tight">{valor}</div>
      {detalhe && <div className={`mt-1 text-xs ${destaque ? "text-lime" : "text-ink-soft"}`}>{detalhe}</div>}
    </div>
  );
}
