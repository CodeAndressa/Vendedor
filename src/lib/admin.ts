import "server-only";
import { chaveAdminConfere } from "./servidor";

// Rotas do painel só respondem com a ADMIN_CHAVE no cabeçalho x-admin-chave.
export function semAcesso(request: Request) {
  return chaveAdminConfere(request.headers.get("x-admin-chave")) ? null : Response.json({ ok: false }, { status: 401 });
}

export const semCache = { "Cache-Control": "no-store" };
