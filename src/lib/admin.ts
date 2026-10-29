import "server-only";
import { adminAutorizado } from "./servidor";

// Rotas do painel só respondem com a ADMIN_CHAVE no cabeçalho x-admin-chave
// (com trava: depois de muitas tentativas erradas, o IP espera 15 minutos).
export const semAcesso = adminAutorizado;

export const semCache = { "Cache-Control": "no-store" };
