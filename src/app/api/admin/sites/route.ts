import { semCache } from "@/lib/admin";
import { adicionarSite, lerVerificacoes, listarSites, removerSite, verificarTodos } from "@/lib/monitor";
import { adminAutorizado } from "@/lib/servidor";

// Sites dos clientes em produção: listar, adicionar, remover e verificar agora.
export async function GET(request: Request) {
  const negado = await adminAutorizado(request);
  if (negado) return negado;
  const [sites, verificacoes] = await Promise.all([listarSites(), lerVerificacoes()]);
  return Response.json({ ok: true, sites, verificacoes }, { headers: semCache });
}

export async function POST(request: Request) {
  const negado = await adminAutorizado(request);
  if (negado) return negado;
  const c = (await request.json().catch(() => ({}))) as { acao?: string; url?: string; nome?: string; plano?: string };
  try {
    if (c.acao === "adicionar" && c.url) {
      const nome = (c.nome ?? "").trim().slice(0, 60) || new URL(/^https?:/.test(c.url) ? c.url : `https://${c.url}`).hostname;
      await adicionarSite({ url: c.url.trim().slice(0, 200), nome, plano: c.plano?.slice(0, 30) });
    } else if (c.acao === "remover" && c.url) {
      await removerSite(c.url);
    }
    const verificacoes = c.acao === "remover" ? await lerVerificacoes() : await verificarTodos();
    return Response.json({ ok: true, sites: await listarSites(), verificacoes }, { headers: semCache });
  } catch {
    return Response.json({ ok: false, erro: "Endereço inválido." }, { status: 400 });
  }
}
