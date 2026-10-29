import { semAcesso, semCache } from "@/lib/admin";
import { lerFinanceiro } from "@/lib/financeiro";

// Faturamento e clientes ativos, direto do Asaas.
export async function GET(request: Request) {
  const negado = semAcesso(request);
  if (negado) return negado;
  const forcar = new URL(request.url).searchParams.has("atualizar");
  return Response.json({ ok: true, ...(await lerFinanceiro(forcar)) }, { headers: semCache });
}
