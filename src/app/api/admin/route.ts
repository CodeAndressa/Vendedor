import { chaveAdminConfere } from "@/lib/servidor";

// Confere a chave das telas internas (painel admin, gerador de propostas).
export async function POST(request: Request) {
  const ok = chaveAdminConfere(request.headers.get("x-admin-chave"));
  return Response.json({ ok }, { status: ok ? 200 : 401 });
}
