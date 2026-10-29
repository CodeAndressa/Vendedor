import "server-only";
import { cacheLife } from "next/cache";

// Mede um site como o Google mede no celular (PageSpeed Insights) e devolve a nota,
// o tempo até aparecer e a imagem da tela. Fica guardado em cache por uma semana,
// então a primeira abertura demora uns segundos e as próximas são instantâneas.

export type Medicao = { nota: number; tempo: string; segundos: number; tela: string | null };

async function medir(url: string): Promise<Medicao> {
  "use cache";
  cacheLife("weeks");
  const base = process.env.PAGESPEED_URL ?? "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const chave = process.env.PAGESPEED_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY;
  const q = new URLSearchParams({ url, strategy: "mobile", category: "performance", locale: "pt_BR" });
  if (chave) q.set("key", chave);
  const r = await fetch(`${base}?${q}`, { signal: AbortSignal.timeout(50000) });
  if (!r.ok) throw new Error(`PageSpeed respondeu ${r.status}`);
  const json = await r.json();
  const lh = json.lighthouseResult;
  const lcp = lh?.audits?.["largest-contentful-paint"];
  const nota = lh?.categories?.performance?.score;
  if (typeof nota !== "number") throw new Error("PageSpeed sem nota");
  // Erros não entram no cache (a função lança antes de retornar), então uma falha passageira não fica gravada.
  return {
    nota: Math.round(nota * 100),
    tempo: String(lcp?.displayValue ?? "").replace(/ /g, " "),
    segundos: Math.round((lcp?.numericValue ?? 0) / 100) / 10,
    tela: lh?.audits?.["final-screenshot"]?.details?.data ?? null,
  };
}

export async function medirSite(url: string): Promise<Medicao | null> {
  try {
    return await medir(url);
  } catch (e) {
    console.error("Não consegui medir", url, e);
    return null;
  }
}
