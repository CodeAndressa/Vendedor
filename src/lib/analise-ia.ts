import "server-only";
import { baixarPagina } from "./busca-segura";
import { classificarSite } from "./prospeccao";

// Análise grátis "como a IA enxerga o seu negócio". Três partes:
// 1. Teste na IA: pergunta o que um cliente perguntaria e confere se o negócio aparece.
// 2. Checagem técnica do site: o que as IAs e o Google precisam para entender o negócio.
// 3. Perfil da Empresa no Google (só quando GOOGLE_PLACES_API_KEY estiver configurada).

export type Entrada = { nome: string; segmento: string; cidade: string; site: string };
export type Item = { titulo: string; ok: boolean; detalhe: string; peso: number };
export type Resultado = {
  nota: number;
  pergunta: string;
  indicados: string[];
  apareceu: boolean;
  itens: Item[];
  google: { encontrado: boolean; nota?: number; avaliacoes?: number; temSite?: boolean } | null;
};

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// Considera citado se as palavras marcantes do nome aparecem num dos indicados.
function citado(nome: string, indicados: string[]) {
  const genericas = new Set(["de", "da", "do", "das", "dos", "e", "a", "o", "the", "ltda", "me", "eireli"]);
  const palavras = normalizar(nome).split(" ").filter((p) => p.length > 2 && !genericas.has(p));
  if (!palavras.length) return false;
  return indicados.some((i) => {
    const alvo = normalizar(i);
    const achadas = palavras.filter((p) => alvo.includes(p)).length;
    return achadas / palavras.length >= 0.6;
  });
}

async function perguntarJSON(sistema: string, pergunta: string): Promise<Record<string, unknown>> {
  const base = (process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
  const r = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: sistema },
        { role: "user", content: pergunta },
      ],
      temperature: 0.2,
      max_completion_tokens: 500,
      reasoning_effort: "low",
      include_reasoning: false,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(20000),
  }).catch(() => null);
  if (!r?.ok) return {};
  const json = await r.json().catch(() => null);
  try {
    return JSON.parse(json?.choices?.[0]?.message?.content ?? "{}");
  } catch {
    return {};
  }
}

// Serve para lugar (hamburgueria) e para empresa ou profissional (controle de ponto, advogado).
async function perguntarIA(e: Entrada) {
  const pergunta = `Quem você recomenda para ${e.segmento.toLowerCase()} em ${e.cidade}? Me indique 5 empresas ou profissionais pelo nome.`;
  const conteudo = (await perguntarJSON(
    'Você é um assistente de IA respondendo a um cliente brasileiro. Responda só com JSON no formato {"indicados":["Nome", ...]}, com até 5 nomes reais de empresas, lugares ou profissionais que você conhece. Se não conhecer nenhum com segurança, devolva {"indicados":[]}.',
    pergunta,
  )) as { indicados?: unknown };
  const indicados = Array.isArray(conteudo.indicados)
    ? conteudo.indicados.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, 80)).slice(0, 5)
    : [];
  return { pergunta, indicados };
}

// A IA sabe quem é o negócio? Só vale se ela descrever o ramo certo: assim uma resposta inventada não conta como acerto.
async function iaConhece(e: Entrada) {
  const r = (await perguntarJSON(
    'Responda só com JSON no formato {"conhece":true|false,"ramo":"o que a empresa faz, em poucas palavras"}. Diga conhece=false se não tiver informação confiável sobre essa empresa específica. Não invente.',
    `Você conhece a empresa "${e.nome}", de ${e.cidade}? O que ela faz?`,
  )) as { conhece?: unknown; ramo?: unknown };
  const ramo = typeof r.ramo === "string" ? r.ramo.slice(0, 120) : "";
  if (r.conhece !== true || !ramo) return { conhece: false, ramo: "" };
  const radicais = (t: string) => normalizar(t).split(" ").filter((p) => p.length > 3).map((p) => p.slice(0, 5));
  const doSegmento = radicais(e.segmento);
  const bate = doSegmento.some((p) => radicais(ramo).includes(p));
  return { conhece: bate, ramo };
}

