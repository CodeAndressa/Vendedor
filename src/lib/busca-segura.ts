import "server-only";
import { lookup } from "node:dns/promises";
import { request as requestHttp, type IncomingMessage } from "node:http";
import { request as requestHttps } from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";

// Baixa uma página pública digitada pelo visitante sem deixar o servidor ser usado para acessar
// a rede interna (SSRF): só http/https nas portas padrão, nada de IP privado/reservado (inclusive IPv4
// escondido dentro de IPv6), redirecionamentos conferidos um a um e tamanho máximo de resposta.
// O IP conferido é o MESMO usado na conexão (lookup fixo), então um DNS que muda de resposta entre a
// conferência e a conexão (DNS rebinding) não consegue apontar para dentro.

const MAX_BYTES = 1_500_000;

const bloqueados = new BlockList();
for (const [rede, prefixo] of [
  ["0.0.0.0", 8], // "esta rede"
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // CGNAT
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // link-local (metadados de nuvem)
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reservado e broadcast
] as const)
  bloqueados.addSubnet(rede, prefixo, "ipv4");
for (const [rede, prefixo] of [
  ["::", 128],
  ["::1", 128],
  ["100::", 64], // descarte
  ["2001:db8::", 32], // documentação
  ["2001::", 32], // Teredo (IPv4 embutido e ofuscado)
  ["2002::", 16], // 6to4 (conferido abaixo pelo IPv4 embutido, mas bloqueado de qualquer jeito)
  ["64:ff9b:1::", 48], // NAT64 local
  ["fc00::", 7], // ULA (rede privada)
  ["fe80::", 10], // link-local
  ["fec0::", 10], // site-local (obsoleto)
  ["ff00::", 8], // multicast
] as const)
  bloqueados.addSubnet(rede, prefixo, "ipv6");

