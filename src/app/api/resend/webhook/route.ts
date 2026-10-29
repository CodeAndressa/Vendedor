import { createHmac, timingSafeEqual } from "node:crypto";
import { registrarEventoResend } from "@/lib/envios";

// Avisos do Resend sobre cada e-mail (entregue, atrasado, devolvido, marcado como spam).
// Assinados no padrão Svix com RESEND_WEBHOOK_SECRET ("whsec_..."); aviso sem assinatura válida é recusado.

function assinaturaValida(corpo: string, h: Headers) {
  const segredo = process.env.RESEND_WEBHOOK_SECRET;
  const id = h.get("svix-id");
  const quando = h.get("svix-timestamp");
  const assinaturas = h.get("svix-signature");
  if (!segredo || !id || !quando || !assinaturas) return false;
  if (Math.abs(Date.now() / 1000 - Number(quando)) > 300) return false; // mais de 5 min: possível reenvio malicioso
  const chave = Buffer.from(segredo.replace(/^whsec_/, ""), "base64");
  const esperado = Buffer.from(createHmac("sha256", chave).update(`${id}.${quando}.${corpo}`).digest("base64"));
  return assinaturas.split(" ").some((parte) => {
    const recebido = Buffer.from(parte.split(",")[1] ?? "");
    return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
  });
}

export async function POST(request: Request) {
  const corpo = await request.text();
  if (!assinaturaValida(corpo, request.headers)) return new Response("Não autorizado", { status: 401 });
  const evento = JSON.parse(corpo) as { type?: string; data?: { email_id?: string } };
  if (evento.type && evento.data?.email_id) await registrarEventoResend(evento.type, evento.data.email_id).catch((e) => console.error("Evento do Resend", e));
  return Response.json({ recebido: true });
}
