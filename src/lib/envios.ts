import "server-only";
import { randomBytes } from "node:crypto";
import { comando, gravarValor, lerValor, ondeGuarda } from "./armazem";
import { siteUrl } from "./config";
import { enviarEmail, enviarPeloResend } from "./email";
import type { NomeModelo } from "./email-modelos";
import { marcarPorEmail } from "./kanban";
import { assinar, assinaturaConfere } from "./servidor";

// E-mails para clientes com rastreio: cada envio ganha um id; o pixel conta a abertura e os botões passam
// por /api/e/c (link assinado, que registra o clique e redireciona). O webhook do Resend completa com
// entregue, devolvido e marcado como spam. Tudo aparece no painel (aba Leads) e vira selo no kanban.
// Abertura é estimativa: alguns leitores bloqueiam imagens e o Apple Mail abre tudo sozinho.

export type Envio = {
  id: string;
  modelo: NomeModelo;
  para: string;
  assunto: string;
  negocio?: string;
  carrinho?: string;
  resendId?: string;
  enviadoEm: string;
  situacao: "enviado" | "entregue" | "atrasado" | "devolvido" | "spam" | "falhou";
  aberturas: number;
  abertoEm?: string;
  cliques: { botao: string; url: string; em: string }[];
};

const CHAVE = "emails";
const SAIR = "emails-sair";
const agora = () => new Date().toISOString();
const normalEmail = (e: string) => e.trim().toLowerCase();

// Botões que mostram vontade de comprar: no primeiro clique você recebe um aviso.
const quentes: Record<string, string> = {
  "quero-corrigir": "Quero corrigir isso",
  "ver-proposta": "Ver minha proposta",
  "usar-cupom": "Usar o cupom",
  pagar: "Ir para o pagamento",
  whatsapp: "Falar no WhatsApp",
};

// ---------- armazenamento (hash no Redis; arquivo local no computador) ----------

export async function listarEnvios(): Promise<Envio[]> {
  let lista: Envio[] = [];
  if (ondeGuarda() === "redis") {
    const bruto = (await comando<string[]>("HGETALL", CHAVE)) ?? [];
    for (let i = 1; i < bruto.length; i += 2) {
      try {
        lista.push(JSON.parse(bruto[i]) as Envio);
      } catch {
        // registro corrompido: ignora
      }
    }
  } else lista = Object.values(await lerValor<Record<string, Envio>>(CHAVE, {}));
  return lista.sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm));
}

async function lerEnvio(id: string): Promise<Envio | null> {
  if (ondeGuarda() === "redis") {
    const bruto = await comando<string | null>("HGET", CHAVE, id);
    return bruto ? (JSON.parse(bruto) as Envio) : null;
  }
  return (await lerValor<Record<string, Envio>>(CHAVE, {}))[id] ?? null;
}

async function salvarEnvio(e: Envio) {
  if (ondeGuarda() === "redis") {
    await comando("HSET", CHAVE, e.id, JSON.stringify(e));
    if (e.resendId) await comando("HSET", `${CHAVE}-resend`, e.resendId, e.id);
  } else if (ondeGuarda() === "arquivo") {
    const mapa = await lerValor<Record<string, Envio>>(CHAVE, {});
    mapa[e.id] = e;
    await gravarValor(CHAVE, mapa);
  }
}

async function idPeloResend(resendId: string) {
  if (ondeGuarda() === "redis") return comando<string | null>("HGET", `${CHAVE}-resend`, resendId);
  return (await listarEnvios()).find((e) => e.resendId === resendId)?.id ?? null;
}

// ---------- descadastro ----------

export async function descadastrado(email: string) {
  const e = normalEmail(email);
  if (ondeGuarda() === "redis") return (await comando<number>("SISMEMBER", SAIR, e)) === 1;
  return (await lerValor<string[]>(SAIR, [])).includes(e);
}

export async function descadastrar(email: string) {
  const e = normalEmail(email);
  if (ondeGuarda() === "redis") await comando("SADD", SAIR, e);
  else {
    const lista = await lerValor<string[]>(SAIR, []);
    if (!lista.includes(e)) await gravarValor(SAIR, [...lista, e]);
  }
}

// ---------- links rastreados ----------

const url = (rota: string, params: Record<string, string>) => `${siteUrl}${rota}?${new URLSearchParams(params)}`;

export function linkRastreado(id: string, botao: string, destino: string) {
  return url("/api/e/c", { i: id, b: botao, u: destino, s: assinar(`c|${id}|${botao}|${destino}`) });
}
export const cliqueConfere = (id: string, botao: string, destino: string, s: string) => assinaturaConfere(`c|${id}|${botao}|${destino}`, s);

export const linkPixel = (id: string) => url("/api/e/o", { i: id, s: assinar(`o|${id}`) });
export const pixelConfere = (id: string, s: string) => assinaturaConfere(`o|${id}`, s);

