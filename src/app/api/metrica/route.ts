import { classificarOrigem, identificarRobo, somar } from "@/lib/metricas";

// Recebe as medições do navegador (página vista, tempo e rolagem, eventos). Só contadores, sem dado pessoal.

const texto = (v: unknown, max = 120) => (typeof v === "string" ? v.slice(0, max) : "");
const caminhoLimpo = (p: string) => (/^\/[\w\-/.]*$/.test(p) ? p.replace(/\/+$/, "") || "/" : "/outros");
const eventosAceitos = new Set(["whatsapp", "cta_analise", "chat", "orcamento", "proposta", "lead", "contato", "diagnostico"]);

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (identificarRobo(ua) || /bot|crawl|spider|headless/i.test(ua)) return new Response(null, { status: 204 });

  const c = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!c) return new Response(null, { status: 400 });
  const visitante = /^[a-z0-9]{8,24}$/.test(texto(c.v, 24)) ? texto(c.v, 24) : undefined;
  const pagina = caminhoLimpo(texto(c.p, 80));
  if (pagina.startsWith("/admin")) return new Response(null, { status: 204 });

  try {
    if (c.t === "vista") {
      const { origem, ia } = classificarOrigem(texto(c.r, 200), texto(c.u, 60));
      await somar(
        {
          visitas: 1,
          [`pag|${pagina}`]: 1,
          [`origem|${origem}`]: 1,
          ...(ia ? { ia_visitas: 1, [`ia|${ia}`]: 1 } : {}),
          ...(c.novo === true ? { novas_sessoes: 1 } : {}),
        },
        visitante,
      );
    } else if (c.t === "tempo") {
      const segundos = Math.min(Math.max(Number(c.s) || 0, 0), 1800);
      const rolagem = Math.min(Math.max(Number(c.r) || 0, 0), 100);
      const engajou = segundos >= 30 || rolagem >= 50;
      await somar({
        tempo_total: segundos,
        tempo_n: 1,
        rolagem_total: rolagem,
        [`pag_tempo|${pagina}`]: segundos,
        ...(engajou ? { engajadas: 1 } : {}),
      });
    } else if (c.t === "evento") {
      const nome = texto(c.n, 30);
      if (eventosAceitos.has(nome)) await somar({ [`evento|${nome}`]: 1 });
    }
  } catch (e) {
    console.error("Falha ao registrar métrica", e);
  }
  return new Response(null, { status: 204 });
}
