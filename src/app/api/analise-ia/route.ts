import { analisarNegocio } from "@/lib/analise-ia";
import { enviarRelatorioAnalise } from "@/lib/email-analise";
import { assistenteConfigurado } from "@/lib/assistente";
import { ipDe, limitar, muitasTentativas } from "@/lib/limite";
import { emailValido, mapaCurto, notificar, whatsappComDDI } from "@/lib/servidor";

// Análise grátis "como a IA enxerga o seu negócio". Vira lead no painel e no kanban, e o relatório vai para o e-mail do visitante.

const texto = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const chavesUtm = ["entrada", "referencia", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

export async function POST(request: Request) {
  if (!assistenteConfigurado()) return Response.json({ ok: false, erro: "A análise está fora do ar agora." }, { status: 503 });
  // 5 análises a cada 10 minutos por visitante (cada uma chama a IA e baixa um site). No Redis vale para todas as instâncias.
  if (!(await limitar("analise-ip", ipDe(request), 5, 600)).ok)
    return muitasTentativas("Muitas análises seguidas. Tente de novo em alguns minutos.");

  const c = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!c || typeof c !== "object") return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 });
  if (texto(c.empresa)) return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 }); // campo escondido: só robô preenche

  const negocio = texto(c.negocio, 80);
  const segmento = texto(c.segmento, 60);
  const cidade = texto(c.cidade, 60);
  const site = texto(c.site, 200);
  const nome = texto(c.nome, 80);
  const whatsapp = whatsappComDDI(texto(c.whatsapp, 20));
  const email = texto(c.email, 120).toLowerCase();
  if (negocio.length < 2 || segmento.length < 3 || cidade.length < 3)
    return Response.json({ ok: false, erro: "Preencha o nome do negócio, o que ele faz e a cidade." }, { status: 400 });
  if (nome.length < 2) return Response.json({ ok: false, erro: "Informe seu nome." }, { status: 400 });
  if (!emailValido(email)) return Response.json({ ok: false, erro: "Informe um e-mail válido para receber o relatório." }, { status: 400 });
  if (!whatsapp) return Response.json({ ok: false, erro: "Informe um WhatsApp com DDD." }, { status: 400 });
  if (c.consentimento !== true) return Response.json({ ok: false, erro: "É preciso autorizar o contato." }, { status: 400 });

  const resultado = await analisarNegocio({ nome: negocio, segmento, cidade, site });

  const envio = await enviarRelatorioAnalise({ para: email, nome, negocio, cidade, resultado });

  await notificar({
    tipo: "lead",
    origem: "analise-ia",
    nome,
    whatsapp,
    email,
    negocio,
    respostas: {
      segmento,
      cidade,
      site: site || "sem site",
      nota: `${resultado.nota}/100`,
      "citado pela IA": resultado.apareceu ? "sim" : "não",
      "relatório por e-mail": envio.enviado ? "enviado" : "não enviado",
      "o que falta": resultado.itens.filter((i) => !i.ok).map((i) => i.titulo).join(", ") || "nada",
    },
    utm: mapaCurto(c.utm, chavesUtm),
  });

  return Response.json({ ok: true, resultado, emailEnviado: envio.enviado });
}
