import { ipDe, limitar, muitasTentativas } from "@/lib/limite";
import { hoje, normalizar } from "@/lib/proposta";
import { linkProposta, notificar, mapaCurto, whatsappComDDI } from "@/lib/servidor";

// Recebe um lead do site (diagnóstico, calculadora) e repassa para
// LEAD_WEBHOOK_URL: uma planilha do Google, n8n, Make, Zapier ou o CRM que você usar.

const texto = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// O que o navegador guarda de origem da visita (src/lib/rastreio.ts).
const chavesUtm = ["entrada", "referencia", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

export async function POST(request: Request) {
  // 10 pedidos por hora por IP (cada lead manda e-mail e entra no painel).
  if (!(await limitar("lead-ip", ipDe(request), 10, 3600)).ok)
    return muitasTentativas("Muitos envios seguidos. Me chama no WhatsApp que eu te respondo por lá.");

  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 });
  }
  if (!corpo || typeof corpo !== "object") return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 });

  // Campo escondido: só robô preenche.
  if (texto(corpo.site)) return Response.json({ ok: true });

  const nome = texto(corpo.nome, 80);
  const whatsapp = whatsappComDDI(texto(corpo.whatsapp, 20));
  if (nome.length < 2) return Response.json({ ok: false, erro: "Informe seu nome." }, { status: 400 });
  if (!whatsapp) return Response.json({ ok: false, erro: "Informe um WhatsApp com DDD." }, { status: 400 });
  if (corpo.consentimento !== true)
    return Response.json({ ok: false, erro: "É preciso autorizar o contato." }, { status: 400 });

  // Proposta pedida pelo próprio visitante: só os campos da escolha dele. Nada de desconto, observação,
  // prévia, site entregue, Maps, origem "admin" ou datas vindas do navegador; projeto sob medida ("maior")
  // fica de fora porque o preço dele é combinado na conversa.
  const pedida = corpo.proposta && typeof corpo.proposta === "object" ? (corpo.proposta as Record<string, unknown>) : null;
  const proposta = pedida
    ? normalizar({
        cliente: nome,
        negocio: pedida.negocio,
        segmento: pedida.segmento,
        objetivo: pedida.objetivo,
        modelo: pedida.modelo,
        base: pedida.base,
        extras: Array.isArray(pedida.extras) ? pedida.extras.filter((e) => e !== "maior") : [],
        desconto: 0,
        emitida: hoje(),
        validade: hoje(7),
      })
    : null;
  // Sem PROPOSTA_SEGREDO o link não pode ser assinado: o lead é registrado mesmo assim, só sem a proposta.
  let link: string | undefined;
  try {
    link = proposta ? linkProposta(proposta) : undefined;
  } catch (e) {
    console.error("Não consegui gerar o link da proposta", e);
  }

  await notificar({
    tipo: "lead",
    origem: texto(corpo.origem, 30) || "site",
    nome,
    whatsapp,
    negocio: texto(corpo.negocio, 80),
    respostas: mapaCurto(corpo.respostas),
    utm: mapaCurto(corpo.utm, chavesUtm),
    pagina: texto(corpo.pagina, 300),
    proposta: link ?? "",
  });

  return Response.json({ ok: true, proposta: link });
}
