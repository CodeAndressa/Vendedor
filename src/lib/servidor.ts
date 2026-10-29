import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { guardar, ondeGuarda, type Evento } from "./armazem";
import { avisarPorEmail } from "./email";
import { adicionarCartoes, marcarPago, marcarPropostaAberta } from "./kanban";
import { excedeu, ipDe, limitar } from "./limite";
import { somar } from "./metricas";
import { siteUrl } from "./config";
import { codificar, type Proposta } from "./proposta";

// Segredo usado para assinar propostas. Defina PROPOSTA_SEGREDO na Vercel (qualquer texto longo e aleatório).
function segredo() {
  const s = process.env.PROPOSTA_SEGREDO;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Defina PROPOSTA_SEGREDO nas variáveis de ambiente.");
  return "segredo-de-desenvolvimento";
}

export function assinar(codigo: string) {
  return createHmac("sha256", segredo()).update(codigo).digest("base64url").slice(0, 22);
}

export function assinaturaConfere(codigo: string, assinatura: string) {
  const esperado = Buffer.from(assinar(codigo));
  const recebido = Buffer.from(assinatura);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export function linkProposta(p: Proposta, pagina: "proposta" | "resultado" = "proposta") {
  const codigo = codificar(p);
  return `${siteUrl}/${pagina}?p=${codigo}&a=${assinar(codigo)}`;
}

// Senha das telas internas (painel admin, gerador de propostas e robô). Defina ADMIN_CHAVE na Vercel.
export function chaveAdminConfere(chave: string | null) {
  const certa = process.env.ADMIN_CHAVE;
  if (!certa || !chave) return false;
  const a = Buffer.from(certa);
  const b = Buffer.from(chave);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Confere a chave das rotas internas com limite de tentativas erradas por IP (20 a cada 15 min).
// Devolve null se pode seguir, ou a resposta de recusa (401 chave errada, 429 tentativas demais).
const FALHAS_ADMIN = 20;
const JANELA_ADMIN = 15 * 60;
export async function adminAutorizado(request: Request): Promise<Response | null> {
  const ip = ipDe(request);
  if (await excedeu("admin", ip, FALHAS_ADMIN))
    return Response.json({ ok: false, erro: "Muitas tentativas com a chave errada. Espere 15 minutos." }, { status: 429, headers: { "Retry-After": String(JANELA_ADMIN) } });
  if (chaveAdminConfere(request.headers.get("x-admin-chave"))) return null;
  await limitar("admin", ip, FALHAS_ADMIN, JANELA_ADMIN);
  return Response.json({ ok: false, erro: "Chave inválida." }, { status: 401 });
}

// E-mail com cara de e-mail (algo@dominio.tld), sem espaços.
export const emailValido = (email: string) => email.length <= 120 && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);

// WhatsApp só com dígitos e sempre com o 55 do Brasil: "(41) 99999-0000" vira "5541999990000".
// Devolve null se não parecer um número com DDD.
export function whatsappComDDI(valor: string): string | null {
  const d = valor.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if (d.length === 12 || d.length === 13) return d;
  return null;
}

// Objeto vindo do navegador (respostas de formulário, utm) reduzido ao que interessa:
// no máximo 12 chaves (só as conhecidas, se a lista vier), chave até 40 e valor até 120 caracteres.
export function mapaCurto(valor: unknown, conhecidas?: string[]): Record<string, string> {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return {};
  const saida: Record<string, string> = {};
  for (const [chave, v] of Object.entries(valor as Record<string, unknown>)) {
    if (Object.keys(saida).length >= 12) break;
    const k = chave.trim().slice(0, 40);
    if (!k || k === "__proto__" || (conhecidas && !conhecidas.includes(k))) continue;
    const t = Array.isArray(v)
      ? v.filter((x) => typeof x === "string" || typeof x === "number").join(", ")
      : typeof v === "string" || typeof v === "number" || typeof v === "boolean"
        ? String(v)
        : "";
    if (t.trim()) saida[k] = t.trim().slice(0, 120);
  }
  return saida;
}

// Registra um aviso do site: guarda para o painel /admin, manda e-mail pelo Resend e, se houver,
// repassa para LEAD_WEBHOOK_URL (planilha, n8n, CRM). Nunca derruba a requisição se algo falhar.
export async function notificar(dados: Record<string, unknown> & { tipo: string }) {
  const evento: Evento = { id: randomUUID(), recebido_em: new Date().toISOString(), situacao: "novo", ...dados };
  const webhook = process.env.LEAD_WEBHOOK_URL;
  const contador = dados.tipo === "pagamento" ? `asaas|${String(dados.evento ?? "")}` : `evento|${dados.tipo}`;
  const tarefas: Promise<unknown>[] = [guardar(evento), avisarPorEmail(evento), somar({ [contador]: 1 }), noKanban(dados)];
  if (webhook)
    tarefas.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evento),
        signal: AbortSignal.timeout(5000),
      }),
    );
  const resultados = await Promise.allSettled(tarefas);
  const falhas = resultados.filter((r) => r.status === "rejected");
  // fica no log da Vercel para não se perder
  if (falhas.length || ondeGuarda() === "nenhum") console.log("Aviso do site:", evento, falhas.map((f) => (f as PromiseRejectedResult).reason));
}

// Leads do site entram no kanban ("Novos do site"); proposta aberta e pagamento movem o cartão sozinhos.
async function noKanban(d: Record<string, unknown>) {
  const t = (v: unknown) => (typeof v === "string" ? v : "");
  if (d.tipo === "lead") {
    await adicionarCartoes([
      {
        negocio: t(d.negocio) || t(d.nome) || "Lead do site",
        contato: t(d.nome) || undefined,
        whatsapp: t(d.whatsapp) || undefined,
        email: t(d.email) || undefined,
        origem: d.origem === "analise-ia" ? "analise-ia" : "site",
        linkAtual: /\./.test(t((d.respostas as Record<string, unknown> | undefined)?.site)) ? t((d.respostas as Record<string, unknown>).site) : undefined,
        proposta: t(d.proposta)
          ? { link: t(d.proposta), mensagem: "", whatsapp: "", assinatura: new URL(t(d.proposta)).searchParams.get("a") ?? "", geradaEm: new Date().toISOString() }
          : undefined,
        coluna: "novos",
      },
    ]);
  } else if (d.tipo === "proposta_aberta") {
    await marcarPropostaAberta(t(d.assinatura), t(d.negocio));
  } else if (d.tipo === "pagamento" && (d.evento === "PAYMENT_RECEIVED" || d.evento === "PAYMENT_CONFIRMED")) {
    const assinatura = t(d.referencia).replace(/^(proposta|parcelado):/, "");
    if (assinatura) await marcarPago(assinatura);
  }
}
