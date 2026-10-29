import "server-only";
import type { Resultado } from "./analise-ia";
import { config, linkWhatsApp, precos, prazos, reais, siteUrl } from "./config";
import { escapar } from "./email";
import { enviarRastreado } from "./envios";

// Envia para o visitante o relatório da análise "como a IA enxerga o seu negócio" (template "analise-ia"),
// com abertura e cliques rastreados. Só sai depois que o domínio estiver verificado no Resend e AVISO_EMAIL_DE
// usar esse domínio; antes disso o Resend só entrega para o e-mail dono da conta.

export function podeEnviarParaVisitante() {
  const de = process.env.AVISO_EMAIL_DE ?? "";
  return Boolean(process.env.RESEND_API_KEY) && !!de && !de.includes("resend.dev");
}

// Linha de checklist para e-mail: bolinha verde (ok) ou vermelha (falta), título e explicação.
export function linhaChecklist(ok: boolean, titulo: string, detalhe = "") {
  const fundo = ok ? "#e3f1e8" : "#fbe4df";
  const corIcone = ok ? "#17784a" : "#c2412d";
  return `<tr>
  <td width="40" valign="top" style="padding:14px 12px 14px 0"><div style="width:28px;height:28px;line-height:28px;border-radius:999px;background:${fundo};color:${corIcone};text-align:center;font-family:Arial,sans-serif;font-size:15px;font-weight:700">${ok ? "✓" : "✕"}</div></td>
  <td valign="top" style="padding:14px 0;border-bottom:1px solid #ebe7dc;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif">
    <strong style="font-size:15px;color:#0d1a14">${escapar(titulo)}</strong>${detalhe ? `<br><span style="font-size:14px;line-height:1.55;color:#56615a">${escapar(detalhe)}</span>` : ""}
  </td>
</tr>`;
}

const veredito = (nota: number) =>
  nota >= 75 ? "A IA já entende bem o seu negócio." : nota >= 50 ? "A IA conhece você, mas ainda não confia." : "A IA ainda não consegue indicar você.";

export async function enviarRelatorioAnalise(dados: { para: string; nome: string; negocio: string; cidade: string; resultado: Resultado }) {
  if (!podeEnviarParaVisitante()) return { enviado: false, motivo: "dominio-nao-verificado" as const };
  const { resultado: r } = dados;
  const primeiroNome = config.nome.split(" ")[0];
  const faltam = r.itens.filter((i) => !i.ok);
  const mensagem = `Oi ${primeiroNome}! Recebi a análise de IA do ${dados.negocio} (${r.nota}/100) e quero corrigir o que falta.`;
  const resumo = faltam.length
    ? `${faltam.length} ${faltam.length === 1 ? "ponto impede" : "pontos impedem"} a IA de recomendar ${dados.negocio} com confiança. Abaixo está cada um, com o que fazer.`
    : "Tudo certo por aqui. Agora é manter o site atualizado.";

  return enviarRastreado({
    para: dados.para,
    modelo: "analise-ia",
    assunto: `${dados.negocio}: ${r.nota}/100 na análise de IA`,
    negocio: dados.negocio,
    responderPara: process.env.AVISO_EMAIL_PARA?.split(",")[0]?.trim() || undefined,
    variaveis: ({ link }) => ({
      PREVIA: escapar(`${veredito(r.nota)} ${faltam.length ? `${faltam.length} pontos para corrigir.` : ""}`),
      NEGOCIO: escapar(dados.negocio),
      NOTA: r.nota,
      NOTA_BARRA: Math.max(4, Math.min(100, r.nota)),
      COR_NOTA: r.nota >= 75 ? "#7fd3a0" : r.nota >= 50 ? "#d9c28e" : "#f5a193",
      VEREDITO: escapar(veredito(r.nota)),
      RESUMO: escapar(resumo),
      PERGUNTA: escapar(r.pergunta),
      RESULTADO: `${
        r.indicados.length
          ? `A IA indicou: <strong>${r.indicados.map(escapar).join(", ")}</strong>.`
          : "A IA não soube indicar ninguém com segurança: é espaço livre para quem chegar primeiro."
      } ${r.apareceu ? '<strong style="color:#17784a">Você foi citado.</strong>' : '<strong style="color:#c2412d">Você não apareceu.</strong>'}`,
      ITENS: [...faltam, ...r.itens.filter((i) => i.ok)].map((i) => linhaChecklist(i.ok, i.titulo, i.detalhe)).join(""),
      OFERTA: escapar(`Eu corrijo tudo isso num site novo, no ar em até ${prazos.noAr}, a partir de ${reais(precos.site)} ou em 12x sem entrada.`),
      LINK_WHATSAPP: link("quero-corrigir", linkWhatsApp(mensagem)),
      LINK_PRECOS: link("precos", `${siteUrl}/#orcamento`),
      LINK_MODELOS: link("modelos", `${siteUrl}/modelos`),
    }),
  });
}
