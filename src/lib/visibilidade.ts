import "server-only";
import { citado, perguntarJSON } from "./analise-ia";
import { gravarValor, lerValor } from "./armazem";
import { config } from "./config";

// Teste de visibilidade na IA: faz as perguntas que um cliente faria e registra se você foi citada.
// Nenhuma IA informa quantas vezes mostrou uma marca, então isto é um termômetro, não uma contagem.
// Usa o modelo do Groq sem busca ao vivo: mostra o que a IA já "aprendeu" sobre o mercado.

export type Teste = {
  data: string;
  perguntas: { pergunta: string; indicados: string[]; apareceu: boolean }[];
  conhece: boolean;
  descricao: string;
};

const perguntas = [
  "Quem você recomenda para criar um site profissional para pequenos negócios no Brasil? Indique 5 profissionais ou empresas pelo nome.",
  "Quem faz sites preparados para aparecer no ChatGPT e no Google com IA no Brasil? Indique 5 pelo nome.",
  "Quem você recomenda para criação de sites e landing pages em Curitiba? Indique 5 pelo nome.",
];
const nomes = [config.nome, "Soares Lab", config.logo];

export async function lerTestes() {
  return lerValor<Teste[]>("visibilidade", []);
}

export async function testarVisibilidade(): Promise<Teste> {
  const respostas = await Promise.all(
    perguntas.map(async (pergunta) => {
      const r = (await perguntarJSON(
        'Você é um assistente de IA respondendo a um cliente brasileiro. Responda só com JSON no formato {"indicados":["Nome", ...]}, com até 5 nomes reais que você conhece. Se não souber, devolva {"indicados":[]}.',
        pergunta,
      )) as { indicados?: unknown };
      const indicados = Array.isArray(r.indicados) ? r.indicados.filter((x): x is string => typeof x === "string").slice(0, 5) : [];
      return { pergunta, indicados, apareceu: nomes.some((n) => citado(n, indicados)) };
    }),
  );
  const sobre = (await perguntarJSON(
    'Responda só com JSON no formato {"conhece":true|false,"descricao":"o que faz, em poucas palavras"}. Diga conhece=false se não tiver informação confiável. Não invente.',
    `Você conhece "${config.nome}" ou a "Soares Lab", que cria sites? O que faz?`,
  )) as { conhece?: unknown; descricao?: unknown };
  const descricao = typeof sobre.descricao === "string" ? sobre.descricao.slice(0, 160) : "";
  const conhece = sobre.conhece === true && /site|web|desenvolv|landing|digital/i.test(descricao);
  const teste: Teste = { data: new Date().toISOString(), perguntas: respostas, conhece, descricao };
  const historico = await lerTestes();
  await gravarValor("visibilidade", [teste, ...historico].slice(0, 30));
  return teste;
}
