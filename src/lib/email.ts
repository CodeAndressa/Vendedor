import "server-only";
import { config, reais, siteUrl } from "./config";
import type { Evento } from "./armazem";

// Envia um e-mail para você a cada aviso do site, pelo Resend (resend.com).
// RESEND_API_KEY: chave da API. AVISO_EMAIL_PARA: seu e-mail.
// AVISO_EMAIL_DE: remetente de um domínio verificado no Resend (ex.: "Site <avisos@seudominio.com.br>").
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

const escapar = (v: unknown) =>
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

export async function avisarPorEmail(e: Evento) {
  if (!emailConfigurado()) return;
  const titulo = titulos[e.tipo] ?? "Aviso do site";
  const quem = [e.nome, e.negocio].filter(Boolean).join(" · ");
  const linhas = Object.entries(rotulos)
    .filter(([campo]) => e[campo] !== undefined && e[campo] !== "")
    .map(
      ([campo, rotulo]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7a70;white-space:nowrap">${rotulo}</td><td style="padding:6px 0">${valorLegivel(campo, e[campo])}</td></tr>`,
    )
    .join("");
  const whats = typeof e.whatsapp === "string" && e.whatsapp ? `https://wa.me/${e.whatsapp.replace(/\D/g, "")}` : "";
  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0d1a14">
  <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#14804a;margin:0 0 8px">${escapar(config.marca)}</p>
  <h1 style="font-size:24px;margin:0 0 16px">${escapar(titulo)}${quem ? `: ${escapar(quem)}` : ""}</h1>
  <table style="font-size:15px;border-collapse:collapse">${linhas}</table>
  <p style="margin:24px 0 0">
    ${whats ? `<a href="${whats}" style="background:#14804a;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;margin-right:8px">Chamar no WhatsApp</a>` : ""}
    <a href="${siteUrl}/admin" style="color:#14804a">Abrir painel</a>
  </p>
</div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.AVISO_EMAIL_DE || `${config.marca} <onboarding@resend.dev>`,
        to: process.env.AVISO_EMAIL_PARA!.split(",").map((s) => s.trim()),
        subject: `${titulo}${quem ? `: ${quem}` : ""}`,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) console.error("Resend recusou o e-mail", r.status, await r.text().catch(() => ""));
  } catch (err) {
    console.error("Falha ao enviar e-mail pelo Resend", err);
  }
}
