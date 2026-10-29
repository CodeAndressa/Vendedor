import "server-only";
import { perguntarJSON } from "./analise-ia";
import { baixarPagina } from "./busca-segura";
import { extras as catalogoExtras, type Extra } from "./catalogo";
import { config } from "./config";
import { modelos } from "./modelos";
import { normalizar, type Proposta } from "./proposta";
import { encurtar } from "./link-curto";
import { linkProposta } from "./servidor";

// Monta a proposta de um lead encontrado pelo robô de prospecção, com IA (Groq):
// lê o site atual (se tiver), escolhe modelo, itens e objetivo, escreve a observação da proposta
// e a mensagem de WhatsApp. Devolve o link assinado pronto para a Andressa só conferir e enviar.

export type LeadRobo = {
  nome: string;
  categoria: string;
  endereco: string;
  telefone: string; // só dígitos com 55
  site: "sem-site" | "so-rede-social" | "tem-site";
  linkAtual: string;
  maps: string;
  nota: number | null;
  avaliacoes: number;
};

export type PropostaPronta = {
  link: string; // link assinado completo (fica guardado no cartão)
  curto: string; // o que vai na mensagem: soareslab.com/p/negocio-x7k2
  mensagem: string;
  whatsapp: string; // link wa.me com a mensagem
  modelo: string;
  extras: Extra[];
  objetivo: string;
  leuSite: boolean;
};

const extrasPermitidos: Extra[] = (Object.keys(catalogoExtras) as Extra[]).filter((e) => e !== "maior");
const limpar = (t: unknown, max: number) => (typeof t === "string" ? t.replace(/\s*—\s*/g, ", ").trim().slice(0, max) : "");

// Texto visível do site atual, para a IA entender o negócio (até ~1.500 caracteres).
async function resumoDoSite(url: string) {
  const pagina = await baixarPagina(url, 8000).catch(() => null);
  if (!pagina || pagina.status >= 400) return "";
  const titulo = pagina.html.match(/<title[^>]*>([^<]{0,140})/i)?.[1] ?? "";
  const descricao = pagina.html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,240})/i)?.[1] ?? "";
  const texto = pagina.html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 1500);
  return `Título: ${titulo}\nDescrição: ${descricao}\nTexto: ${texto}`;
}

export async function montarPropostaComIA(lead: LeadRobo): Promise<PropostaPronta> {
  const leuSite = lead.site === "tem-site" && !!lead.linkAtual;
  const site = leuSite ? await resumoDoSite(lead.linkAtual) : "";
  const listaModelos = modelos.map((m) => `${m.slug}: ${m.segmento}`).join("\n");
  const listaExtras = extrasPermitidos.map((e) => `${e}: ${catalogoExtras[e].titulo}`).join("\n");
  const primeiroNome = config.nome.split(" ")[0];

  const situacao =
    lead.site === "sem-site"
      ? "não tem site (só aparece no mapa)"
      : lead.site === "so-rede-social"
        ? `só tem rede social ou link de bio (${lead.linkAtual})`
        : `tem um site (${lead.linkAtual})`;

  const resposta = await perguntarJSON(
    `Você ajuda ${config.nome}, desenvolvedora que vende sites para pequenos negócios (site ou landing page a partir de R$ 997, no ar em 7 dias). Monte a proposta para um negócio encontrado no mapa. Responda só com JSON:
{"segmento":"tipo do negócio em poucas palavras","objetivo":"o principal ganho com o site, curto (ex.: receber pedidos pelo WhatsApp)","modelo":"slug de um modelo da lista","base":"site" ou "landing","extras":["ids da lista de extras, só se fizer sentido"],"observacao":"2 frases para a página da proposta, específicas para esse negócio, sem exagero","mensagem":"mensagem de WhatsApp de primeira abordagem"}
Regras da mensagem: português do Brasil, tom humano e respeitoso, no máximo 450 caracteres, cite o nome do negócio e uma observação concreta (ex.: a situação do site, a nota no Google, o bairro), assine como ${primeiroNome}, diga que montou uma prévia do site deles e que o link vai logo abaixo (abre no celular). Não escreva o link, ele é colado depois. Sem emojis em excesso, sem travessão longo, sem prometer resultado garantido, sem inventar dados que não estão aqui.
Modelos disponíveis:
${listaModelos}
Extras disponíveis:
${listaExtras}`,
    `Negócio: ${lead.nome}
Categoria no mapa: ${lead.categoria}
Endereço: ${lead.endereco}
Situação online: ${situacao}
${lead.nota ? `Nota no Google: ${lead.nota} com ${lead.avaliacoes} avaliações` : "Sem nota conhecida"}
${site ? `Conteúdo do site atual:\n${site}` : ""}`,
  );

  const extras = (Array.isArray(resposta.extras) ? resposta.extras : []).filter((e): e is Extra => extrasPermitidos.includes(e as Extra));
  const modelo = modelos.some((m) => m.slug === resposta.modelo) ? String(resposta.modelo) : undefined;
  const objetivo = limpar(resposta.objetivo, 80);

  const proposta = normalizar({
    cliente: "",
    negocio: lead.nome,
    segmento: limpar(resposta.segmento, 60) || lead.categoria,
    objetivo,
    modelo,
    base: resposta.base === "landing" ? "landing" : "site",
    extras,
    desconto: 0,
    observacao: limpar(resposta.observacao, 400),
    atualSite: lead.site === "tem-site" ? lead.linkAtual : undefined,
    maps: {
      nome: lead.nome,
      nota: lead.nota ?? undefined,
      avaliacoes: lead.avaliacoes || undefined,
      endereco: lead.endereco,
      categoria: lead.categoria,
      url: lead.maps,
      link: lead.site === "so-rede-social" ? lead.linkAtual : undefined,
    },
    origem: "admin",
  }) as Proposta;

  const link = linkProposta(proposta);
  const curto = await encurtar(link, lead.nome).catch(() => link);
  const base = limpar(resposta.mensagem, 600) ||
    `Oi, tudo bem? Sou a ${primeiroNome}, encontrei a ${lead.nome} e montei uma prévia de como ficaria o site de vocês. Segue o link, abre direto no celular:`;
  const mensagem = `${base}\n\n${curto}`;
  return {
    link,
    curto,
    mensagem,
    whatsapp: `https://wa.me/${lead.telefone}?text=${encodeURIComponent(mensagem)}`,
    modelo: modelo ?? "",
    extras,
    objetivo,
    leuSite,
  };
}
