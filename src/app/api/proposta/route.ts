import { normalizar } from "@/lib/proposta";
import { chaveAdminConfere, linkProposta } from "@/lib/servidor";

// Gera o link assinado de uma proposta. Só funciona com a ADMIN_CHAVE (usada no gerador em /proposta/nova).
export async function POST(request: Request) {
  if (!chaveAdminConfere(request.headers.get("x-admin-chave")))
    return Response.json({ ok: false, erro: "Chave inválida." }, { status: 401 });

  let dados: Record<string, unknown>;
  try {
    dados = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 });
  }
  const proposta = normalizar(dados);
  if (!proposta) return Response.json({ ok: false, erro: "Informe o nome do cliente ou do negócio." }, { status: 400 });
  return Response.json({ ok: true, link: linkProposta(proposta, dados.pagina === "resultado" ? "resultado" : "proposta") });
}
