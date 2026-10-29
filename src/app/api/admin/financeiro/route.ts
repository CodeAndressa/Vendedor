import { semCache } from "@/lib/admin";
import { lerFinanceiro } from "@/lib/financeiro";
import { adminAutorizado } from "@/lib/servidor";

// Faturamento e clientes ativos, direto do Asaas.
export async function GET(request: Request) {
  const negado = await adminAutorizado(request);
  if (negado) return negado;
  const forcar = new URL(request.url).searchParams.has("atualizar");
  return Response.json({ ok: true, ...(await lerFinanceiro(forcar)) }, { headers: semCache });
}
