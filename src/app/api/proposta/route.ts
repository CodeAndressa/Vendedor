import { normalizar } from "@/lib/proposta";
import { encurtar } from "@/lib/link-curto";
import { adminAutorizado, linkProposta } from "@/lib/servidor";

// Gera o link assinado de uma proposta. Só funciona com a ADMIN_CHAVE (usada no gerador em /proposta/nova).
export async function POST(request: Request) {
  const negado = await adminAutorizado(request);
  if (negado) return negado;

  let dados: Record<string, unknown>;
  try {
    dados = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 });
  }
  // origem "admin" é marcada aqui no servidor, nunca vem do navegador: é o que libera o pagamento
  // de propostas com projeto sob medida.
  const proposta = normalizar({ ...dados, origem: "admin" });
  if (!proposta) return Response.json({ ok: false, erro: "Informe o nome do cliente ou do negócio." }, { status: 400 });
  const link = linkProposta(proposta, dados.pagina === "resultado" ? "resultado" : "proposta");
  // curto: o que vai para o cliente; link: o assinado completo (prévia interna)
  const curto = await encurtar(link, proposta.negocio || proposta.cliente).catch(() => link);
  return Response.json({ ok: true, link, curto });
}
