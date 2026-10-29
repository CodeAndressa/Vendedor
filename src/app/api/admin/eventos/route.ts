import { listar, marcarSituacao, ondeGuarda, situacoes, type Situacao } from "@/lib/armazem";
import { asaasConfigurado } from "@/lib/asaas";
import { emailConfigurado } from "@/lib/email";
import { chaveAdminConfere } from "@/lib/servidor";

// Dados do painel /admin. Só responde com a ADMIN_CHAVE no cabeçalho x-admin-chave.

const negado = () => Response.json({ ok: false }, { status: 401 });

export async function GET(request: Request) {
  if (!chaveAdminConfere(request.headers.get("x-admin-chave"))) return negado();
  const eventos = await listar();
  return Response.json(
    {
      ok: true,
      eventos,
      config: { onde: ondeGuarda(), email: emailConfigurado(), asaas: asaasConfigurado(), ambiente: process.env.ASAAS_AMBIENTE ?? "sandbox" },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  if (!chaveAdminConfere(request.headers.get("x-admin-chave"))) return negado();
  const c = (await request.json().catch(() => ({}))) as { id?: unknown; situacao?: unknown };
  if (typeof c.id !== "string" || !situacoes.includes(c.situacao as Situacao))
    return Response.json({ ok: false, erro: "Dados inválidos." }, { status: 400 });
  await marcarSituacao(c.id, c.situacao as Situacao);
  return Response.json({ ok: true });
}
