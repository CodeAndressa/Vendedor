import { assinaturaSite, precos, precosMensais } from "./config";

// Itens vendáveis. Calculadora, propostas e diagnóstico usam esta mesma lista,
// então preço muda num lugar só (em config.ts).

export const bases = {
  site: { titulo: "Site institucional", texto: "Até 5 páginas apresentando o negócio inteiro." },
  landing: { titulo: "Landing page", texto: "Página única focada em uma oferta, ideal para anúncios." },
} as const;

export const extras = {
  blog: { titulo: "Blog pronto para publicar", valor: precos.blog },
  maior: { titulo: "Loja virtual, login, sistema ou 10+ páginas", valor: precos.projetoMaior },
  ia: { titulo: "Assistente com IA no site", valor: precos.ia },
  logo: { titulo: "Logo personalizada", valor: precos.logo },
} as const;

export type Base = keyof typeof bases;
export type Extra = keyof typeof extras;

export const ehBase = (v: unknown): v is Base => typeof v === "string" && v in bases;
export const ehExtra = (v: unknown): v is Extra => typeof v === "string" && v in extras;

export function total(itens: Extra[], desconto = 0) {
  return Math.max(0, precos.site + itens.reduce((s, id) => s + extras[id].valor, 0) - desconto);
}

// Divide o total em duas parcelas que somam exatamente o valor (o centavo que sobra vai na primeira).
export function metades(valor: number): [number, number] {
  const centavos = Math.round(valor * 100);
  const primeira = Math.ceil(centavos / 2);
  return [primeira / 100, (centavos - primeira) / 100];
}

// Valor de cada parcela do site por assinatura (12x sem entrada), arredondado para reais inteiros.
export function parcelaAssinatura(valor: number) {
  return Math.round((valor * (1 + assinaturaSite.acrescimo)) / assinaturaSite.parcelas);
}

export const avisoAssinatura = `Se uma parcela atrasar mais de ${assinaturaSite.diasTolerancia} dias, o site fica fora do ar até o pagamento ser regularizado. Quitou, ele volta no mesmo dia.`;

// Planos mensais (assinatura no Asaas). Valores em config.ts.
export const planosMensais = [
  {
    id: "cuidado",
    nome: "Cuidado",
    valor: precosMensais.cuidado,
    resumo: "Seu site sempre no ar, seguro e atualizado.",
    itens: ["Hospedagem e domínio renovados por mim", "Cadeado de segurança e backup", "Até 2 ajustes de texto ou foto por mês", "Suporte pelo WhatsApp"],
  },
  {
    id: "crescimento",
    nome: "Crescimento",
    valor: precosMensais.crescimento,
    destaque: true,
    resumo: "Para aparecer mais no Google a cada mês.",
    itens: ["Tudo do Cuidado", "Perfil da Empresa no Google atualizado com posts", "2 artigos por mês no blog", "Relatório mensal de visitas e contatos"],
  },
  {
    id: "anuncios",
    nome: "Anúncios",
    valor: precosMensais.anuncios,
    resumo: "Eu cuido dos seus anúncios no Google e Instagram.",
    nota: "+ verba dos anúncios, paga direto ao Google e à Meta",
    itens: ["Criação e gestão das campanhas", "Artes e textos dos anúncios", "Ajustes semanais para baixar o custo", "Relatório a cada 15 dias"],
  },
] as const;

export type PlanoMensal = (typeof planosMensais)[number]["id"];
export const planoMensal = (id: unknown) => planosMensais.find((p) => p.id === id);
