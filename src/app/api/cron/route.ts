import { timingSafeEqual } from "node:crypto";
import { processarCarrinhos } from "@/lib/carrinho";
import { verificarTodos } from "@/lib/monitor";
import { avisarBuscadores } from "@/lib/indexnow";
import { testarVisibilidade } from "@/lib/visibilidade";
import sitemap from "@/app/sitemap";

// Chamado todo dia pela Vercel (vercel.json). A Vercel manda "Authorization: Bearer CRON_SECRET".
// Verifica os sites dos clientes e manda os cupons de carrinho abandonado todo dia e, às segundas, refaz o teste de visibilidade na IA.
function autorizado(request: Request) {
  const segredo = process.env.CRON_SECRET;
  const recebido = request.headers.get("authorization") ?? "";
  if (!segredo) return false;
  const a = Buffer.from(`Bearer ${segredo}`);
  const b = Buffer.from(recebido);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!autorizado(request)) return new Response("Não autorizado", { status: 401 });
  const feito: string[] = [];
  await verificarTodos();
  feito.push("monitor");
  const carrinhos = await processarCarrinhos().catch((e) => {
    console.error("Erro nos carrinhos", e);
    return null;
  });
  if (carrinhos) feito.push(`carrinhos ${JSON.stringify(carrinhos)}`);
  if (new Date().getUTCDay() === 1) {
    await testarVisibilidade();
    feito.push("visibilidade");
    // pede ao Bing e aos outros buscadores para relerem as páginas do site
    const status = await avisarBuscadores(sitemap().map((p) => p.url)).catch(() => 0);
    feito.push(`indexnow ${status}`);
  }
  return Response.json({ ok: true, feito });
}
