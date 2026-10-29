import { timingSafeEqual } from "node:crypto";
import { notificar } from "@/lib/servidor";

// Recebe os avisos do Asaas (pagamento confirmado, atrasado, assinatura cancelada...)
// e repassa para a sua planilha/CRM. Cadastre em Asaas → Integrações → Webhooks com o token ASAAS_WEBHOOK_TOKEN.

const interessam = new Set([
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "PAYMENT_OVERDUE",
  "PAYMENT_REFUNDED",
  "PAYMENT_DELETED",
  "SUBSCRIPTION_DELETED",
  "SUBSCRIPTION_INACTIVATED",
]);

function tokenConfere(recebido: string | null) {
  const certo = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!certo || !recebido) return false;
  const a = Buffer.from(certo);
  const b = Buffer.from(recebido);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!tokenConfere(request.headers.get("asaas-access-token"))) return new Response("Não autorizado", { status: 401 });

  const evento = (await request.json().catch(() => null)) as {
    event?: string;
    payment?: { value?: number; description?: string; externalReference?: string; billingType?: string; invoiceUrl?: string };
    subscription?: { value?: number; description?: string; externalReference?: string };
  } | null;

  if (evento?.event && interessam.has(evento.event)) {
    const dados = evento.payment ?? evento.subscription ?? {};
    await notificar({
      tipo: "pagamento",
      evento: evento.event,
      valor: dados.value,
      descricao: dados.description,
      referencia: dados.externalReference,
      forma: evento.payment?.billingType,
      link: evento.payment?.invoiceUrl,
    });
  }
  // Responder 200 sempre: o Asaas pausa a fila de avisos se recebe erro.
  return Response.json({ recebido: true });
}
