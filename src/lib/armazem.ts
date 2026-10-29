import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Guarda os avisos do site (leads, propostas abertas, checkouts, pagamentos) para o painel /admin.
// Na Vercel: instale o Upstash Redis pelo Marketplace (Storage → Upstash → Redis). Ele cria sozinho
// KV_REST_API_URL e KV_REST_API_TOKEN. No computador, sem Redis, os avisos ficam em .dados/eventos.json.

export type Situacao = "novo" | "conversando" | "proposta" | "fechou" | "perdido";
export const situacoes: Situacao[] = ["novo", "conversando", "proposta", "fechou", "perdido"];

export type Evento = {
  id: string;
  tipo: string;
  recebido_em: string;
  situacao?: Situacao;
  [campo: string]: unknown;
};

const LIMITE = 5000;
const arquivo = join(process.cwd(), ".dados", "eventos.json");

export function redis() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export function ondeGuarda(): "redis" | "arquivo" | "nenhum" {
  if (redis()) return "redis";
  return process.env.NODE_ENV === "production" ? "nenhum" : "arquivo";
}

export async function comando<T>(...partes: (string | number)[]): Promise<T> {
  const r = redis()!;
  const resp = await fetch(r.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${r.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(partes),
    signal: AbortSignal.timeout(5000),
    cache: "no-store",
  });
  const json = (await resp.json()) as { result?: T; error?: string };
  if (!resp.ok || json.error) throw new Error(json.error ?? `Redis respondeu ${resp.status}`);
  return json.result as T;
}

async function lerArquivo(): Promise<Evento[]> {
  try {
    return JSON.parse(await readFile(arquivo, "utf8")) as Evento[];
  } catch {
    return [];
  }
}

async function gravarArquivo(eventos: Evento[]) {
  await mkdir(join(process.cwd(), ".dados"), { recursive: true });
  await writeFile(arquivo, JSON.stringify(eventos.slice(0, LIMITE), null, 2));
}

export async function guardar(evento: Evento) {
  const onde = ondeGuarda();
  if (onde === "redis") {
    await comando("LPUSH", "eventos", JSON.stringify(evento));
    await comando("LTRIM", "eventos", 0, LIMITE - 1);
  } else if (onde === "arquivo") {
    await gravarArquivo([evento, ...(await lerArquivo())]);
  }
}

// Mais recentes primeiro, já com a situação que você marcou no painel.
export async function listar(limite = 1000): Promise<Evento[]> {
  const onde = ondeGuarda();
  if (onde === "arquivo") return (await lerArquivo()).slice(0, limite);
  if (onde === "nenhum") return [];
  const [linhas, marcadas] = await Promise.all([
    comando<string[]>("LRANGE", "eventos", 0, limite - 1),
    comando<string[]>("HGETALL", "situacao"),
  ]);
  const mapa = new Map<string, Situacao>();
  for (let i = 0; i < marcadas.length; i += 2) mapa.set(marcadas[i], marcadas[i + 1] as Situacao);
  return linhas.map((l) => {
    const e = JSON.parse(l) as Evento;
    return mapa.has(e.id) ? { ...e, situacao: mapa.get(e.id) } : e;
  });
}

export async function marcarSituacao(id: string, situacao: Situacao) {
  const onde = ondeGuarda();
  if (onde === "redis") {
    await comando("HSET", "situacao", id, situacao);
  } else if (onde === "arquivo") {
    const eventos = await lerArquivo();
    await gravarArquivo(eventos.map((e) => (e.id === id ? { ...e, situacao } : e)));
  }
}

// Vários comandos numa ida só ao Redis (endpoint /pipeline do Upstash).
export async function pipeline<T = unknown>(comandos: (string | number)[][]): Promise<T[]> {
  if (!comandos.length) return [];
  const r = redis()!;
  const resp = await fetch(`${r.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${r.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(comandos),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  const json = (await resp.json()) as { result?: T; error?: string }[];
  if (!resp.ok || !Array.isArray(json)) throw new Error(`Redis respondeu ${resp.status}`);
  return json.map((x) => x.result as T);
}

// Chave e valor (JSON) para listas pequenas: sites dos clientes, resultados do monitor, testes de IA.
const arquivoValores = join(process.cwd(), ".dados", "valores.json");

async function lerValores(): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await readFile(arquivoValores, "utf8"));
  } catch {
    return {};
  }
}

export async function lerValor<T>(chave: string, padrao: T): Promise<T> {
  const onde = ondeGuarda();
  if (onde === "redis") {
    const bruto = await comando<string | null>("GET", `valor:${chave}`);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  }
  if (onde === "arquivo") return ((await lerValores())[chave] as T) ?? padrao;
  return padrao;
}

export async function gravarValor(chave: string, valor: unknown) {
  const onde = ondeGuarda();
  if (onde === "redis") await comando("SET", `valor:${chave}`, JSON.stringify(valor));
  else if (onde === "arquivo") {
    const todos = await lerValores();
    todos[chave] = valor;
    await mkdir(join(process.cwd(), ".dados"), { recursive: true });
    await writeFile(arquivoValores, JSON.stringify(todos, null, 2));
  }
}
