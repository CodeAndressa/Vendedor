import { adminAutorizado } from "@/lib/servidor";

// Confere a chave das telas internas (painel admin, gerador de propostas). Tentativas erradas têm limite por IP.
export async function POST(request: Request) {
  const negado = await adminAutorizado(request);
  return negado ?? Response.json({ ok: true });
}
