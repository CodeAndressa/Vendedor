import "server-only";
import { config, reais, siteUrl } from "./config";
import type { Evento } from "./armazem";
import { modelos, preencher, type NomeModelo } from "./email-modelos";

// Envia um e-mail para você a cada aviso do site, pelo Resend (resend.com).
// RESEND_API_KEY: chave da API. AVISO_EMAIL_PARA: seu e-mail.
// AVISO_EMAIL_DE: remetente de um domínio verificado no Resend (ex.: "Soares Lab <contato@soareslab.com>").
// Sem domínio verificado, o Resend só entrega para o e-mail dono da conta, usando onboarding@resend.dev.

const titulos: Record<string, string> = {
  lead: "Novo lead",
  proposta_aberta: "Proposta aberta",
  checkout: "Cliente foi para o pagamento",
  pagamento: "Aviso do Asaas",
};

const rotulos: Record<string, string> = {
  nome: "Nome",
  whatsapp: "WhatsApp",
  email: "E-mail",
  negocio: "Negócio",
  origem: "Veio de",
  dispositivo: "Abriu no",
  plano: "Plano",
  valor: "Valor",
  parcelas: "Parcelas",
  evento: "Evento",
  descricao: "Descrição",
  forma: "Forma",
  proposta: "Proposta",
  link: "Link",
};

export const escapar = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function valorLegivel(campo: string, v: unknown) {
  if (campo === "valor" && typeof v === "number") return escapar(reais(v));
  const texto = escapar(v);
  if (/^https?:\/\//.test(String(v))) return `<a href="${texto}">${texto.length > 60 ? "abrir link" : texto}</a>`;
  return texto;
}

export function emailConfigurado() {
  return Boolean(process.env.RESEND_API_KEY && process.env.AVISO_EMAIL_PARA);
}

const remetente = () => process.env.AVISO_EMAIL_DE || `${config.marca} <onboarding@resend.dev>`;
const paraVoce = () => process.env.AVISO_EMAIL_PARA!.split(",").map((s) => s.trim());

// Manda pelo template do Resend (editável no painel dele); se o template sumir ou quebrar,
// manda o mesmo layout preenchido aqui, para o e-mail nunca deixar de sair. Devolve o id do e-mail no Resend.
export async function enviarPeloResend(m: {
  para: string[];
  modelo: NomeModelo;
  variaveis: Record<string, string | number>;
  responderPara?: string;
  cabecalhos?: Record<string, string>;
}): Promise<{ ok: boolean; resendId?: string }> {
  const base = { from: remetente(), to: m.para, reply_to: m.responderPara, headers: m.cabecalhos };
  const enviar = (corpo: object) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...base, ...corpo }),
      signal: AbortSignal.timeout(8000),
    }).catch((err) => {
      console.error("Falha ao falar com o Resend", err);
      return null;
    });

  const pelaTemplate = await enviar({ template: { id: m.modelo, variables: m.variaveis } });
  const idDo = async (r: Response) => ((await r.json().catch(() => ({}))) as { id?: string }).id;
  if (pelaTemplate?.ok) return { ok: true, resendId: await idDo(pelaTemplate) };
  if (pelaTemplate) console.error("Template do Resend falhou, usando o layout do site", m.modelo, pelaTemplate.status, await pelaTemplate.text().catch(() => ""));

  const modelo = modelos[m.modelo];
  const direto = await enviar({ subject: preencher(modelo.assunto, m.variaveis), html: preencher(modelo.html, m.variaveis) });
  if (direto?.ok) return { ok: true, resendId: await idDo(direto) };
  if (direto) console.error("Resend recusou o e-mail", direto.status, await direto.text().catch(() => ""));
  return { ok: false };
}

const linhaTabela = (rotulo: string, valor: string) =>
  `<tr><td style="padding:6px 16px 6px 0;color:#6b7a70;white-space:nowrap">${rotulo}</td><td style="padding:6px 0">${valor}</td></tr>`;

export async function avisarPorEmail(e: Evento) {
  if (!emailConfigurado()) return;
  const titulo = titulos[e.tipo] ?? "Aviso do site";
  const quem = [e.nome, e.negocio].filter(Boolean).join(" · ");
  const linhas = Object.entries(rotulos)
    .filter(([campo]) => e[campo] !== undefined && e[campo] !== "")
    .map(([campo, rotulo]) => linhaTabela(rotulo, valorLegivel(campo, e[campo])))
    .join("");
  const whats = typeof e.whatsapp === "string" && e.whatsapp ? `https://wa.me/${e.whatsapp.replace(/\D/g, "")}` : "";
  const assunto = `${titulo}${quem ? `: ${quem}` : ""}`;
  await enviarPeloResend({
    para: paraVoce(),
    modelo: "aviso-interno",
    responderPara: typeof e.email === "string" && e.email.includes("@") ? e.email : undefined,
    variaveis: {
      ASSUNTO: assunto,
      TITULO: escapar(assunto),
      MARCA: escapar(config.marca),
      CONTEUDO: `<table style="font-size:15px;border-collapse:collapse">${linhas}</table>`,
      BOTAO: whats
        ? `<a href="${whats}" style="background:#14804a;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;margin-right:8px">Chamar no WhatsApp</a>`
        : "",
      LINK_PAINEL: `${siteUrl}/admin`,
    },
  });
}

// E-mail simples para você (monitor de sites, teste semanal de IA). Sem Resend configurado, só registra no log.
export async function enviarEmail(assunto: string, linhas: string[]) {
  if (!emailConfigurado()) {
    console.log("Aviso por e-mail (Resend não configurado):", assunto, linhas);
    return;
  }
  await enviarPeloResend({
    para: paraVoce(),
    modelo: "aviso-interno",
    variaveis: {
      ASSUNTO: assunto,
      TITULO: escapar(assunto),
      MARCA: escapar(config.marca),
      CONTEUDO: linhas.map((l) => `<p style="margin:0 0 8px;font-size:15px">${escapar(l)}</p>`).join(""),
      BOTAO: "",
      LINK_PAINEL: `${siteUrl}/admin`,
    },
  });
}
