import "server-only";
import { createHash } from "node:crypto";
import { pipeline, redis } from "./armazem";

// Limites de uso por visitante (IP), por documento, por proposta etc. e pequenos valores temporários.
// Com o Upstash Redis (KV_REST_API_URL/TOKEN) vale para todas as instâncias do servidor; sem Redis
// (no computador) fica na memória do processo, o que basta para desenvolver.

type Memoria = Map<string, { valor: string; expira: number }>;
const global_ = globalThis as unknown as { __limites?: Memoria };
const memoria: Memoria = (global_.__limites ??= new Map());

function limparMemoria() {
  if (memoria.size < 5000) return;
  const agora = Date.now();
  for (const [k, v] of memoria) if (v.expira <= agora) memoria.delete(k);
  if (memoria.size > 20000) memoria.clear();
}

// Nada de IP, CPF ou e-mail em texto puro nas chaves do Redis.
export const resumo = (texto: string) => createHash("sha256").update(texto).digest("base64url").slice(0, 22);

// IP de quem chamou. Na Vercel o x-real-ip/x-forwarded-for é preenchido pela própria plataforma.
export function ipDe(request: Request) {
  const real = request.headers.get("x-real-ip")?.trim();
  const encaminhado = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  return (real || encaminhado || "local").slice(0, 64);
}

export type Resultado = { ok: boolean; usados: number; max: number };

// Conta mais um uso na janela (fixa) e diz se ainda está dentro do limite.
// Se o Redis falhar: "liberar" (padrão) deixa passar; "bloquear" recusa (para rotas caras como pagamento).
export async function limitar(
  nome: string,
  chave: string,
  max: number,
  janelaSegundos: number,
  seFalhar: "liberar" | "bloquear" = "liberar",
): Promise<Resultado> {
  const k = `lim:${nome}:${resumo(chave)}`;
  if (redis()) {
    try {
      const [, n] = await pipeline<number | string>([
        ["SET", k, 0, "EX", janelaSegundos, "NX"],
        ["INCR", k],
      ]);
      const usados = Number(n);
      return { ok: usados <= max, usados, max };
    } catch (e) {
      console.error("Limite: Redis falhou", nome, e);
      return { ok: seFalhar === "liberar", usados: 0, max };
    }
  }
  limparMemoria();
  const agora = Date.now();
  const atual = memoria.get(k);
  const usados = atual && atual.expira > agora ? Number(atual.valor) + 1 : 1;
  memoria.set(k, { valor: String(usados), expira: atual && atual.expira > agora ? atual.expira : agora + janelaSegundos * 1000 });
  return { ok: usados <= max, usados, max };
}

// Só confere quantos usos já houve, sem contar mais um (ex.: tentativas erradas de senha).
export async function excedeu(nome: string, chave: string, max: number): Promise<boolean> {
  const k = `lim:${nome}:${resumo(chave)}`;
  if (redis()) {
    try {
      const [n] = await pipeline<string | null>([["GET", k]]);
      return Number(n ?? 0) >= max;
    } catch {
      return false;
    }
  }
  const atual = memoria.get(k);
  return !!atual && atual.expira > Date.now() && Number(atual.valor) >= max;
}

// Valor temporário (JSON) com validade, ex.: link de cobrança já criado para uma proposta.
export async function lerTemporario<T>(chave: string): Promise<T | null> {
  const k = `tmp:${chave}`;
  if (redis()) {
    try {
      const [bruto] = await pipeline<string | null>([["GET", k]]);
      return bruto ? (JSON.parse(bruto) as T) : null;
    } catch (e) {
      console.error("Temporário: Redis falhou", e);
      return null;
    }
  }
  const atual = memoria.get(k);
  return atual && atual.expira > Date.now() ? (JSON.parse(atual.valor) as T) : null;
}

export async function gravarTemporario(chave: string, valor: unknown, segundos: number) {
  const k = `tmp:${chave}`;
  if (redis()) {
    try {
      await pipeline([["SET", k, JSON.stringify(valor), "EX", segundos]]);
    } catch (e) {
      console.error("Temporário: Redis falhou", e);
    }
    return;
  }
  limparMemoria();
  memoria.set(k, { valor: JSON.stringify(valor), expira: Date.now() + segundos * 1000 });
}

// Trava curta (SET NX): true se conseguiu. Evita duas cobranças com clique duplo.
export async function travar(chave: string, segundos: number): Promise<boolean> {
  const k = `trava:${chave}`;
  if (redis()) {
    try {
      const [r] = await pipeline<string | null>([["SET", k, 1, "EX", segundos, "NX"]]);
      return r === "OK";
    } catch {
      return false;
    }
  }
  const atual = memoria.get(k);
  if (atual && atual.expira > Date.now()) return false;
  memoria.set(k, { valor: "1", expira: Date.now() + segundos * 1000 });
  return true;
}

export async function destravar(chave: string) {
  const k = `trava:${chave}`;
  if (redis()) {
    await pipeline([["DEL", k]]).catch(() => {});
    return;
  }
  memoria.delete(k);
}

export const muitasTentativas = (mensagem = "Muitas tentativas seguidas. Tente de novo mais tarde.") =>
  Response.json({ ok: false, erro: mensagem }, { status: 429, headers: { "Retry-After": "600" } });
