import "server-only";
import { isIP } from "node:net";
import { connect } from "node:tls";
import { gravarValor, lerValor } from "./armazem";
import { baixarPagina, resolverSeguro } from "./busca-segura";
import { enviarEmail } from "./email";

// Monitor dos sites em produção (os que você entregou). Para cada um: no ar ou não, tempo de resposta,
// HTTPS e validade do certificado. Roda todo dia pelo cron da Vercel e quando você clica em "Verificar agora".

export type SiteCliente = { url: string; nome: string; plano?: string };
export type Verificacao = {
  url: string;
  noAr: boolean;
  status: number | null;
  ms: number | null;
  https: boolean;
  certificadoVence?: string;
  diasCertificado?: number;
  erro?: string;
  verificadoEm: string;
};

// Sites que já entram na lista (o seu e o da 4Core). Os outros você adiciona pelo painel.
const iniciais: SiteCliente[] = [
  { url: "https://soareslab.com", nome: "Soares Lab (meu site)" },
  { url: "https://4core.site", nome: "4Core" },
];

export async function listarSites() {
  return lerValor<SiteCliente[]>("sites", iniciais);
}

export function normalizarUrl(url: string) {
  const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
  return `${u.protocol}//${u.host}`;
}

export async function adicionarSite(site: SiteCliente) {
  const lista = await listarSites();
  const url = normalizarUrl(site.url);
  if (lista.some((s) => s.url === url)) return lista;
  const nova = [...lista, { ...site, url }];
  await gravarValor("sites", nova);
  return nova;
}

export async function removerSite(url: string) {
  const nova = (await listarSites()).filter((s) => s.url !== url);
  await gravarValor("sites", nova);
  return nova;
}

// Passa pelo mesmo filtro da busca segura: só conecta em IP público, e no IP já conferido.
async function validadeCertificado(host: string): Promise<string | undefined> {
  const ip = await resolverSeguro(host);
  if (!ip) return undefined;
  const nome = host.replace(/^\[|\]$/g, "");
  return new Promise((resolve) => {
    const s = connect({ host: ip.address, port: 443, servername: isIP(nome) ? undefined : nome, timeout: 8000 }, () => {
      const cert = s.getPeerCertificate();
      s.end();
      resolve(cert?.valid_to ? new Date(cert.valid_to).toISOString() : undefined);
    });
    s.on("error", () => resolve(undefined));
    s.on("timeout", () => {
      s.destroy();
      resolve(undefined);
    });
  });
}

async function verificar(site: SiteCliente): Promise<Verificacao> {
  const inicio = Date.now();
  const pagina = await baixarPagina(site.url, 12000);
  const ms = Date.now() - inicio;
  const host = new URL(site.url).hostname;
  const vence = site.url.startsWith("https://") ? await validadeCertificado(host) : undefined;
  const dias = vence ? Math.floor((new Date(vence).getTime() - Date.now()) / 86400000) : undefined;
  return {
    url: site.url,
    noAr: !!pagina && pagina.status < 400,
    status: pagina?.status ?? null,
    ms: pagina ? ms : null,
    https: !!pagina?.https,
    certificadoVence: vence,
    diasCertificado: dias,
    erro: pagina ? (pagina.status >= 400 ? `Respondeu ${pagina.status}` : undefined) : "Não respondeu",
    verificadoEm: new Date().toISOString(),
  };
}

export async function lerVerificacoes() {
  return lerValor<Record<string, Verificacao>>("monitor", {});
}

// Verifica todos e avisa por e-mail o que caiu (ou voltou), e certificados perto de vencer.
export async function verificarTodos() {
  const [sites, anteriores] = await Promise.all([listarSites(), lerVerificacoes()]);
  const resultados = await Promise.all(sites.map(verificar));
  const atual: Record<string, Verificacao> = {};
  for (const r of resultados) atual[r.url] = r;
  await gravarValor("monitor", atual);

  const caiu = resultados.filter((r) => !r.noAr && anteriores[r.url]?.noAr !== false);
  const voltou = resultados.filter((r) => r.noAr && anteriores[r.url]?.noAr === false);
  const certificado = resultados.filter((r) => r.diasCertificado !== undefined && r.diasCertificado <= 10);
  const nome = (url: string) => sites.find((s) => s.url === url)?.nome ?? url;
  if (caiu.length || voltou.length || certificado.length) {
    const linhas = [
      ...caiu.map((r) => `🔴 Fora do ar: ${nome(r.url)} (${r.url}) · ${r.erro ?? ""}`),
      ...voltou.map((r) => `🟢 Voltou ao ar: ${nome(r.url)} (${r.url})`),
      ...certificado.map((r) => `🟡 Certificado vence em ${r.diasCertificado} dias: ${nome(r.url)}`),
    ];
    await enviarEmail(caiu.length ? `Site fora do ar: ${nome(caiu[0].url)}` : "Aviso do monitor de sites", linhas);
  }
  return atual;
}
