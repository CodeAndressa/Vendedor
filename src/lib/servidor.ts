import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { guardar, ondeGuarda, type Evento } from "./armazem";
import { avisarPorEmail } from "./email";
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

// Registra um aviso do site: guarda para o painel /admin, manda e-mail pelo Resend e, se houver,
// repassa para LEAD_WEBHOOK_URL (planilha, n8n, CRM). Nunca derruba a requisição se algo falhar.
export async function notificar(dados: Record<string, unknown> & { tipo: string }) {
  const evento: Evento = { id: randomUUID(), recebido_em: new Date().toISOString(), situacao: "novo", ...dados };
  const webhook = process.env.LEAD_WEBHOOK_URL;
  const contador = dados.tipo === "pagamento" ? `asaas|${String(dados.evento ?? "")}` : `evento|${dados.tipo}`;
  const tarefas: Promise<unknown>[] = [guardar(evento), avisarPorEmail(evento), somar({ [contador]: 1 })];
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