const tiposLocais =
  /"@type"\s*:\s*\[?[^\]]*"(LocalBusiness|Restaurant|FoodEstablishment|CafeOrCoffeeShop|BarOrPub|Bakery|Dentist|MedicalClinic|Physician|MedicalBusiness|HealthAndBeautyBusiness|BeautySalon|HairSalon|DaySpa|LegalService|Attorney|ProfessionalService|AccountingService|Store|ClothingStore|AutoRepair|RealEstateAgent|ExerciseGym|SportsActivityLocation|LodgingBusiness|Hotel|PetStore|VeterinaryCare|HomeAndConstructionBusiness|EducationalOrganization|Organization)"/;

async function checarSite(e: Entrada): Promise<Item[]> {
  const itens: Item[] = [];
  const situacao = classificarSite(e.site || undefined);
  if (!e.site || situacao !== "tem-site") {
    itens.push({
      titulo: "Site próprio",
      ok: false,
      peso: 30,
      detalhe:
        situacao === "so-rede-social"
          ? "Só rede social não basta: Instagram e link na bio não são lidos pelas IAs como um site. Elas precisam de uma página sua, aberta e em texto."
          : "Sem site, a IA não tem onde ler seus serviços, preços e horário. Ela acaba recomendando quem tem.",
    });
    return itens;
  }

  const endereco = /^https?:\/\//i.test(e.site) ? e.site : `https://${e.site}`;
  const pagina = await baixarPagina(endereco);
  if (!pagina || pagina.status >= 400) {
    itens.push({ titulo: "Site no ar", ok: false, peso: 30, detalhe: "Não consegui abrir o seu site. Se eu não consigo, os robôs das IAs também não conseguem." });
    return itens;
  }
  const html = pagina.html;
  const texto = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const textoNorm = normalizar(texto);

  itens.push({ titulo: "Site no ar", ok: true, peso: 10, detalhe: "O site abriu normalmente." });
  itens.push({
    titulo: "Cadeado de segurança (HTTPS)",
    ok: pagina.https,
    peso: 8,
    detalhe: pagina.https ? "O site usa HTTPS." : "O site não usa HTTPS. Navegadores mostram 'não seguro' e buscadores dão menos confiança.",
  });
  const temSchema = tiposLocais.test(html);
  itens.push({
    titulo: "Dados estruturados do negócio (schema.org)",
    ok: temSchema,
    peso: 16,
    detalhe: temSchema
      ? "Encontrei dados estruturados dizendo o que é o negócio."
      : "Faltam os dados estruturados que dizem às buscas, sem ambiguidade, o que é o negócio, onde fica e quando abre.",
  });
  const temTexto = texto.trim().length > 900;
  itens.push({
    titulo: "Conteúdo em texto",
    ok: temTexto,
    peso: 10,
    detalhe: temTexto
      ? "O site tem texto suficiente para ser lido."
      : "Quase não há texto na página (ou ele está dentro de imagens). IA e Google leem texto.",
  });
  const temTelefone = /tel:|wa\.me|api\.whatsapp|whatsapp\.com|\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/i.test(html);
  itens.push({
    titulo: "Telefone ou WhatsApp visível",
    ok: temTelefone,
    peso: 8,
    detalhe: temTelefone ? "Encontrei telefone ou WhatsApp na página." : "Não encontrei telefone nem WhatsApp em texto na página inicial.",
  });
  const cidadeNorm = normalizar(e.cidade.split(/[,-]/)[0]);
  const temCidade = cidadeNorm.length > 2 && textoNorm.includes(cidadeNorm);
  itens.push({
    titulo: "Cidade escrita no site",
    ok: temCidade,
    peso: 8,
    detalhe: temCidade ? `O site menciona ${e.cidade}.` : `O site não menciona ${e.cidade} na página inicial. A IA precisa saber onde você atende.`,
  });
  const temDescricao = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{50,}/i.test(html);
  itens.push({
    titulo: "Descrição para buscadores",
    ok: temDescricao,
    peso: 6,
    detalhe: temDescricao ? "A página tem descrição para buscadores." : "Falta a descrição (meta description) que aparece nos resultados de busca.",
  });
  const temFaq = /FAQPage/.test(html) || /perguntas frequentes|duvidas frequentes/.test(textoNorm);
  itens.push({
    titulo: "Perguntas frequentes",
    ok: temFaq,
    peso: 6,
    detalhe: temFaq ? "O site responde perguntas frequentes." : "Não há seção de perguntas frequentes. É o formato que as IAs mais aproveitam nas respostas.",
  });

  // robots.txt: os robôs de busca das IAs podem ler o site?
  const robots = await baixarPagina(new URL("/robots.txt", pagina.url).toString(), 5000);
  const bloqueados: string[] = [];
  if (robots && robots.status < 400) {
    const blocos = robots.html.split(/(?=^\s*user-agent\s*:)/im);
    for (const robo of ["OAI-SearchBot", "PerplexityBot", "Googlebot", "Bingbot"]) {
      const regras = blocos.filter((b) => new RegExp(`user-agent\\s*:\\s*(${robo}|\\*)\\s*$`, "im").test(b));
      if (regras.some((b) => /^\s*disallow\s*:\s*\/\s*$/im.test(b))) bloqueados.push(robo);
    }
  }
  itens.push({
    titulo: "Robôs das IAs liberados",
    ok: bloqueados.length === 0,
    peso: 10,
    detalhe: bloqueados.length
      ? `O robots.txt bloqueia ${bloqueados.join(", ")}. Quem bloqueia esses robôs não aparece nas respostas dessas buscas.`
      : "Nada impede os robôs do Google, do ChatGPT e do Perplexity de lerem o site.",
  });
  return itens;
}

