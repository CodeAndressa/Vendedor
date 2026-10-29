import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Baixa uma página pública digitada pelo visitante sem deixar o servidor ser usado para acessar
// a rede interna (SSRF): só http/https nas portas padrão, nada de IP privado, redirecionamentos conferidos
// um a um e tamanho máximo de resposta.

const MAX_BYTES = 1_500_000;

function ipv4Privado(ip: string) {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0)) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function ipPrivado(ip: string) {
  if (isIP(ip) === 4) return ipv4Privado(ip);
  const v6 = ip.toLowerCase();
  const mapeado = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapeado) return ipv4Privado(mapeado[1]);
  return v6 === "::" || v6 === "::1" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6);
}

async function enderecoSeguro(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (isIP(host)) return !ipPrivado(host);
  try {
    const ips = await lookup(host, { all: true });
    return ips.length > 0 && ips.every((r) => !ipPrivado(r.address));
  } catch {
    return false;
  }
}

export type Pagina = { url: string; status: number; html: string; https: boolean };

export async function baixarPagina(endereco: string, tempo = 8000): Promise<Pagina | null> {
  let url: URL;
  try {
    url = new URL(endereco);
  } catch {
    return null;
  }
  const limite = AbortSignal.timeout(tempo);
  for (let salto = 0; salto < 4; salto++) {
    if (!(await enderecoSeguro(url))) return null;
    const r = await fetch(url, {
      redirect: "manual",
      signal: limite,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AnaliseIA/1.0; +https://andressasoares.com.br)", Accept: "text/html,*/*" },
    }).catch(() => null);
    if (!r) return null;
    const destino = r.headers.get("location");
    if (r.status >= 300 && r.status < 400 && destino) {
      url = new URL(destino, url);
      continue;
    }
    // lê no máximo MAX_BYTES
    const leitor = r.body?.getReader();
    const partes: Uint8Array[] = [];
    let total = 0;
    while (leitor) {
      const { done, value } = await leitor.read().catch(() => ({ done: true, value: undefined }));
      if (done || !value) break;
      partes.push(value);
      total += value.length;
      if (total > MAX_BYTES) {
        await leitor.cancel().catch(() => {});
        break;
      }
    }
    const html = new TextDecoder().decode(Buffer.concat(partes));
    return { url: url.toString(), status: r.status, html, https: url.protocol === "https:" };
  }
  return null;
}
