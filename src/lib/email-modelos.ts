// Layouts dos e-mails. Os mesmos layouts ficam como templates no Resend (o alias é a chave do objeto abaixo),
// para editar texto e visual pelo painel do Resend sem mexer no código. Se o template falhar, o site preenche
// o layout daqui. Variáveis no formato {{{NOME}}}: o Resend não escapa nada, então o código já manda tudo escapado
// (menos ASSUNTO, que é texto puro do título do e-mail e não aparece no corpo).
// Mudou um layout aqui? Rode `node scripts/resend-templates.mts` para atualizar os templates no Resend.
//
// HTML de e-mail: tabelas, estilos inline e nada de SVG, fonte web ou CSS moderno (Gmail e Outlook ignoram).
// Os botões de clientes passam por links rastreados (LINK_*), e PIXEL conta a abertura.

export type Variavel = { key: string; fallback_value: string };
export type Modelo = { nome: string; assunto: string; variaveis: Variavel[]; html: string };

const v = (...chaves: string[]): Variavel[] => chaves.map((key) => ({ key, fallback_value: "" }));

const cor = { fundo: "#f3f1ea", tinta: "#0d1a14", suave: "#56615a", fraco: "#8a938d", verde: "#0b1d15", verdeVivo: "#17784a", ouro: "#d9c28e", ouroEscuro: "#7a5e2a", linha: "#ebe7dc" };
const fonte = "font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif";

// Botão que funciona no Outlook (célula com fundo) e no celular (área de toque grande).
const botao = (href: string, rotulo: string, estilo: "ouro" | "verde" | "contorno" = "ouro") => {
  const fundo = estilo === "ouro" ? cor.ouro : estilo === "verde" ? cor.verde : "";
  const texto = estilo === "verde" ? "#ffffff" : cor.verde;
  const borda = estilo === "contorno" ? `border:2px solid ${cor.verde};` : "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:6px 8px 6px 0"><tr><td align="center"${fundo ? ` bgcolor="${fundo}"` : ""} style="border-radius:999px;${fundo ? `background:${fundo};` : ""}${borda}"><a href="${href}" target="_blank" style="display:inline-block;padding:15px 28px;${fonte};font-size:16px;font-weight:700;color:${texto};text-decoration:none;border-radius:999px">${rotulo}</a></td></tr></table>`;
};

const etiqueta = (t: string, c = cor.verdeVivo) =>
  `<p style="margin:0 0 8px;${fonte};font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${c}">${t}</p>`;

// Moldura comum: prévia (texto que o Gmail mostra ao lado do assunto), cabeçalho da marca, corpo e rodapé.
function moldura({ cabecalho, corpo, rodapeExtra = "" }: { cabecalho: string; corpo: string; rodapeExtra?: string }) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>{{{ASSUNTO}}}</title></head>
<body style="margin:0;padding:0;background:${cor.fundo}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${cor.fundo}">{{{PREVIA}}}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${cor.fundo}" style="background:${cor.fundo}">
<tr><td align="center" style="padding:28px 12px 40px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
    <tr><td style="padding:0 6px 16px">
      <span style="${fonte};font-size:26px;font-weight:800;letter-spacing:-.04em;color:${cor.verde}">soares</span><span style="${fonte};font-size:26px;font-weight:800;color:${cor.ouro}">▍</span>
    </td></tr>
    <tr><td bgcolor="${cor.verde}" style="background:${cor.verde};border-radius:24px 24px 0 0;padding:34px 32px 30px">${cabecalho}</td></tr>
    <tr><td bgcolor="#ffffff" style="background:#ffffff;border-radius:0 0 24px 24px;padding:32px">${corpo}</td></tr>
    <tr><td style="padding:22px 10px 0;${fonte};font-size:12px;line-height:1.6;color:${cor.fraco};text-align:center">
      ${rodapeExtra}
      Andressa Soares · sites para pequenos negócios · Curitiba, PR · <a href="https://soareslab.com" style="color:${cor.fraco}">soareslab.com</a><br>
      Respondendo este e-mail, a resposta chega direto para mim.<br>
      <a href="{{{LINK_SAIR}}}" style="color:${cor.fraco}">Não quero mais receber e-mails</a>
    </td></tr>
  </table>
  {{{PIXEL}}}
</td></tr></table>
</body></html>`;
}