async function perfilGoogle(e: Entrada): Promise<Resultado["google"]> {
  const chave = process.env.GOOGLE_PLACES_API_KEY;
  if (!chave) return null;
  const r = await fetch(process.env.GOOGLE_PLACES_URL ?? "https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": chave,
      "X-Goog-FieldMask": "places.displayName,places.rating,places.userRatingCount,places.websiteUri",
    },
    body: JSON.stringify({ textQuery: `${e.nome} ${e.cidade}`, languageCode: "pt-BR", regionCode: "BR", pageSize: 3 }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);
  if (!r?.ok) return null;
  const json = (await r.json().catch(() => ({}))) as {
    places?: { displayName?: { text?: string }; rating?: number; userRatingCount?: number; websiteUri?: string }[];
  };
  const lugar = (json.places ?? []).find((p) => citado(e.nome, [p.displayName?.text ?? ""]));
  if (!lugar) return { encontrado: false };
  return { encontrado: true, nota: lugar.rating, avaliacoes: lugar.userRatingCount ?? 0, temSite: Boolean(lugar.websiteUri) };
}

export async function analisarNegocio(e: Entrada): Promise<Resultado> {
  const [ia, conhecido, itensSite, google] = await Promise.all([perguntarIA(e), iaConhece(e), checarSite(e), perfilGoogle(e)]);
  const apareceu = citado(e.nome, ia.indicados);
  const itens: Item[] = [
    {
      titulo: "Citado pela IA",
      ok: apareceu,
      peso: 20,
      detalhe: apareceu
        ? "A IA citou o seu negócio quando um cliente perguntou pelo seu tipo de serviço na cidade."
        : "Perguntei à IA como se fosse um cliente e o seu negócio não apareceu entre as indicações.",
    },
    {
      titulo: "A IA sabe quem você é",
      ok: conhecido.conhece,
      peso: 12,
      detalhe: conhecido.conhece
        ? `Perguntei pelo nome e a IA descreveu o seu negócio como: "${conhecido.ramo}".`
        : conhecido.ramo
          ? `A IA até respondeu, mas descreveu outro ramo ("${conhecido.ramo}"). Ela não tem informação confiável sobre você.`
          : "Perguntei pelo nome do negócio e a IA disse que não tem informação confiável sobre ele.",
    },
    ...itensSite,
  ];
  if (google) {
    itens.push(
      google.encontrado
        ? {
            titulo: "Perfil da Empresa no Google",
            ok: (google.avaliacoes ?? 0) >= 20 && (google.nota ?? 0) >= 4.3,
            peso: 12,
            detalhe: `Encontrei o perfil: nota ${google.nota ?? "sem nota"} com ${google.avaliacoes} avaliações${google.temSite ? "" : ", sem site cadastrado"}. As IAs preferem quem tem nota alta e muitas avaliações recentes.`,
          }
        : { titulo: "Perfil da Empresa no Google", ok: false, peso: 12, detalhe: "Não encontrei o seu Perfil da Empresa no Google. É de lá que o Gemini e o Google com IA tiram endereço, horário e avaliações." },
    );
  }
  const total = itens.reduce((s, i) => s + i.peso, 0);
  const nota = Math.round((itens.filter((i) => i.ok).reduce((s, i) => s + i.peso, 0) / total) * 100);
  return { nota, pergunta: ia.pergunta, indicados: ia.indicados, apareceu, itens, google };
}
