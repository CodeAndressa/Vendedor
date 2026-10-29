import { buscarNegocios } from "@/lib/prospeccao";
import { adminAutorizado } from "@/lib/servidor";

export async function POST(request: Request) {
  const negado = await adminAutorizado(request);
  if (negado) return negado;

  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 });
  }
  const consulta = typeof corpo.consulta === "string" ? corpo.consulta.trim().slice(0, 80) : "";
  const cidade = typeof corpo.cidade === "string" ? corpo.cidade.trim().slice(0, 80) : "";
  if (!consulta || !cidade) return Response.json({ ok: false, erro: "Informe o tipo de negócio e a cidade." }, { status: 400 });
  const paginas = Math.max(1, Math.min(3, Number(corpo.paginas) || 1));

  try {
    const resultado = await buscarNegocios({ consulta, cidade, paginas, incluirComSite: corpo.incluirComSite === true });
    return Response.json({ ok: true, ...resultado });
  } catch (e) {
    return Response.json({ ok: false, erro: e instanceof Error ? e.message : "Erro na busca." }, { status: 502 });
  }
}
