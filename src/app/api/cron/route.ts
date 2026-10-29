import { timingSafeEqual } from "node:crypto";
import { verificarTodos } from "@/lib/monitor";
import { testarVisibilidade } from "@/lib/visibilidade";

// Chamado todo dia pela Vercel (vercel.json). A Vercel manda "Authorization: Bearer CRON_SECRET".
// Verifica os sites dos clientes todo dia e, às segundas, refaz o teste de visibilidade na IA.
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
  if (new Date().getUTCDay() === 1) {
    await testarVisibilidade();
    feito.push("visibilidade");
  }
  return Response.json({ ok: true, feito });
}
