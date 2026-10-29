import "server-only";
import { asaas, asaasConfigurado } from "./asaas";

// Faturamento e clientes lidos direto do Asaas (só leitura). Guardado em memória por 5 minutos
// para o painel abrir rápido sem pesar na API.

type Cobranca = {
  id: string;
  customer: string;
  value: number;
  netValue?: number;
  status: string;
  billingType?: string;
  description?: string;
  dueDate?: string;
  paymentDate?: string | null;
  confirmedDate?: string | null;
  clientPaymentDate?: string | null;
  subscription?: string | null;
  invoiceUrl?: string;
};
type Assinatura = { id: string; customer: string; value: number; cycle: string; status: string; description?: string; nextDueDate?: string };
type Cliente = { id: string; name: string; email?: string; mobilePhone?: string };

async function listar<T>(caminho: string, limite = 500): Promise<T[]> {
  const itens: T[] = [];
  const junta = caminho.includes("?") ? "&" : "?";
  for (let offset = 0; offset < limite; offset += 100) {
    const r = await asaas<{ data: T[]; hasMore: boolean }>(`${caminho}${junta}limit=100&offset=${offset}`);
    itens.push(...(r.data ?? []));
    if (!r.hasMore) break;
  }
  return itens;
}

const dataBR = (d: Date) => new Date(d.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);
const mesDe = (data?: string | null) => (data ?? "").slice(0, 7);

export type Financeiro = {
  configurado: boolean;
  ambiente: string;
  saldo: number | null;
  recebidoMes: number;
  recebidoMesAnterior: number;
  aReceber: number;
  atrasado: number;
  atrasadas: { cliente: string; valor: number; vencimento?: string; descricao?: string; link?: string }[];
  mrr: number;
  assinaturasAtivas: number;
  clientesAtivos: { nome: string; assinatura: number; ultimoPagamento?: string; desde?: string }[];
  porMes: { mes: string; valor: number }[];
  ultimos: { cliente: string; valor: number; data?: string; forma?: string; descricao?: string }[];
  erro?: string;
  atualizadoEm: string;
};

let cache: { quando: number; dados: Financeiro } | null = null;

export async function lerFinanceiro(forcar = false): Promise<Financeiro> {
  if (!forcar && cache && Date.now() - cache.quando < 5 * 60 * 1000) return cache.dados;
  const vazio: Financeiro = {
    configurado: asaasConfigurado(),
    ambiente: process.env.ASAAS_AMBIENTE ?? "sandbox",
    saldo: null,
    recebidoMes: 0,
    recebidoMesAnterior: 0,
    aReceber: 0,
    atrasado: 0,
    atrasadas: [],
    mrr: 0,
    assinaturasAtivas: 0,
    clientesAtivos: [],
    porMes: [],
    ultimos: [],
    atualizadoEm: new Date().toISOString(),
  };
  if (!vazio.configurado) return vazio;

  try {
    const agora = new Date();
    const inicio = new Date(agora.getFullYear(), agora.getMonth() - 5, 1);
    const desde = dataBR(inicio);
    const [saldo, recebidas, confirmadas, pendentes, vencidas, assinaturas, clientes] = await Promise.all([
      asaas<{ balance: number }>("/finance/balance").catch(() => null),
      listar<Cobranca>(`/payments?status=RECEIVED&paymentDate%5Bge%5D=${desde}`),
      listar<Cobranca>(`/payments?status=CONFIRMED&dateCreated%5Bge%5D=${desde}`),
      listar<Cobranca>("/payments?status=PENDING"),
      listar<Cobranca>("/payments?status=OVERDUE"),
      listar<Assinatura>("/subscriptions?status=ACTIVE"),
      listar<Cliente>("/customers", 1000),
    ]);
    const nome = new Map(clientes.map((c) => [c.id, c.name]));
    const pagas = [...recebidas, ...confirmadas].map((p) => ({ ...p, quando: p.paymentDate ?? p.confirmedDate ?? p.clientPaymentDate ?? p.dueDate }));

    const meses = Array.from({ length: 6 }, (_, i) => dataBR(new Date(agora.getFullYear(), agora.getMonth() - 5 + i, 15)).slice(0, 7));
    const porMes = meses.map((mes) => ({ mes, valor: pagas.filter((p) => mesDe(p.quando) === mes).reduce((s, p) => s + p.value, 0) }));
    const mesAtual = meses[5];
    const mesAnterior = meses[4];

    // cliente ativo: assinatura ativa ou pagamento nos últimos 90 dias
    const limite90 = dataBR(new Date(Date.now() - 90 * 86400000));
    const ativos = new Map<string, { nome: string; assinatura: number; ultimoPagamento?: string; desde?: string }>();
    for (const a of assinaturas) {
      const atual = ativos.get(a.customer) ?? { nome: nome.get(a.customer) ?? "Cliente", assinatura: 0 };
      atual.assinatura += a.cycle === "YEARLY" ? a.value / 12 : a.value;
      ativos.set(a.customer, atual);
    }
    for (const p of pagas) {
      if (!p.quando || p.quando < limite90) continue;
      const atual = ativos.get(p.customer) ?? { nome: nome.get(p.customer) ?? "Cliente", assinatura: 0 };
      if (!atual.ultimoPagamento || p.quando > atual.ultimoPagamento) atual.ultimoPagamento = p.quando;
      if (!atual.desde || p.quando < atual.desde) atual.desde = p.quando;
      ativos.set(p.customer, atual);
    }

    const dados: Financeiro = {
      ...vazio,
      saldo: saldo?.balance ?? null,
      recebidoMes: porMes[5].valor,
      recebidoMesAnterior: porMes[4].valor,
      aReceber: pendentes.reduce((s, p) => s + p.value, 0),
      atrasado: vencidas.reduce((s, p) => s + p.value, 0),
      atrasadas: vencidas
        .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
        .slice(0, 20)
        .map((p) => ({ cliente: nome.get(p.customer) ?? "Cliente", valor: p.value, vencimento: p.dueDate, descricao: p.description, link: p.invoiceUrl })),
      mrr: assinaturas.reduce((s, a) => s + (a.cycle === "YEARLY" ? a.value / 12 : a.value), 0),
      assinaturasAtivas: assinaturas.length,
      clientesAtivos: [...ativos.values()].sort((a, b) => b.assinatura - a.assinatura),
      porMes,
      ultimos: pagas
        .sort((a, b) => (b.quando ?? "").localeCompare(a.quando ?? ""))
        .slice(0, 12)
        .map((p) => ({ cliente: nome.get(p.customer) ?? "Cliente", valor: p.value, data: p.quando ?? undefined, forma: p.billingType, descricao: p.description })),
    };
    void mesAtual;
    void mesAnterior;
    cache = { quando: Date.now(), dados };
    return dados;
  } catch (e) {
    return { ...vazio, erro: e instanceof Error ? e.message : "Não consegui ler o Asaas." };
  }
}
