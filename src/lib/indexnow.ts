import "server-only";
import { siteUrl } from "./config";

// IndexNow: avisa o Bing (base da busca do ChatGPT e do Copilot) e outros buscadores para lerem as páginas na hora.
// A chave é pública de propósito: o arquivo /092475f2830ddb33360c9c4a99ffaa27.txt prova que o site é seu.
export const CHAVE_INDEXNOW = "092475f2830ddb33360c9c4a99ffaa27";

export async function avisarBuscadores(urls: string[]) {
  const host = new URL(siteUrl).host;
  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: CHAVE_INDEXNOW, keyLocation: `${siteUrl}/${CHAVE_INDEXNOW}.txt`, urlList: urls.slice(0, 10000) }),
    signal: AbortSignal.timeout(15000),
  });
  return r.status;
}
