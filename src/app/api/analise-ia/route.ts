import { analisarNegocio } from "@/lib/analise-ia";
import { assistenteConfigurado } from "@/lib/assistente";
import { notificar } from "@/lib/servidor";

// Análise grátis "como a IA enxerga o seu negócio". Vira lead no painel e no e-mail.

const texto = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// 5 análises a cada 10 minutos por visitante (cada uma chama a IA e baixa um site).
const janela = 10 * 60 * 1000;
const usos = new Map<string, number[]>();
function passouDoLimite(ip: string) {
  const agora = Date.now();
  const recentes = (usos.get(ip) ?? []).filter((t) => agora - t < janela);
  recentes.push(agora);
  usos.set(ip, recentes);
  if (usos.size > 5000) usos.clear();
  return recentes.length > 5;
}

export async function POST(request: Request) {
  if (!assistenteConfigurado()) return Response.json({ ok: false, erro: "A análise está fora do ar agora." }, { status: 503 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (passouDoLimite(ip)) return Response.json({ ok: false, erro: "Muitas análises seguidas. Tente de novo em alguns minutos." }, { status: 429 });

  const c = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!c) return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 });
  if (texto(c.empresa)) return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 }); // campo escondido: só robô preenche

  const negocio = texto(c.negocio, 80);
  const segmento = texto(c.segmento, 60);
  const cidade = texto(c.cidade, 60);
  const site = texto(c.site, 200);
  const nome = texto(c.nome, 80);
  const whatsapp = texto(c.whatsapp, 20).replace(/\D/g, "");
  if (negocio.length < 2 || segmento.length < 3 || cidade.length < 3)
    return Response.json({ ok: false, erro: "Preencha o nome do negócio, o que ele faz e a cidade." }, { status: 400 });
  if (nome.length < 2) return Response.json({ ok: false, erro: "Informe seu nome." }, { status: 400 });
  if (whatsapp.length < 10 || whatsapp.length > 13) return Response.json({ ok: false, erro: "Informe um WhatsApp com DDD." }, { status: 400 });
  if (c.consentimento !== true) return Response.json({ ok: false, erro: "É preciso autorizar o contato." }, { status: 400 });

  const resultado = await analisarNegocio({ nome: negocio, segmento, cidade, site });

  await notificar({
    tipo: "lead",
    origem: "analise-ia",
    nome,
    whatsapp,
    negocio,
    respostas: {
      segmento,
      cidade,
      site: site || "sem site",
      nota: `${resultado.nota}/100`,
      "citado pela IA": resultado.apareceu ? "sim" : "não",
      "o que falta": resultado.itens.filter((i) => !i.ok).map((i) => i.titulo).join(", ") || "nada",
    },
    utm: c.utm && typeof c.utm === "object" ? c.utm : {},
  });

  return Response.json({ ok: true, resultado });
}
