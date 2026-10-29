import "server-only";
import { hoje } from "./proposta";

// Integração com o Asaas (cobranças e assinaturas). Configure ASAAS_API_KEY e ASAAS_AMBIENTE na Vercel.
// Comece em "sandbox" para testar; troque para "producao" quando estiver tudo certo.

function base() {
  if (process.env.ASAAS_URL) return process.env.ASAAS_URL;
  return process.env.ASAAS_AMBIENTE === "producao" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";
}

export const asaasConfigurado = () => Boolean(process.env.ASAAS_API_KEY);

export async function asaas<T>(caminho: string, metodo: "GET" | "POST" = "GET", corpo?: object): Promise<T> {
  const r = await fetch(`${base()}${caminho}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "site-vendas",
      access_token: process.env.ASAAS_API_KEY ?? "",
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (json as { errors?: { description?: string }[] }).errors?.[0]?.description;
    throw new Error(msg ?? `Asaas respondeu ${r.status}`);
  }
  return json as T;
}

type Cliente = { nome: string; documento: string; email?: string; celular?: string; referencia: string };

// "  José  da SILVA " e "jose da silva" contam como o mesmo nome.
export const nomeNormalizado = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Reaproveita o cliente do Asaas só quando documento E nome batem. O pedido vem de um visitante anônimo:
// sem conferir o nome, qualquer um que soubesse um CPF cadastrado criaria cobranças no cadastro de outra pessoa
// (com o e-mail e o celular dela recebendo os avisos). Se o nome não bate, cria um cliente novo.
async function cliente(c: Cliente) {
  const doc = c.documento.replace(/\D/g, "");
  const nome = nomeNormalizado(c.nome);
  const existente = await asaas<{ data?: { id: string; name?: string; deleted?: boolean }[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(doc)}&limit=20`,
  );
  const mesmo = existente.data?.find((x) => !x.deleted && x.name && nomeNormalizado(x.name) === nome);
  if (mesmo) return mesmo.id;
  const novo = await asaas<{ id: string }>("/customers", "POST", {
    name: c.nome,
    cpfCnpj: doc,
    email: c.email || undefined,
    mobilePhone: c.celular?.replace(/\D/g, "").replace(/^55/, "") || undefined,
    externalReference: c.referencia,
    notificationDisabled: false,
  });
  return novo.id;
}

// Cobrança única: o cliente escolhe Pix, cartão ou boleto na página do Asaas.
export async function criarCobranca(c: Cliente, valor: number, descricao: string) {
  const id = await cliente(c);
  const cobranca = await asaas<{ invoiceUrl: string }>("/payments", "POST", {
    customer: id,
    billingType: "UNDEFINED",
    value: valor,
    dueDate: hoje(3),
    description: descricao,
    externalReference: c.referencia,
  });
  return cobranca.invoiceUrl;
}

// Assinatura mensal. Com UNDEFINED o cliente escolhe Pix, cartão ou boleto a cada mês.
// Mude em ASAAS_TIPO_ASSINATURA se quiser só cartão. Com "parcelas", a assinatura encerra sozinha na última.
export async function criarAssinatura(c: Cliente, valor: number, descricao: string, parcelas?: number) {
  const id = await cliente(c);
  const assinatura = await asaas<{ id: string }>("/subscriptions", "POST", {
    customer: id,
    billingType: process.env.ASAAS_TIPO_ASSINATURA ?? "UNDEFINED",
    value: valor,
    nextDueDate: hoje(1),
    cycle: "MONTHLY",
    maxPayments: parcelas,
    description: descricao,
    externalReference: c.referencia,
  });
  const cobrancas = await asaas<{ data: { invoiceUrl: string }[] }>(`/subscriptions/${assinatura.id}/payments`);
  const url = cobrancas.data?.[0]?.invoiceUrl;
  if (!url) throw new Error("Assinatura criada, mas a primeira cobrança ainda não está disponível.");
  return url;
}
