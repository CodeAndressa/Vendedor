import "server-only";
import { gravarValor, lerValor } from "./armazem";

// Plano B do robô de prospecção, sem chave nem cartão: busca negócios no OpenStreetMap.
// 1) Nominatim acha a cidade; 2) Overpass lista os negócios daquele tipo dentro dela e, ao mesmo tempo,
// a busca do próprio Nominatim serve de reserva (os servidores públicos do Overpass vivem lotados).
// Os dois resultados são juntos, sem repetição, e guardados em cache por algumas horas.
// No Brasil a base é menos completa que a do Google (telefone e site às vezes faltam), mas é grátis.

const AGENTE = "SoaresLab-Prospeccao/1.0 (+https://soareslab.com)";
// Espelhos públicos do Overpass com dados do mundo todo. A cada busca começa por um diferente, para dividir a carga.
const SERVIDORES = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const PRAZO_OVERPASS = 22_000; // tempo total para o Overpass responder (com tentativas)
const TEMPO_POR_TENTATIVA = 12_000;
const FOLGA_DEPOIS_DO_NOMINATIM = 3_000; // se o Nominatim já trouxe o bastante, espera só mais isso pelo Overpass
const MAX_PEDIDOS_NOMINATIM = 6;
const CACHE_CHAVE = "prospeccao-osm";
const CACHE_HORAS = 6; // resultado completo (com Overpass)
const CACHE_HORAS_PARCIAL = 1; // só com Nominatim: tenta o Overpass de novo mais cedo
const CACHE_DIAS_CIDADE = 30;