const comuns = ["ASSUNTO", "PREVIA", "PIXEL", "LINK_SAIR"];

export const modelos = {
  "analise-ia": {
    nome: "Relatório da análise de IA",
    assunto: "{{{ASSUNTO}}}",
    variaveis: v(...comuns, "NEGOCIO", "NOTA", "NOTA_BARRA", "COR_NOTA", "VEREDITO", "RESUMO", "PERGUNTA", "RESULTADO", "ITENS", "OFERTA", "LINK_WHATSAPP", "LINK_PRECOS", "LINK_MODELOS"),
    html: moldura({
      cabecalho: `
      ${etiqueta("Análise grátis · como a IA te vê", cor.ouro)}
      <h1 style="margin:0;${fonte};font-size:28px;line-height:1.2;font-weight:800;color:#ffffff">{{{NEGOCIO}}}</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px"><tr>
        <td style="${fonte};font-size:64px;line-height:1;font-weight:800;color:{{{COR_NOTA}}}">{{{NOTA}}}</td>
        <td style="padding:0 0 8px 8px;vertical-align:bottom;${fonte};font-size:18px;color:#ffffff99">/ 100</td>
      </tr></table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0 0"><tr>
        <td width="{{{NOTA_BARRA}}}%" height="8" bgcolor="{{{COR_NOTA}}}" style="background:{{{COR_NOTA}}};border-radius:8px 0 0 8px;font-size:0;line-height:0">&nbsp;</td>
        <td height="8" bgcolor="#24372d" style="background:#24372d;border-radius:0 8px 8px 0;font-size:0;line-height:0">&nbsp;</td>
      </tr></table>
      <p style="margin:18px 0 0;${fonte};font-size:19px;font-weight:700;color:#ffffff">{{{VEREDITO}}}</p>
      <p style="margin:6px 0 0;${fonte};font-size:15px;line-height:1.55;color:#ffffffb3">{{{RESUMO}}}</p>`,
      corpo: `
      ${etiqueta("O teste")}
      <p style="margin:0;${fonte};font-size:15px;line-height:1.6;color:${cor.suave}">Perguntei à IA como se fosse um cliente seu:</p>
      <p style="margin:10px 0 0;padding:16px 18px;background:${cor.fundo};border-radius:14px;${fonte};font-size:16px;line-height:1.5;font-style:italic;color:${cor.tinta}">“{{{PERGUNTA}}}”</p>
      <p style="margin:14px 0 0;${fonte};font-size:15px;line-height:1.6;color:${cor.tinta}">{{{RESULTADO}}}</p>

      <div style="height:28px;line-height:28px">&nbsp;</div>
      ${etiqueta("O que eu conferi no seu negócio")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{{{ITENS}}}</table>

      <div style="height:30px;line-height:30px">&nbsp;</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${cor.ouro}" style="background:${cor.ouro};border-radius:20px;padding:28px">
        <p style="margin:0;${fonte};font-size:22px;line-height:1.25;font-weight:800;color:${cor.verde}">Quer que a IA passe a indicar você?</p>
        <p style="margin:10px 0 18px;${fonte};font-size:15px;line-height:1.55;color:${cor.verde}">{{{OFERTA}}}</p>
        ${botao("{{{LINK_WHATSAPP}}}", "Quero corrigir isso", "verde")}
        <p style="margin:12px 0 0;${fonte};font-size:14px"><a href="{{{LINK_PRECOS}}}" style="color:${cor.verde};font-weight:700">Ver preços</a> &nbsp;·&nbsp; <a href="{{{LINK_MODELOS}}}" style="color:${cor.verde};font-weight:700">Ver modelos de site</a></p>
      </td></tr></table>
      <p style="margin:22px 0 0;${fonte};font-size:12px;line-height:1.6;color:${cor.fraco}">Resposta de um modelo de IA com o que ele já aprendeu, sem pesquisar na internet na hora. Os nomes indicados podem conter erros.</p>`,
      rodapeExtra: "Você recebeu porque pediu a análise grátis no site.<br>",
    }),
  },

  proposta: {
    nome: "Proposta de site",
    assunto: "{{{ASSUNTO}}}",
    variaveis: v(...comuns, "SAUDACAO", "NEGOCIO", "INTRO", "ITENS", "TOTAL", "CONDICOES", "VALIDADE", "LINK_PROPOSTA", "LINK_WHATSAPP"),
    html: moldura({
      cabecalho: `
      ${etiqueta("Proposta", cor.ouro)}
      <h1 style="margin:0;${fonte};font-size:30px;line-height:1.2;font-weight:800;color:#ffffff">O site novo de {{{NEGOCIO}}}</h1>
      <p style="margin:14px 0 0;${fonte};font-size:16px;line-height:1.55;color:#ffffffc7">Montei uma prévia de como ele fica, com o preço fechado e as formas de pagamento. Abre direto no celular.</p>
      <div style="height:22px;line-height:22px">&nbsp;</div>
      ${botao("{{{LINK_PROPOSTA}}}", "Ver minha proposta")}`,
      corpo: `
      <p style="margin:0;${fonte};font-size:16px;line-height:1.65;color:${cor.tinta}">{{{SAUDACAO}}}</p>
      <p style="margin:12px 0 0;${fonte};font-size:16px;line-height:1.65;color:${cor.suave}">{{{INTRO}}}</p>

      <div style="height:26px;line-height:26px">&nbsp;</div>
      ${etiqueta("O que está incluso")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{{{ITENS}}}</table>

      <div style="height:26px;line-height:26px">&nbsp;</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px solid ${cor.linha};border-radius:20px;padding:24px">
        ${etiqueta("Investimento")}
        <p style="margin:0;${fonte};font-size:36px;line-height:1.1;font-weight:800;color:${cor.verde}">{{{TOTAL}}}</p>
        <p style="margin:6px 0 0;${fonte};font-size:15px;line-height:1.55;color:${cor.suave}">{{{CONDICOES}}}</p>
        <p style="margin:12px 0 0;${fonte};font-size:13px;color:${cor.ouroEscuro};font-weight:700">Proposta válida até {{{VALIDADE}}}</p>
      </td></tr></table>

      <div style="height:24px;line-height:24px">&nbsp;</div>
      ${botao("{{{LINK_PROPOSTA}}}", "Ver proposta e pagar", "verde")}${botao("{{{LINK_WHATSAPP}}}", "Tirar dúvidas no WhatsApp", "contorno")}
      <p style="margin:22px 0 0;${fonte};font-size:15px;line-height:1.6;color:${cor.suave}">Primeira versão em 48h e site no ar em até 7 dias. No pagamento em duas partes, a segunda metade só é paga na entrega.</p>
      <p style="margin:18px 0 0;${fonte};font-size:15px;color:${cor.tinta}">Um abraço,<br><strong>Andressa Soares</strong></p>`,
    }),
  },

  carrinho: {
    nome: "Carrinho abandonado com cupom",
    assunto: "{{{ASSUNTO}}}",
    variaveis: v(...comuns, "TITULO", "TEXTO", "CUPOM", "DESCONTO", "DE", "POR", "PARCELA", "VALIDADE", "RESUMO", "LINK_CUPOM", "LINK_WHATSAPP"),
    html: moldura({
      cabecalho: `
      ${etiqueta("Seu site está quase lá", cor.ouro)}
      <h1 style="margin:0;${fonte};font-size:30px;line-height:1.2;font-weight:800;color:#ffffff">{{{TITULO}}}</h1>
      <p style="margin:14px 0 0;${fonte};font-size:16px;line-height:1.6;color:#ffffffc7">{{{TEXTO}}}</p>`,
      corpo: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${cor.fundo}" style="background:${cor.fundo};border:2px dashed ${cor.ouro};border-radius:20px;padding:26px;text-align:center">
        ${etiqueta("Seu cupom", cor.ouroEscuro)}
        <p style="margin:0;${fonte};font-size:30px;font-weight:800;letter-spacing:.12em;color:${cor.verde}">{{{CUPOM}}}</p>
        <p style="margin:8px 0 0;${fonte};font-size:15px;color:${cor.suave}">{{{DESCONTO}}} de desconto, já aplicado no link abaixo</p>
        <p style="margin:18px 0 0;${fonte};font-size:15px;color:${cor.fraco};text-decoration:line-through">{{{DE}}}</p>
        <p style="margin:2px 0 0;${fonte};font-size:40px;line-height:1.1;font-weight:800;color:${cor.verde}">{{{POR}}}</p>
        <p style="margin:6px 0 0;${fonte};font-size:15px;color:${cor.suave}">ou {{{PARCELA}}} sem entrada</p>
        <div style="height:20px;line-height:20px">&nbsp;</div>
        ${botao("{{{LINK_CUPOM}}}", "Usar o cupom", "verde")}
        <p style="margin:12px 0 0;${fonte};font-size:13px;font-weight:700;color:${cor.ouroEscuro}">Válido até {{{VALIDADE}}}</p>
      </td></tr></table>

      <div style="height:24px;line-height:24px">&nbsp;</div>
      ${etiqueta("O que você escolheu")}
      <p style="margin:0;${fonte};font-size:15px;line-height:1.6;color:${cor.tinta}">{{{RESUMO}}}</p>
      <p style="margin:18px 0 0;${fonte};font-size:15px;line-height:1.6;color:${cor.suave}">Ficou alguma dúvida sobre prazo, pagamento ou o que entra no site? Me chama que eu respondo rapidinho.</p>
      <div style="height:6px;line-height:6px">&nbsp;</div>
      ${botao("{{{LINK_WHATSAPP}}}", "Falar no WhatsApp", "contorno")}
      <p style="margin:18px 0 0;${fonte};font-size:15px;color:${cor.tinta}">Um abraço,<br><strong>Andressa Soares</strong></p>`,
      rodapeExtra: "Você recebeu porque começou um pagamento no site e ele não foi concluído.<br>",
    }),
  },

  "aviso-interno": {
    nome: "Aviso interno (leads, propostas e pagamentos)",
    assunto: "{{{ASSUNTO}}}",
    variaveis: v("ASSUNTO", "TITULO", "MARCA", "CONTEUDO", "BOTAO", "LINK_PAINEL"),
    html: `<div style="${fonte};max-width:560px;margin:auto;padding:8px;color:${cor.tinta}">
  <p style="margin:0 0 6px"><span style="font-size:20px;font-weight:800;letter-spacing:-.04em;color:${cor.verde}">soares</span><span style="font-size:20px;font-weight:800;color:${cor.ouro}">▍</span> <span style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${cor.fraco}">painel</span></p>
  <h1 style="font-size:22px;line-height:1.3;margin:10px 0 16px">{{{TITULO}}}</h1>
  <div style="font-size:15px;line-height:1.6">{{{CONTEUDO}}}</div>
  <p style="margin:24px 0 0">
    {{{BOTAO}}}
    <a href="{{{LINK_PAINEL}}}" style="color:${cor.verdeVivo};font-weight:700">Abrir painel</a>
  </p>
</div>`,
  },
} satisfies Record<string, Modelo>;

export type NomeModelo = keyof typeof modelos;

export const preencher = (texto: string, variaveis: Record<string, string | number>) =>
  texto.replace(/\{\{\{(\w+)\}\}\}/g, (_, chave: string) => String(variaveis[chave] ?? ""));
