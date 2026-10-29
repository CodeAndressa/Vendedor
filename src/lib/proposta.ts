import { ehBase, ehExtra, type Base, type Extra } from "./catalogo";
import { modeloPorSlug } from "./modelos";

// Dados de uma proposta. Vão no link (codificados) e são assinados pelo servidor,
// para ninguém conseguir editar o link e inventar um desconto.
export type Proposta = {
  cliente: string;
  negocio: string;
  segmento?: string;
  objetivo?: string;
  modelo?: string; // slug de um modelo
  base: Base;
  extras: Extra[];
  desconto: number; // em reais
  observacao?: string;
  emitida: string; // AAAA-MM-DD
  validade: string; // AAAA-MM-DD
  // Comparativo "hoje × novo": site atual do cliente OU o perfil dele no Google Maps
  atualSite?: string;
  maps?: { nome: string; nota?: number; avaliacoes?: number; endereco?: string; categoria?: string; url?: string; link?: string };
  previa?: string; // link de uma prévia real que você montou (senão usa o modelo com o nome do negócio)
  entregue?: string; // link do site entregue (usado na página de resultado)
};

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const dataValida = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
function url(v: unknown) {
  const t = texto(v, 300);
  if (!t) return undefined;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}
const numero = (v: unknown, max: number) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : undefined;
};

export function hoje(diasAFrente = 0) {
  const d = new Date();
  d.setDate(d.getDate() + diasAFrente);
  return d.toISOString().slice(0, 10);
}

// Limpa qualquer entrada (de formulário ou do link) para o formato de proposta.
export function normalizar(dados: Record<string, unknown>): Proposta | null {
  const cliente = texto(dados.cliente, 80);
  const negocio = texto(dados.negocio, 80);
  if (!cliente && !negocio) return null;
  const m = dados.maps && typeof dados.maps === "object" ? (dados.maps as Record<string, unknown>) : null;
  const maps = m && texto(m.nome, 80)
    ? {
        nome: texto(m.nome, 80),
        nota: numero(m.nota, 5),
        avaliacoes: numero(m.avaliacoes, 1_000_000),
        endereco: texto(m.endereco, 160) || undefined,
        categoria: texto(m.categoria, 60) || undefined,
        url: url(m.url),
        link: url(m.link),
      }
    : undefined;
  const modelo = texto(dados.modelo, 40);
  const extras = Array.isArray(dados.extras) ? [...new Set(dados.extras.filter(ehExtra))] : [];
  const desconto = Math.max(0, Math.min(Number(dados.desconto) || 0, 5000));
  return {
    cliente,
    negocio,
    segmento: texto(dados.segmento, 60) || undefined,
    objetivo: texto(dados.objetivo, 80) || undefined,
    modelo: modelo && modeloPorSlug(modelo) ? modelo : undefined,
    base: ehBase(dados.base) ? dados.base : "site",
    extras,
    desconto: Math.round(desconto * 100) / 100,
    observacao: texto(dados.observacao, 600) || undefined,
    emitida: dataValida(dados.emitida) ? (dados.emitida as string) : hoje(),
    validade: dataValida(dados.validade) ? (dados.validade as string) : hoje(7),
    atualSite: url(dados.atualSite),
    maps,
    previa: url(dados.previa),
    entregue: url(dados.entregue),
  };
}

export function codificar(p: Proposta) {
  return Buffer.from(JSON.stringify(p), "utf8").toString("base64url");
}

export function decodificar(codigo: string): Proposta | null {
  try {
    return normalizar(JSON.parse(Buffer.from(codigo, "base64url").toString("utf8")));
  } catch {
    return null;
  }
}

export function formatarData(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
