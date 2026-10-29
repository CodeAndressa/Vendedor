import "server-only";
import { randomUUID } from "node:crypto";
import { comando, gravarValor, lerValor, ondeGuarda } from "./armazem";

// Kanban de leads da aba "Leads" do painel. Cada cartão é um JSON num hash do Redis ("kanban", campo = id);
// no computador, sem Redis, vai para .dados/valores.json (chave "kanban").
// Entram aqui: empresas do robô de prospecção, leads do site (diagnóstico e análise de IA) e cartões manuais.

export const colunas = [
  { id: "novos", nome: "Novos do site" },
  { id: "prospectados", nome: "Prospectados" },
  { id: "abordados", nome: "Abordados" },
  { id: "proposta", nome: "Proposta enviada" },
  { id: "conversando", nome: "Conversando" },
  { id: "fechou", nome: "Fechou" },
  { id: "perdido", nome: "Perdido" },
] as const;
export type Coluna = (typeof colunas)[number]["id"];
export const ehColuna = (v: unknown): v is Coluna => colunas.some((c) => c.id === v);

export type Cartao = {
  id: string;
  coluna: Coluna;
  negocio: string;
  contato?: string; // nome da pessoa, se souber
  whatsapp?: string; // só dígitos com 55
  email?: string;
  telefoneVisivel?: string;
  categoria?: string;
  endereco?: string;
  maps?: string;
  site?: "sem-site" | "so-rede-social" | "tem-site";
  linkAtual?: string;
  pontos?: number;
  nota?: number | null;
  avaliacoes?: number;
  origem: "robo" | "site" | "analise-ia" | "manual";
  proposta?: { link: string; mensagem: string; whatsapp: string; assinatura: string; geradaEm: string };
  selos?: string[]; // ex.: "abriu a proposta", "pagou"
  notas?: { texto: string; em: string }[];
  historico?: { de?: Coluna; para: Coluna; em: string; por: "voce" | "automatico" }[];
  criadoEm: string;
  atualizadoEm: string;
};

const CHAVE = "kanban";
const agora = () => new Date().toISOString();
const so = (v: string | undefined) => (v ?? "").replace(/\D/g, "");
const normal = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export async function listarCartoes(): Promise<Cartao[]> {
  const onde = ondeGuarda();
  if (onde === "redis") {
    const bruto = (await comando<string[]>("HGETALL", CHAVE)) ?? [];
    const lista: Cartao[] = [];
    for (let i = 1; i < bruto.length; i += 2) {
      try {
        lista.push(JSON.parse(bruto[i]) as Cartao);
      } catch {
        // cartão corrompido: ignora
      }
    }
    return lista.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  }
  const mapa = await lerValor<Record<string, Cartao>>(CHAVE, {});
  return Object.values(mapa).sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

async function salvar(cartoes: Cartao[]) {
  if (!cartoes.length) return;
  const onde = ondeGuarda();
  if (onde === "redis") {
    await comando("HSET", CHAVE, ...cartoes.flatMap((c) => [c.id, JSON.stringify(c)]));
  } else if (onde === "arquivo") {
    const mapa = await lerValor<Record<string, Cartao>>(CHAVE, {});
    for (const c of cartoes) mapa[c.id] = c;
    await gravarValor(CHAVE, mapa);
  }
}

export async function excluirCartao(id: string) {
  if (ondeGuarda() === "redis") await comando("HDEL", CHAVE, id);
  else {
    const mapa = await lerValor<Record<string, Cartao>>(CHAVE, {});
    delete mapa[id];
    await gravarValor(CHAVE, mapa);
  }
}

// Mesma empresa = mesmo WhatsApp, ou mesmo nome no mesmo endereço.
function mesmo(a: Partial<Cartao>, b: Cartao) {
  if (a.whatsapp && b.whatsapp && so(a.whatsapp) === so(b.whatsapp)) return true;
  return !!a.negocio && normal(a.negocio) === normal(b.negocio) && normal(a.endereco ?? "") === normal(b.endereco ?? "");
}

export type NovoCartao = Omit<Cartao, "id" | "criadoEm" | "atualizadoEm" | "coluna"> & { coluna?: Coluna };

// Adiciona cartões; quem já estiver no kanban é atualizado (sem voltar de coluna) em vez de duplicar.
export async function adicionarCartoes(novos: NovoCartao[]) {
  const existentes = await listarCartoes();
  const gravar: Cartao[] = [];
  let criados = 0;
  for (const n of novos) {
    const ja = existentes.find((c) => mesmo(n, c)) ?? gravar.find((c) => mesmo(n, c));
    if (ja) {
      Object.assign(ja, { ...n, coluna: ja.coluna, notas: ja.notas, historico: ja.historico, proposta: ja.proposta ?? n.proposta, atualizadoEm: agora() });
      if (!gravar.includes(ja)) gravar.push(ja);
      continue;
    }
    const coluna = n.coluna ?? (n.origem === "robo" ? "prospectados" : n.origem === "manual" ? "prospectados" : "novos");
    gravar.push({ ...n, id: randomUUID(), coluna, historico: [{ para: coluna, em: agora(), por: "automatico" }], criadoEm: agora(), atualizadoEm: agora() });
    criados++;
  }
  await salvar(gravar);
  return { criados, atualizados: gravar.length - criados };
}

export async function lerCartao(id: string) {
  return (await listarCartoes()).find((c) => c.id === id) ?? null;
}

export async function moverCartao(id: string, para: Coluna, por: "voce" | "automatico" = "voce") {
  const c = await lerCartao(id);
  if (!c || c.coluna === para) return c;
  c.historico = [...(c.historico ?? []), { de: c.coluna, para, em: agora(), por }].slice(-30);
  c.coluna = para;
  c.atualizadoEm = agora();
  await salvar([c]);
  return c;
}

export async function atualizarCartao(id: string, mudar: (c: Cartao) => void) {
  const c = await lerCartao(id);
  if (!c) return null;
  mudar(c);
  c.atualizadoEm = agora();
  await salvar([c]);
  return c;
}

// ---------- automações (chamadas pelos avisos do site) ----------

// Proposta aberta: selo no cartão e, se estava em "abordados", vai para "proposta".
export async function marcarPropostaAberta(assinatura: string, negocio?: string) {
  const c = (await listarCartoes()).find((x) => x.proposta?.assinatura === assinatura || (!!negocio && normal(x.negocio) === normal(negocio)));
  if (!c) return;
  await atualizarCartao(c.id, (x) => {
    x.selos = [...new Set([...(x.selos ?? []), "abriu a proposta"])];
  });
  if (c.coluna === "prospectados" || c.coluna === "abordados") await moverCartao(c.id, "proposta", "automatico");
}

// Abriu ou clicou num e-mail: selo no cartão de quem tem esse e-mail.
export async function marcarPorEmail(email: string, selo: string) {
  const alvo = email.trim().toLowerCase();
  const c = (await listarCartoes()).find((x) => x.email?.toLowerCase() === alvo);
  if (!c) return;
  await atualizarCartao(c.id, (x) => {
    x.selos = [...new Set([...(x.selos ?? []), selo])].slice(-12);
  });
}

// Pagamento confirmado no Asaas: vai para "fechou".
export async function marcarPago(assinatura: string) {
  const c = (await listarCartoes()).find((x) => x.proposta?.assinatura === assinatura);
  if (!c) return;
  await atualizarCartao(c.id, (x) => {
    x.selos = [...new Set([...(x.selos ?? []), "pagou"])];
  });
  await moverCartao(c.id, "fechou", "automatico");
}
