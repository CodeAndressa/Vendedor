import "server-only";

// Robô de prospecção: busca negócios no Google (Places API), descarta quem já tem site,
// confere se o negócio existe e se o telefone bate com a região, e ordena pelos mais promissores.

const UF_POR_DDD: Record<string, string> = {};
const faixas: [string, number[]][] = [
  ["SP", [11, 12, 13, 14, 15, 16, 17, 18, 19]], ["RJ", [21, 22, 24]], ["ES", [27, 28]],
  ["MG", [31, 32, 33, 34, 35, 37, 38]], ["PR", [41, 42, 43, 44, 45, 46]], ["SC", [47, 48, 49]],
  ["RS", [51, 53, 54, 55]], ["DF", [61]], ["GO", [62, 64]], ["TO", [63]], ["MT", [65, 66]], ["MS", [67]],
  ["AC", [68]], ["RO", [69]], ["BA", [71, 73, 74, 75, 77]], ["SE", [79]], ["PE", [81, 87]], ["AL", [82]],
  ["PB", [83]], ["RN", [84]], ["CE", [85, 88]], ["PI", [86, 89]], ["PA", [91, 93, 94]], ["AM", [92, 97]],
  ["RR", [95]], ["AP", [96]], ["MA", [98, 99]],
];
for (const [uf, ddds] of faixas) for (const d of ddds) UF_POR_DDD[String(d)] = uf;

// Links que não contam como site próprio
const SO_REDE_SOCIAL = [
  "instagram.com", "facebook.com", "fb.com", "wa.me", "whatsapp.com", "linktr.ee", "linktree", "ifood.com.br",
  "bio.link", "beacons.ai", "taplink", "business.site", "sites.google.com", "goo.gl", "tiktok.com", "anota.ai",
];

export type SituacaoSite = "sem-site" | "so-rede-social" | "tem-site";

export type Prospecto = {
  id: string;
  nome: string;
  categoria: string;
  endereco: string;
  uf: string;
  telefone: string; // só dígitos com 55
  telefoneVisivel: string;
  celular: boolean;
  dddConfere: boolean | null; // null = sem dados para conferir
  site: SituacaoSite;
  linkAtual: string;
  maps: string;
  nota: number | null;
  avaliacoes: number;
  ativo: boolean;
  pontos: number;
  motivos: string[];
};

type LugarGoogle = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: { shortText?: string; types?: string[] }[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  primaryTypeDisplayName?: { text?: string };
};

export function classificarSite(url?: string): SituacaoSite {
  if (!url) return "sem-site";
  const u = url.toLowerCase();
  return SO_REDE_SOCIAL.some((d) => u.includes(d)) ? "so-rede-social" : "tem-site";
}

export function analisar(l: LugarGoogle): Prospecto {
  const digitos = (l.internationalPhoneNumber ?? "").replace(/\D/g, "");
  const local = digitos.startsWith("55") ? digitos.slice(2) : digitos;
  const ddd = local.slice(0, 2);
  const numero = local.slice(2);
  const celular = numero.length === 9 && numero.startsWith("9");
  const ufEndereco =
    l.addressComponents?.find((c) => c.types?.includes("administrative_area_level_1"))?.shortText?.toUpperCase() ?? "";
  const ufTelefone = UF_POR_DDD[ddd] ?? "";
  const dddConfere = ufEndereco && ufTelefone ? ufEndereco === ufTelefone : null;
  const avaliacoes = l.userRatingCount ?? 0;
  const ativo = l.businessStatus === "OPERATIONAL";
  const site = classificarSite(l.websiteUri);

  const motivos: string[] = [];
  let pontos = 40;
  const somar = (n: number, motivo?: string) => {
    pontos += n;
    if (motivo) motivos.push(motivo);
  };
  if (site === "sem-site") somar(25, "Não tem site");
  if (site === "so-rede-social") somar(15, "Só tem rede social ou link de bio");
  if (!local) somar(-35, "Sem telefone no Google");
  if (celular) somar(10, "Celular: provável WhatsApp");
  if (dddConfere === true) somar(8, `DDD ${ddd} confere com ${ufEndereco}`);
  if (dddConfere === false) somar(-15, `DDD ${ddd} é de ${ufTelefone}, endereço em ${ufEndereco}`);
  if (avaliacoes >= 3) somar(Math.min(15, Math.round(Math.log10(avaliacoes + 1) * 6)));
  else somar(-20, "Poucas avaliações: pode estar parado");
  if ((l.rating ?? 0) >= 4.5 && avaliacoes >= 10) somar(5, "Clientes adoram: nota alta");

  return {
    id: l.id,
    nome: l.displayName?.text ?? "Sem nome",
    categoria: l.primaryTypeDisplayName?.text ?? "",
    endereco: l.formattedAddress ?? "",
    uf: ufEndereco,
    telefone: local ? `55${local}` : "",
    telefoneVisivel: l.nationalPhoneNumber ?? "",
    celular,
    dddConfere,
    site,
    linkAtual: l.websiteUri ?? "",
    maps: l.googleMapsUri ?? "",
    nota: l.rating ?? null,
    avaliacoes,
    ativo,
    pontos: Math.max(0, Math.min(100, pontos)),
    motivos,
  };
}

const CAMPOS = [
  "places.id", "places.displayName", "places.formattedAddress", "places.addressComponents",
  "places.nationalPhoneNumber", "places.internationalPhoneNumber", "places.websiteUri", "places.googleMapsUri",
  "places.rating", "places.userRatingCount", "places.businessStatus", "places.primaryTypeDisplayName", "nextPageToken",
].join(",");

export async function buscarNegocios({ consulta, cidade, paginas, incluirComSite }: {
  consulta: string;
  cidade: string;
  paginas: number;
  incluirComSite: boolean;
}) {
  const chave = process.env.GOOGLE_PLACES_API_KEY;
  if (!chave) throw new Error("Configure GOOGLE_PLACES_API_KEY na Vercel para o robô funcionar.");
  const base = process.env.GOOGLE_PLACES_URL ?? "https://places.googleapis.com/v1/places:searchText";

  const lugares: LugarGoogle[] = [];
  let pageToken: string | undefined;
  let chamadas = 0;
  for (let i = 0; i < paginas; i++) {
    const r = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": chave, "X-Goog-FieldMask": CAMPOS },
      body: JSON.stringify({ textQuery: `${consulta} em ${cidade}`, languageCode: "pt-BR", regionCode: "BR", pageSize: 20, pageToken }),
      signal: AbortSignal.timeout(15000),
    });
    chamadas++;
    if (!r.ok) {
      const erro = await r.text();
      throw new Error(`Google Places respondeu ${r.status}: ${erro.slice(0, 200)}`);
    }
    const json = (await r.json()) as { places?: LugarGoogle[]; nextPageToken?: string };
    lugares.push(...(json.places ?? []));
    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }

  const todos = lugares.map(analisar);
  const lista = todos
    .filter((p) => p.ativo && (incluirComSite || p.site !== "tem-site"))
    .sort((a, b) => b.pontos - a.pontos);

  return {
    lista,
    resumo: {
      encontrados: todos.length,
      fechados: todos.filter((p) => !p.ativo).length,
      comSite: todos.filter((p) => p.site === "tem-site").length,
      oportunidades: lista.length,
      chamadas,
    },
  };
}
