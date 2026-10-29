import { ipDe, limitar } from "@/lib/limite";
import { decodificar } from "@/lib/proposta";
import { assinaturaConfere, notificar } from "@/lib/servidor";

// Avisa você quando o cliente abre a proposta (e se foi no celular ou no computador).
// No máximo 1 aviso a cada 6 horas por proposta: abrir de novo (ou alguém repetir a chamada) não lota o e-mail.
export async function POST(request: Request) {
  if (!(await limitar("proposta-aberta-ip", ipDe(request), 30, 3600)).ok) return Response.json({ ok: false }, { status: 429 });
  const c = (await request.json().catch(() => ({}))) as { p?: unknown; a?: unknown } | null;
  const codigo = typeof c?.p === "string" ? c.p.slice(0, 4000) : "";
  const assinatura = typeof c?.a === "string" ? c.a.slice(0, 60) : "";
  const proposta = decodificar(codigo);
  if (!proposta || !assinaturaConfere(codigo, assinatura)) return Response.json({ ok: false }, { status: 400 });

  if (!(await limitar("proposta-aberta", assinatura, 1, 6 * 3600)).ok) return Response.json({ ok: true, avisado: false });

  const ua = request.headers.get("user-agent") ?? "";
  await notificar({
    tipo: "proposta_aberta",
    nome: proposta.cliente,
    negocio: proposta.negocio,
    assinatura,
    dispositivo: /Mobi|Android|iPhone/i.test(ua) ? "celular" : "computador",
  });
  return Response.json({ ok: true, avisado: true });
}