export type LugarOSM = {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
  addressComponents: { shortText: string; types: string[] }[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri: string;
  businessStatus: string;
  primaryTypeDisplayName: { text: string };
  fonte: "osm";
};

export type ResultadoOSM = {
  lugares: LugarOSM[];
  origem: "overpass" | "nominatim" | "overpass+nominatim";
  emCache: boolean;
};

// tipo de negócio digitado → filtros do OpenStreetMap
const tipos: [RegExp, string[]][] = [
  [/hamburg|burger|lanch/, ['["amenity"="fast_food"]["cuisine"~"burger",i]', '["amenity"~"fast_food|restaurant"]["name"~"burger|hamburg|lanche",i]']],
  [/pizz/, ['["amenity"~"restaurant|fast_food"]["cuisine"~"pizza",i]', '["name"~"pizz",i]["amenity"]']],
  [/restaurante|comida|almo/, ['["amenity"="restaurant"]']],
  [/japon|sushi/, ['["amenity"="restaurant"]["cuisine"~"japanese|sushi",i]']],
  [/padaria|panific/, ['["shop"="bakery"]']],
  [/confeit|doce|bolo/, ['["shop"~"confectionery|pastry"]']],
  [/caf[eé]/, ['["amenity"="cafe"]']],
  [/sorvet|a[cç]a[ií]/, ['["amenity"="ice_cream"]', '["name"~"a[cç]a[ií]",i]']],
  [/\bbar\b|pub|cervej/, ['["amenity"~"bar|pub"]']],
  [/dentist|odonto/, ['["amenity"="dentist"]', '["healthcare"="dentist"]']],
  [/cl[ií]nica m[eé]dica|m[eé]dic/, ['["amenity"~"clinic|doctors"]']],
  [/est[eé]tic|harmoniza|spa/, ['["shop"="beauty"]', '["amenity"="spa"]', '["leisure"="spa"]']],
  [/sal[aã]o|cabele|manicure|sobrancel/, ['["shop"~"hairdresser|beauty"]']],
  [/barbear/, ['["shop"="hairdresser"]["name"~"barb",i]', '["hairdresser"="barber"]']],
  [/academia|crossfit|pilates|muscula/, ['["leisure"="fitness_centre"]']],
  [/pet|banho e tosa/, ['["shop"="pet"]', '["shop"="pet_grooming"]']],
  [/veterin/, ['["amenity"="veterinary"]']],
  [/advoga|jur[ií]dic/, ['["office"="lawyer"]']],
  [/contab|contador/, ['["office"="accountant"]']],
  [/imobili|corretor/, ['["office"="estate_agent"]']],
  [/oficina|mec[aâ]nic|auto el/, ['["shop"="car_repair"]']],
  [/lava.?r[aá]pido|est[eé]tica automot/, ['["amenity"="car_wash"]']],
  [/[oó]tica/, ['["shop"="optician"]']],
  [/flor/, ['["shop"="florist"]']],
  [/roupa|moda|boutique/, ['["shop"="clothes"]']],
  [/cal[cç]ado/, ['["shop"="shoes"]']],
  [/farm[aá]cia/, ['["amenity"="pharmacy"]']],
  [/hotel/, ['["tourism"="hotel"]']],
  [/pousada|hostel/, ['["tourism"~"guest_house|hostel"]']],
  [/lavander/, ['["shop"~"laundry|dry_cleaning"]']],
  [/escola|curso|idioma/, ['["amenity"~"school|language_school|music_school|driving_school"]']],
  [/mercado|hortifr/, ['["shop"~"supermarket|convenience|greengrocer"]']],
  [/tatua/, ['["shop"="tattoo"]']],
  [/psic[oó]log|terap/, ['["healthcare"~"psychotherapist|psychologist"]', '["office"="therapist"]']],
  [/fisioter/, ['["healthcare"="physiotherapist"]']],
  [/nutri/, ['["healthcare"="nutrition_counselling"]', '["name"~"nutri",i]']],
];

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const escaparRegex = (t: string) => t.replace(/[.*+?^${}()|[\]\\"]/g, "\\$&");
const dormir = (ms: number, sinal?: AbortSignal) =>
  new Promise<void>((ok) => {
    if (ms <= 0 || sinal?.aborted) return ok();
    const t = setTimeout(ok, ms);
    sinal?.addEventListener("abort", () => (clearTimeout(t), ok()), { once: true });
  });

// ---------- cache (um só registro, com as entradas vencidas limpas a cada gravação) ----------

type EntradaCache = { expira: number; dados: unknown };

async function lerCache<T>(chave: string): Promise<T | null> {
  const tudo = await lerValor<Record<string, EntradaCache>>(CACHE_CHAVE, {}).catch(() => ({}) as Record<string, EntradaCache>);
  const item = tudo[chave];
  return item && item.expira > Date.now() ? (item.dados as T) : null;
}

async function gravarCache(chave: string, dados: unknown, horas: number) {
  try {
    const agora = Date.now();
    const tudo = await lerValor<Record<string, EntradaCache>>(CACHE_CHAVE, {});
    const limpo = Object.fromEntries(Object.entries(tudo).filter(([, v]) => v.expira > agora));
    limpo[chave] = { expira: agora + horas * 3_600_000, dados };
    await gravarValor(CACHE_CHAVE, limpo);
  } catch {
    // sem cache a busca continua funcionando
  }
}

// ---------- Nominatim: no máximo 1 pedido por segundo (política de uso) ----------

let filaNominatim: Promise<unknown> = Promise.resolve();
let ultimoNominatim = 0;

function nominatim<T>(params: Record<string, string>): Promise<T> {
  const vez = filaNominatim.then(async () => {
    await dormir(ultimoNominatim + 1100 - Date.now());
    ultimoNominatim = Date.now();
    const q = new URLSearchParams({ ...params, format: "jsonv2", countrycodes: "br" });
    const r = await fetch(`https://nominatim.openstreetmap.org/search?${q}`, {
      headers: { "User-Agent": AGENTE, "Accept-Language": "pt-BR" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) throw new Error(`OpenStreetMap (Nominatim) respondeu ${r.status}.`);
    return (await r.json()) as T;
  });
  filaNominatim = vez.catch(() => null);
  return vez;
}

type Cidade = { area: number | null; bbox: [number, number, number, number]; uf: string; nome: string };

async function acharCidade(cidade: string): Promise<Cidade> {
  const chave = `cidade:${semAcento(cidade)}`;
  const guardada = await lerCache<Cidade>(chave);
  if (guardada) return guardada;
  const [lugar] = await nominatim<
    { osm_type: string; osm_id: number; boundingbox: string[]; address?: Record<string, string> }[]
  >({ q: cidade, limit: "1", addressdetails: "1", featureType: "settlement" }).catch((e: Error) => {
    throw new Error(`Não consegui localizar a cidade no OpenStreetMap agora (${e.message}). Tente de novo em instantes.`);
  });
  if (!lugar) throw new Error(`Não achei "${cidade}" no OpenStreetMap. Tente "Cidade, UF".`);
  const [sul, norte, oeste, leste] = lugar.boundingbox.map(Number);
  const achada: Cidade = {
    area: lugar.osm_type === "relation" ? 3600000000 + lugar.osm_id : null,
    bbox: [sul, oeste, norte, leste],
    uf: (lugar.address?.["ISO3166-2-lvl4"] ?? "").replace("BR-", ""),
    nome: lugar.address?.city ?? lugar.address?.town ?? lugar.address?.village ?? cidade.split(",")[0].trim(),
  };
  await gravarCache(chave, achada, CACHE_DIAS_CIDADE * 24);
  return achada;
}

// ---------- filtros: o mesmo texto serve de consulta ao Overpass e de conferência nos resultados do Nominatim ----------

type Condicao = { chave: string; regex: boolean; valor: string; semCaixa: boolean };

function lerFiltro(filtro: string): Condicao[] {
  return [...filtro.matchAll(/\["([^"]+)"(?:(=|~)"((?:[^"\\]|\\.)*)"(,i)?)?\]/g)].map((m) => ({
    chave: m[1],
    regex: m[2] === "~",
    valor: m[3] ?? "",
    semCaixa: Boolean(m[4]),
  }));
}

function confere(tags: Record<string, string>, condicoes: Condicao[]) {
  return condicoes.every((c) => {
    const v = tags[c.chave];
    if (v === undefined) return false;
    if (!c.valor && !c.regex) return true; // ["amenity"]: só precisa existir
    if (!c.regex) return v === c.valor;
    try {
      return new RegExp(c.valor, c.semCaixa ? "i" : "").test(v);
    } catch {
      return false;
    }
  });
}

// ["amenity"~"fast_food|restaurant"]... → frases especiais do Nominatim: [amenity=fast_food], [amenity=restaurant]
function frasesNominatim(filtros: string[]) {
  const frases: string[] = [];
  for (const f of filtros) {
    const c = lerFiltro(f).find((x) => x.chave !== "name" && x.valor && !/[\\[\]().*+?^$]/.test(x.valor));
    if (c) for (const v of c.valor.split("|")) frases.push(`[${c.chave}=${v}]`);
  }
  return [...new Set(frases)];
}

// ---------- Overpass ----------

type Elemento = { type: string; id: number; tags?: Record<string, string> };
let proximoServidor = 0;

async function consultarOverpass(corpo: string, cancelar: AbortSignal): Promise<Elemento[] | null> {
  const prazo = Date.now() + PRAZO_OVERPASS;
  const inicio = proximoServidor++ % SERVIDORES.length;
  let espera = 500;
  for (let tentativa = 0; Date.now() < prazo && !cancelar.aborted; tentativa++) {
    const servidor = SERVIDORES[(inicio + tentativa) % SERVIDORES.length];
    const resta = prazo - Date.now();
    if (resta < 2_000) break;
    try {
      const r = await fetch(servidor, {
        method: "POST",
        headers: { "User-Agent": AGENTE, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams({ data: corpo }),
        signal: AbortSignal.any([cancelar, AbortSignal.timeout(Math.min(TEMPO_POR_TENTATIVA, resta))]),
      });
      if (r.ok) {
        const json = (await r.json()) as { elements?: Elemento[]; remark?: string };
        // "remark" com erro = o servidor estourou o tempo e devolveu resultado pela metade
        if (json.elements && !(json.remark && /error|timed out|out of memory/i.test(json.remark))) return json.elements;
      }
    } catch {
      // servidor lotado, fora do ar ou demorou demais: vai para o próximo
    }
    // espera crescente entre as tentativas (0,5 s, 1 s, 2 s, 4 s), já trocando de servidor
    await dormir(Math.min(espera, prazo - Date.now() - 2_000), cancelar);
    espera = Math.min(espera * 2, 4_000);
  }
  return null;
}

// ---------- montagem do resultado ----------

const enderecoDe = (t: Record<string, string>, cidade: string) =>
  [[t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(", "), t["addr:suburb"], t["addr:city"] ?? cidade].filter(Boolean).join(" - ");

// às vezes vêm dois números ("+55 31 9... ;+55 31 3..."): fica o primeiro
const telefoneDe = (t: Record<string, string>) =>
  (t.phone ?? t["contact:phone"] ?? t["contact:mobile"] ?? t["contact:whatsapp"])?.split(/[;,/]/)[0].trim() || undefined;

function paraLugar(id: string, t: Record<string, string>, local: Cidade, consulta: string, uf: string): LugarOSM {
  const telefone = telefoneDe(t);
  const site = t.website ?? t["contact:website"] ?? t["contact:instagram"] ?? t["contact:facebook"];
  return {
    id,
    displayName: { text: t.name },
    formattedAddress: enderecoDe(t, local.nome),
    addressComponents: [{ shortText: uf || local.uf, types: ["administrative_area_level_1"] }],
    nationalPhoneNumber: telefone,
    internationalPhoneNumber: telefone,
    websiteUri: site && !/^https?:/.test(site) && site.includes(".") ? `https://${site}` : site,
    googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t.name} ${local.nome}`)}`,
    businessStatus: "OPERATIONAL",
    primaryTypeDisplayName: { text: consulta },
    fonte: "osm",
  };
}

type ItemNominatim = {
  osm_type: string;
  osm_id: number;
  place_id: number;
  category: string;
  type: string;
  name?: string;
  extratags?: Record<string, string> | null;
  address?: Record<string, string>;
};

async function buscarNoNominatim(
  consulta: string,
  local: Cidade,
  filtros: string[],
  limite: number,
  cancelar: AbortSignal,
): Promise<{ id: string; tags: Record<string, string>; uf: string }[] | null> {
  const [sul, oeste, norte, leste] = local.bbox;
  const base = { limit: "40", extratags: "1", addressdetails: "1", bounded: "1", viewbox: `${oeste},${norte},${leste},${sul}` };
  const condicoes = filtros.map(lerFiltro);
  const achados = new Map<string, { id: string; tags: Record<string, string>; uf: string }>();
  // primeiro o texto digitado (acha pelo nome), depois as categorias do mapa, conferidas com os filtros
  const pedidos: { q: string; conferir: boolean }[] = [
    { q: consulta, conferir: false },
    ...frasesNominatim(filtros).map((q) => ({ q, conferir: true })),
  ];
  let feitos = 0;
  let deramCerto = 0;
  // null = nenhum pedido respondeu (diferente de "respondeu, mas não achou nada")
  const fim = () => (deramCerto || cancelar.aborted ? [...achados.values()] : null);
  for (const pedido of pedidos) {
    const excluir: number[] = [];
    for (let pagina = 0; pagina < 3; pagina++) {
      // junta o dobro do pedido para depois dar preferência a quem tem telefone
      if (cancelar.aborted || feitos >= MAX_PEDIDOS_NOMINATIM || achados.size >= limite * 2) return fim();
      feitos++;
      const params: Record<string, string> = { ...base, q: pedido.q };
      if (excluir.length) params.exclude_place_ids = excluir.join(",");
      const itens = await nominatim<ItemNominatim[]>(params).catch(() => null);
      if (!itens) break;
      deramCerto++;
      for (const it of itens) {
        excluir.push(it.place_id);
        if (!it.name) continue;
        const tags: Record<string, string> = { ...(it.extratags ?? {}), [it.category]: it.type, name: it.name };
        const a = it.address ?? {};
        if (a.road) tags["addr:street"] = a.road;
        if (a.house_number) tags["addr:housenumber"] = a.house_number;
        if (a.suburb ?? a.neighbourhood) tags["addr:suburb"] = (a.suburb ?? a.neighbourhood)!;
        const municipio = a.city ?? a.town ?? a.village ?? a.municipality;
        // o retângulo da cidade pega pedaços das vizinhas (ex.: Guarulhos em São Paulo): fica só quem é da cidade
        if (municipio && semAcento(municipio) !== semAcento(local.nome)) continue;
        if (municipio) tags["addr:city"] = municipio;
        if (pedido.conferir && !condicoes.some((c) => confere(tags, c))) continue;
        if (!pedido.conferir && !["amenity", "shop", "office", "healthcare", "leisure", "tourism", "craft"].includes(it.category)) continue;
        const id = `osm-${it.osm_type}-${it.osm_id}`;
        if (!achados.has(id)) achados.set(id, { id, tags, uf: (a["ISO3166-2-lvl4"] ?? "").replace("BR-", "") });
      }
      if (itens.length < 40) break;
    }
  }
  return fim();
}

export async function buscarNoOSM(consulta: string, cidade: string, limite: number): Promise<ResultadoOSM> {
  const chaveCache = `busca:${semAcento(consulta)}|${semAcento(cidade)}`;
  const guardado = await lerCache<{ limite: number; lugares: LugarOSM[]; origem: ResultadoOSM["origem"] }>(chaveCache);
  if (guardado && (guardado.limite >= limite || guardado.lugares.length < guardado.limite))
    return { lugares: guardado.lugares.slice(0, limite), origem: guardado.origem, emCache: true };

  const local = await acharCidade(cidade);
  const termo = semAcento(consulta);
  const filtros = [...(tipos.find(([re]) => re.test(termo))?.[1] ?? [])];
  // reserva: qualquer lugar com o termo no nome
  filtros.push(`["name"~"${escaparRegex(consulta)}",i]`);

  // consulta leve: tempo e memória limitados, só as tags, sem ordenar, com teto de resultados
  const recorte = local.area ? `(area.a)` : `(${local.bbox.join(",")})`;
  const corpo =
    `[out:json][timeout:15][maxsize:33554432];` +
    (local.area ? `area(id:${local.area})->.a;` : "") +
    `(${filtros.map((f) => `nwr${f}${recorte};`).join("")});out tags qt ${limite * 3};`;

  // Overpass e Nominatim ao mesmo tempo; se o Nominatim já trouxe o bastante, o Overpass ganha só uma folga curta
  const pararOverpass = new AbortController();
  const pararNominatim = new AbortController();
  const overpass = consultarOverpass(corpo, pararOverpass.signal).then((r) => {
    if (r && r.length >= limite) pararNominatim.abort();
    return r;
  });
  const nominatimRes = buscarNoNominatim(consulta, local, filtros, limite, pararNominatim.signal)
    .catch(() => null)
    .then((r) => {
      if (r && r.length >= limite) setTimeout(() => pararOverpass.abort(), FOLGA_DEPOIS_DO_NOMINATIM);
      return r;
    });
  const [elementos, doNominatim] = await Promise.all([overpass, nominatimRes]);

  if (!elementos && !doNominatim?.length) {
    if (doNominatim) return { lugares: [], origem: "nominatim", emCache: false };
    throw new Error(
      "Os servidores públicos do OpenStreetMap estão sobrecarregados agora e não responderam a tempo. " +
        "Tente de novo em alguns minutos (ou configure a chave do Google Places para buscas mais estáveis).",
    );
  }

  const candidatos = [
    ...(elementos ?? []).filter((e) => e.tags?.name).map((e) => ({ id: `osm-${e.type}-${e.id}`, tags: e.tags!, uf: "" })),
    ...(doNominatim ?? []),
  ];
  const vistos = new Set<string>();
  const lugares = candidatos
    .filter((c) => !c.tags["disused:amenity"] && !c.tags["disused:shop"])
    .sort((a, b) => Number(Boolean(telefoneDe(b.tags))) - Number(Boolean(telefoneDe(a.tags)))) // quem tem telefone primeiro
    .filter((c) => {
      const chave = semAcento(c.tags.name);
      if (vistos.has(chave) || vistos.has(c.id)) return false;
      vistos.add(chave);
      vistos.add(c.id);
      return true;
    })
    .slice(0, limite)
    .map((c) => paraLugar(c.id, c.tags, local, consulta, c.uf));

  const origem: ResultadoOSM["origem"] = elementos && doNominatim?.length ? "overpass+nominatim" : elementos ? "overpass" : "nominatim";
  await gravarCache(chaveCache, { limite, lugares, origem }, elementos ? CACHE_HORAS : CACHE_HORAS_PARCIAL);
  return { lugares, origem, emCache: false };
}
