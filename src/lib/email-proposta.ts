import "server-only";
import { bases, extras, metades, parcelaAssinatura, total } from "./catalogo";
import { assinaturaSite, config, linkWhatsApp, reais } from "./config";
import { escapar } from "./email";
import { linhaChecklist } from "./email-analise";
import { enviarRastreado } from "./envios";
import { decodificar, formatarData, type Proposta } from "./proposta";

// Proposta por e-mail (template "proposta"), com o botão "Ver minha proposta" rastreado.

export const propostaDoLink = (link: string): Proposta | null => {
  try {
    return decodificar(new URL(link).searchParams.get("p") ?? "");
  } catch {
    return null;
  }
};

// O que entra em todo site, para a lista do e-mail.
const sempre = ["Domínio .com.br e hospedagem do primeiro ano", "Versão para celular e botão de WhatsApp", "Pronto para o Google e para as buscas com IA"];

export function condicoes(valorTotal: number) {
  const [entrada] = metades(valorTotal);
  return `${reais(entrada)} para começar e o resto na entrega, ou ${assinaturaSite.parcelas}x de ${reais(parcelaAssinatura(valorTotal))} sem entrada.`;
}

export function itensDaProposta(p: Proposta) {
  return [bases[p.base].titulo, ...p.extras.map((e) => extras[e].titulo), ...sempre];
}

export async function enviarPropostaPorEmail(m: { para: string; link: string; contato?: string }) {
  const p = propostaDoLink(m.link);
  if (!p) return { enviado: false as const, motivo: "proposta-invalida" as const };
  const negocio = p.negocio || p.cliente;
  const valor = total(p.extras, p.desconto);
  const primeiroNome = config.nome.split(" ")[0];
  const nome = (m.contato || p.cliente).split(" ")[0];

  return enviarRastreado({
    para: m.para,
    modelo: "proposta",
    assunto: `Proposta do site de ${negocio}`,
    negocio,
    responderPara: process.env.AVISO_EMAIL_PARA?.split(",")[0]?.trim() || undefined,
    variaveis: ({ link }) => ({
      PREVIA: escapar(`Prévia do site, preço fechado de ${reais(valor)} e formas de pagamento.`),
      SAUDACAO: escapar(nome ? `Oi, ${nome}! Tudo bem?` : "Oi! Tudo bem?"),
      NEGOCIO: escapar(negocio),
      INTRO: escapar(
        p.observacao ||
          `Pensei no site de ${negocio} para ${p.objetivo ? p.objetivo.toLowerCase() : "trazer mais clientes pelo Google, pelas IAs e pelo WhatsApp"}. Na proposta você vê como ele fica e tudo que está incluso.`,
      ),
      ITENS: itensDaProposta(p).map((t) => linhaChecklist(true, t)).join(""),
      TOTAL: escapar(reais(valor)),
      CONDICOES: escapar(condicoes(valor)),
      VALIDADE: formatarData(p.validade),
      LINK_PROPOSTA: link("ver-proposta", m.link),
      LINK_WHATSAPP: link("whatsapp", linkWhatsApp(`Oi ${primeiroNome}! Vi a proposta do site de ${negocio} e tenho uma dúvida.`)),
    }),
  });
}