export const linkSair = (email: string) => url("/api/e/sair", { e: normalEmail(email), s: assinar(`sair|${normalEmail(email)}`) });
export const sairConfere = (email: string, s: string) => assinaturaConfere(`sair|${normalEmail(email)}`, s);

const escaparAttr = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

// ---------- envio ----------

// Monta as variáveis com os links rastreados (a função recebe o id do envio) e manda pelo template do Resend.
export async function enviarRastreado(m: {
  para: string;
  modelo: NomeModelo;
  assunto: string;
  negocio?: string;
  carrinho?: string;
  responderPara?: string;
  variaveis: (ferramentas: { id: string; link: (botao: string, destino: string) => string }) => Record<string, string | number>;
}) {
  if (await descadastrado(m.para)) return { enviado: false as const, motivo: "descadastrado" as const };
  const id = randomBytes(9).toString("base64url");
  const variaveis = {
    ...m.variaveis({ id, link: (botao, destino) => escaparAttr(linkRastreado(id, botao, destino)) }),
    ASSUNTO: m.assunto,
    PIXEL: `<img src="${escaparAttr(linkPixel(id))}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">`,
    LINK_SAIR: escaparAttr(linkSair(m.para)),
  };
  const r = await enviarPeloResend({
    para: [m.para],
    modelo: m.modelo,
    variaveis,
    responderPara: m.responderPara,
    // "cancelar inscrição" nativo do Gmail/Outlook (um clique, sem abrir o site)
    cabecalhos: { "List-Unsubscribe": `<${linkSair(m.para)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
  await salvarEnvio({
    id,
    modelo: m.modelo,
    para: normalEmail(m.para),
    assunto: m.assunto,
    negocio: m.negocio,
    carrinho: m.carrinho,
    resendId: r.resendId,
    enviadoEm: agora(),
    situacao: r.ok ? "enviado" : "falhou",
    aberturas: 0,
    cliques: [],
  }).catch((e) => console.error("Não consegui registrar o envio", e));
  return r.ok ? { enviado: true as const, id } : { enviado: false as const, motivo: "erro" as const };
}

// ---------- eventos ----------

export async function registrarAbertura(id: string) {
  const e = await lerEnvio(id);
  if (!e) return;
  const primeira = e.aberturas === 0;
  e.aberturas += 1;
  e.abertoEm ??= agora();
  await salvarEnvio(e);
  if (primeira) await marcarPorEmail(e.para, "abriu o e-mail").catch(() => {});
}

export async function registrarClique(id: string, botao: string, destino: string) {
  const e = await lerEnvio(id);
  if (!e) return;
  const primeiraVez = !e.cliques.some((c) => c.botao === botao);
  e.cliques = [...e.cliques, { botao, url: destino, em: agora() }].slice(-50);
  // clicou sem a imagem ter carregado: abriu do mesmo jeito
  if (!e.aberturas) {
    e.aberturas = 1;
    e.abertoEm = agora();
  }
  await salvarEnvio(e);
  if (!primeiraVez) return;
  const rotulo = quentes[botao] ?? botao;
  await marcarPorEmail(e.para, `clicou: ${rotulo}`).catch(() => {});
  if (quentes[botao])
    await enviarEmail(`${e.negocio ?? e.para} clicou em "${rotulo}"`, [
      `E-mail: ${e.assunto}`,
      `Quem: ${e.para}`,
      "É um bom momento para chamar no WhatsApp.",
    ]).catch(() => {});
}

const situacaoDoResend: Record<string, Envio["situacao"]> = {
  "email.delivered": "entregue",
  "email.delivery_delayed": "atrasado",
  "email.bounced": "devolvido",
  "email.complained": "spam",
  "email.failed": "falhou",
};

export async function registrarEventoResend(tipo: string, resendId: string) {
  const situacao = situacaoDoResend[tipo];
  if (!situacao) return;
  const id = await idPeloResend(resendId);
  const e = id ? await lerEnvio(id) : null;
  if (!e) return;
  // "entregue" não desfaz um "devolvido"/"spam" que chegou antes
  if (situacao === "entregue" && (e.situacao === "devolvido" || e.situacao === "spam")) return;
  e.situacao = situacao;
  await salvarEnvio(e);
  if (situacao === "spam" || situacao === "devolvido") await descadastrar(e.para);
}

// Números para o painel.
export function resumoEnvios(lista: Envio[]) {
  const enviados = lista.filter((e) => e.situacao !== "falhou").length;
  const abertos = lista.filter((e) => e.aberturas > 0).length;
  const clicados = lista.filter((e) => e.cliques.length > 0).length;
  const pct = (n: number) => (enviados ? Math.round((n / enviados) * 100) : 0);
  return {
    enviados,
    entregues: lista.filter((e) => e.situacao === "entregue").length,
    devolvidos: lista.filter((e) => e.situacao === "devolvido" || e.situacao === "spam").length,
    abertos,
    clicados,
    taxaAbertura: pct(abertos),
    taxaClique: pct(clicados),
  };
}
