import "server-only";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { ondeGuarda, pipeline } from "./armazem";

// Métricas do site, sem dado pessoal: só contadores por dia.
// No Redis: um hash por dia ("m:AAAA-MM-DD", campo "chave" ou "chave|detalhe") e um HyperLogLog
// de visitantes ("v:AAAA-MM-DD"). No computador, sem Redis, cada medição vira uma linha em .dados/metricas.log
// (só acréscimo, então duas gravações ao mesmo tempo nunca apagam uma à outra).

const DIAS_GUARDADOS = 400;
const arquivo = join(process.cwd(), ".dados", "metricas.log");

type Local = Record<string, { c: Record<string, number>; v: string[] }>;

export const hoje = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10); // horário de Brasília

export function ultimosDias(n: number) {
  const fim = new Date(`${hoje()}T12:00:00Z`).getTime();
  return Array.from({ length: n }, (_, i) => new Date(fim - (n - 1 - i) * 86400000).toISOString().slice(0, 10));
}

async function lerLocal(): Promise<Local> {
  const dados: Local = {};
  let texto = "";
  try {
    texto = await readFile(arquivo, "utf8");
  } catch {
    return dados;
  }
  for (const linha of texto.split("\n")) {
    if (!linha) continue;
    try {
      const { d, c, v } = JSON.parse(linha) as { d: string; c: Record<string, number>; v?: string };
      const dia = (dados[d] ??= { c: {}, v: [] });
      for (const [campo, n] of Object.entries(c)) dia.c[campo] = (dia.c[campo] ?? 0) + n;
      if (v && !dia.v.includes(v)) dia.v.push(v);
    } catch {
      // linha quebrada: ignora
    }
  }
  return dados;
}

// Soma contadores do dia. Ex.: somar({ visitas: 1, "pag|/analise-ia": 1 })
export async function somar(contadores: Record<string, number>, visitante?: string) {
  const dia = hoje();
  const onde = ondeGuarda();
  const itens = Object.entries(contadores).filter(([, n]) => Number.isFinite(n) && n !== 0);
  if (onde === "redis") {
    const cmds: (string | number)[][] = itens.map(([campo, n]) => ["HINCRBY", `m:${dia}`, campo, Math.round(n)]);
    cmds.push(["EXPIRE", `m:${dia}`, DIAS_GUARDADOS * 86400]);
    if (visitante) cmds.push(["PFADD", `v:${dia}`, visitante], ["EXPIRE", `v:${dia}`, DIAS_GUARDADOS * 86400]);
    await pipeline(cmds);
  } else if (onde === "arquivo") {
    await mkdir(join(process.cwd(), ".dados"), { recursive: true });
    const c = Object.fromEntries(itens.map(([campo, n]) => [campo, Math.round(n)]));
    await appendFile(arquivo, JSON.stringify({ d: dia, c, v: visitante }) + "\n");
  }
}

export type Dia = { dia: string; c: Record<string, number>; visitantes: number };

export async function lerDias(dias: string[]): Promise<Dia[]> {
  const onde = ondeGuarda();
  if (onde === "redis") {
    const cmds = dias.flatMap((d) => [["HGETALL", `m:${d}`], ["PFCOUNT", `v:${d}`]]);
    const r = await pipeline<unknown>(cmds);
    return dias.map((dia, i) => {
      const lista = (r[i * 2] as string[] | null) ?? [];
      const c: Record<string, number> = {};
      for (let k = 0; k < lista.length; k += 2) c[lista[k]] = Number(lista[k + 1]);
      return { dia, c, visitantes: Number(r[i * 2 + 1] ?? 0) };
    });
  }
  if (onde === "arquivo") {
    const dados = await lerLocal();
    return dias.map((dia) => ({ dia, c: dados[dia]?.c ?? {}, visitantes: dados[dia]?.v.length ?? 0 }));
  }
  return dias.map((dia) => ({ dia, c: {}, visitantes: 0 }));
}

// Visitantes únicos no período inteiro (no Redis, união dos HyperLogLogs).
export async function visitantesNoPeriodo(dias: string[]) {
  const onde = ondeGuarda();
  if (onde === "redis") {
    const [n] = await pipeline<number>([["PFCOUNT", ...dias.map((d) => `v:${d}`)]]);
    return Number(n ?? 0);
  }
  if (onde === "arquivo") {
    const dados = await lerLocal();
    return new Set(dias.flatMap((d) => dados[d]?.v ?? [])).size;
  }
  return 0;
}

// ---------- classificação de origem e robôs ----------

const fontesIA: [RegExp, string][] = [
  [/chatgpt\.com|chat\.openai\.com/, "ChatGPT"],
  [/perplexity\.ai/, "Perplexity"],
  [/gemini\.google\.com|bard\.google\.com/, "Gemini"],
  [/copilot\.microsoft\.com|bing\.com\/chat/, "Copilot"],
  [/claude\.ai/, "Claude"],
  [/meta\.ai/, "Meta AI"],
  [/deepseek\.com/, "DeepSeek"],
];

export function classificarOrigem(referrer: string, utm: string) {
  const texto = `${referrer} ${utm}`.toLowerCase();
  const ia = fontesIA.find(([re]) => re.test(texto));
  if (ia) return { origem: "ia", ia: ia[1] };
  if (/google\./.test(texto)) return { origem: "google" };
  if (/bing\.com|duckduckgo/.test(texto)) return { origem: "outras buscas" };
  if (/instagram|l\.instagram/.test(texto)) return { origem: "instagram" };
  if (/facebook|fb\.|meta/.test(texto)) return { origem: "facebook" };
  if (/whatsapp|wa\.me/.test(texto)) return { origem: "whatsapp" };
  if (/linkedin/.test(texto)) return { origem: "linkedin" };
  if (!referrer && !utm) return { origem: "direto" };
  return { origem: "outros sites" };
}

// Robôs que leem o site para as IAs e para as buscas.
export const robos: [RegExp, string, "ia" | "busca"][] = [
  [/OAI-SearchBot/i, "ChatGPT (busca)", "ia"],
  [/ChatGPT-User/i, "ChatGPT (usuário)", "ia"],
  [/GPTBot/i, "OpenAI (treino)", "ia"],
  [/PerplexityBot|Perplexity-User/i, "Perplexity", "ia"],
  [/ClaudeBot|Claude-User|Claude-SearchBot/i, "Claude", "ia"],
  [/Google-CloudVertexBot|GoogleOther/i, "Google IA", "ia"],
  [/meta-externalagent|FacebookBot/i, "Meta IA", "ia"],
  [/Applebot/i, "Apple", "ia"],
  [/Amazonbot/i, "Amazon", "ia"],
  [/DuckAssistBot/i, "DuckDuckGo IA", "ia"],
  [/Googlebot/i, "Google", "busca"],
  [/bingbot/i, "Bing (usado pelo ChatGPT e Copilot)", "busca"],
];

export function identificarRobo(userAgent: string) {
  const achado = robos.find(([re]) => re.test(userAgent));
  return achado ? { nome: achado[1], tipo: achado[2] } : null;
}