// IPv6 em 16 bytes (aceita "::", grupos em hex e final em notação IPv4, como ::ffff:127.0.0.1).
function bytesIPv6(ip: string): number[] | null {
  let s = ip.toLowerCase().split("%")[0];
  const final4 = s.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (final4) {
    if (isIP(final4[2]) !== 4) return null;
    const [a, b, c, d] = final4[2].split(".").map(Number);
    s = `${final4[1]}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const partes = s.split("::");
  if (partes.length > 2) return null;
  const esquerda = partes[0] ? partes[0].split(":") : [];
  const direita = partes.length === 2 && partes[1] ? partes[1].split(":") : [];
  const faltam = 8 - esquerda.length - direita.length;
  if ((partes.length === 1 && faltam !== 0) || (partes.length === 2 && faltam < 1)) return null;
  const grupos = [...esquerda, ...Array<string>(partes.length === 2 ? faltam : 0).fill("0"), ...direita];
  const bytes: number[] = [];
  for (const g of grupos) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    const n = parseInt(g, 16);
    bytes.push(n >> 8, n & 0xff);
  }
  return bytes.length === 16 ? bytes : null;
}

const ipv4De = (b: number[], i: number) => `${b[i]}.${b[i + 1]}.${b[i + 2]}.${b[i + 3]}`;

// IPv4 escondido dentro de um IPv6, nas formas que o sistema operacional ou a rede traduzem para IPv4.
function ipv4Embutido(b: number[]): string | null {
  const zeros = (de: number, ate: number) => b.slice(de, ate).every((x) => x === 0);
  if (zeros(0, 10) && b[10] === 0xff && b[11] === 0xff) return ipv4De(b, 12); // ::ffff:a.b.c.d (mapeado)
  if (zeros(0, 12)) return ipv4De(b, 12); // ::a.b.c.d (compatível, obsoleto)
  if (zeros(0, 8) && b[8] === 0xff && b[9] === 0xff && b[10] === 0 && b[11] === 0) return ipv4De(b, 12); // ::ffff:0:a.b.c.d (SIIT)
  if (b[0] === 0 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b && zeros(4, 12)) return ipv4De(b, 12); // 64:ff9b::/96 (NAT64)
  if (b[0] === 0x20 && b[1] === 0x02) return ipv4De(b, 2); // 2002:aabb:ccdd::/48 (6to4)
  return null;
}

export function ipBloqueado(ip: string): boolean {
  const tipo = isIP(ip);
  if (tipo === 4) return bloqueados.check(ip, "ipv4");
  if (tipo !== 6) return true;
  const bytes = bytesIPv6(ip);
  if (!bytes) return true;
  const v4 = ipv4Embutido(bytes);
  if (v4 && bloqueados.check(v4, "ipv4")) return true;
  return bloqueados.check(ip.split("%")[0], "ipv6");
}

const nomeInterno = (host: string) =>
  host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan") || host.endsWith(".home.arpa");

// Resolve o nome e devolve UM endereço público para usar na conexão, ou null se algum endereço for interno.
export async function resolverSeguro(hostname: string): Promise<{ address: string; family: 4 | 6 } | null> {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (!host || nomeInterno(host)) return null;
  const tipo = isIP(host);
  if (tipo) return ipBloqueado(host) ? null : { address: host, family: tipo as 4 | 6 };
  try {
    const ips = await lookup(host, { all: true, verbatim: true });
    // se QUALQUER resposta for interna, recusa (evita escolher o público na conferência e o interno na conexão)
    if (!ips.length || ips.some((r) => ipBloqueado(r.address))) return null;
    const escolhido = ips.find((r) => r.family === 4) ?? ips[0];
    return { address: escolhido.address, family: escolhido.family as 4 | 6 };
  } catch {
    return null;
  }
}

function urlPermitida(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  if (url.username || url.password) return false;
  return true;
}

// Conexão TCP/TLS sempre no IP já conferido; o nome do host continua indo no SNI e no cabeçalho Host,
// então o certificado é validado normalmente.
function lookupFixo(ip: { address: string; family: 4 | 6 }): LookupFunction {
  return ((_host: string, opcoes: { all?: boolean }, cb: (...args: unknown[]) => void) => {
    if (opcoes?.all) cb(null, [{ address: ip.address, family: ip.family }]);
    else cb(null, ip.address, ip.family);
  }) as unknown as LookupFunction;
}

function requisitar(url: URL, ip: { address: string; family: 4 | 6 }, sinal: AbortSignal): Promise<IncomingMessage | null> {
  return new Promise((resolve) => {
    const fazer = url.protocol === "https:" ? requestHttps : requestHttp;
    const req = fazer(
      url,
      {
        method: "GET",
        lookup: lookupFixo(ip),
        signal: sinal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AnaliseIA/1.0; +https://andressasoares.com.br)",
          Accept: "text/html,*/*",
          "Accept-Encoding": "gzip, deflate, br",
        },
      },
      resolve,
    );
    req.on("error", () => resolve(null));
    req.end();
  });
}

async function lerCorpo(r: IncomingMessage): Promise<Buffer> {
  const codificacao = String(r.headers["content-encoding"] ?? "").toLowerCase();
  const fluxo =
    codificacao === "gzip" ? r.pipe(createGunzip()) : codificacao === "deflate" ? r.pipe(createInflate()) : codificacao === "br" ? r.pipe(createBrotliDecompress()) : r;
  const partes: Buffer[] = [];
  let total = 0;
  try {
    for await (const pedaco of fluxo as AsyncIterable<Buffer>) {
      partes.push(pedaco);
      total += pedaco.length;
      if (total > MAX_BYTES) break; // conta depois de descompactar: nada de "bomba" de gzip
    }
  } catch {
    // conexão caiu no meio: fica com o que chegou
  } finally {
    r.destroy();
  }
  return Buffer.concat(partes).subarray(0, MAX_BYTES);
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
    if (!urlPermitida(url)) return null;
    const ip = await resolverSeguro(url.hostname);
    if (!ip) return null;
    const r = await requisitar(url, ip, limite);
    if (!r) return null;
    const status = r.statusCode ?? 0;
    const destino = r.headers.location;
    if (status >= 300 && status < 400 && destino) {
      r.destroy();
      try {
        url = new URL(destino, url);
      } catch {
        return null;
      }
      continue;
    }
    const html = new TextDecoder().decode(await lerCorpo(r));
    return { url: url.toString(), status, html, https: url.protocol === "https:" };
  }
  return null;
}
