import { decodificar } from "@/lib/proposta";
import { assinaturaConfere, notificar } from "@/lib/servidor";

// Avisa você quando o cliente abre a proposta (e se foi no celular ou no computador).
export async function POST(request: Request) {
  const c = (await request.json().catch(() => ({}))) as { p?: string; a?: string };
  const codigo = typeof c.p === "string" ? c.p : "";
  const assinatura = typeof c.a === "string" ? c.a : "";
  const proposta = decodificar(codigo);
  if (!proposta || !assinaturaConfere(codigo, assinatura)) return Response.json({ ok: false }, { status: 400 });

  const ua = request.headers.get("user-agent") ?? "";
  await notificar({
    tipo: "proposta_aberta",
    nome: proposta.cliente,
    negocio: proposta.negocio,
    dispositivo: /Mobi|Android|iPhone/i.test(ua) ? "celular" : "computador",
  });
  return Response.json({ ok: true });
}
