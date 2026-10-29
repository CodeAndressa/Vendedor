import "server-only";
import { asaas, asaasConfigurado } from "./asaas";
import { comando, gravarValor, lerValor, ondeGuarda } from "./armazem";
import { bases, extras, parcelaAssinatura, total } from "./catalogo";
import { assinaturaSite, config, linkWhatsApp, reais } from "./config";
import { escapar } from "./email";
import { enviarRastreado } from "./envios";
import { adicionarCartoes, marcarPorEmail } from "./kanban";
import { formatarData, hoje, normalizar, type Proposta } from "./proposta";
import { linkProposta } from "./servidor";

// Carrinho abandonado: quem preenche o pagamento (nome, CPF, e-mail) e não paga recebe, no dia seguinte,
// um e-mail com cupom. O cupom é uma proposta assinada com desconto e validade curta, então ninguém
// consegue inventar desconto. No último dia do cupom sai um lembrete. Pagou (aviso do Asaas ou conferência
// no Asaas antes de enviar)? O carrinho fecha e nada mais é enviado. Roda no cron diário (/api/cron).

export const cupom = {
  codigo: "VOLTA10",
  percentual: 0.1, // 10% do total, arredondado para reais inteiros
  validadeDias: 3,
  esperarHoras: 20, // tempo desde o checkout até o primeiro e-mail
  descartarDias: 15,
};

export type Carrinho = {
  email: string; // chave: um carrinho aberto por e-mail (o mais recente vale)
  nome: string;
  whatsapp?: string;
  proposta: Proposta;
  origem: string;
  referencias: string[]; // externalReference das cobranças no Asaas
  criadoEm: string;
  atualizadoEm: string;
  pagoEm?: string;
  cupom?: { link: string; assinatura: string; desconto: number; validade: string; enviadoEm: string };
  ultimoAvisoEm?: string;
};

const CHAVE = "carrinhos";
const agora = () => new Date().toISOString();
const horasDesde = (iso: string) => (Date.now() - new Date(iso).getTime()) / 3_600_000;

export async function listarCarrinhos(): Promise<Carrinho[]> {
  let lista: Carrinho[] = [];
  if (ondeGuarda() === "redis") {
    const bruto = (await comando<string[]>("HGETALL", CHAVE)) ?? [];
    for (let i = 1; i < bruto.length; i += 2) {
      try {
        lista.push(JSON.parse(bruto[i]) as Carrinho);
      } catch {
        // registro corrompido: ignora
      }
    }
  } else lista = Object.values(await lerValor<Record<string, Carrinho>>(CHAVE, {}));
  return lista.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

async function salvar(c: Carrinho) {
  c.atualizadoEm = agora();
  if (ondeGuarda() === "redis") await comando("HSET", CHAVE, c.email, JSON.stringify(c));
  else if (ondeGuarda() === "arquivo") {
    const mapa = await lerValor<Record<string, Carrinho>>(CHAVE, {});
    mapa[c.email] = c;
    await gravarValor(CHAVE, mapa);
  }
}

async function apagar(email: string) {
  if (ondeGuarda() === "redis") await comando("HDEL", CHAVE, email);
  else {
    const mapa = await lerValor<Record<string, Carrinho>>(CHAVE, {});
    delete mapa[email];
    await gravarValor(CHAVE, mapa);
  }
}

// Chamado pela rota de pagamento depois de criar a cobrança. Sem e-mail não tem como lembrar.
export async function registrarCarrinho(d: {
  email: string;
  nome: string;
  whatsapp?: string | null;
  referencia: string;
  origem: string;
  proposta?: Proposta | null;
  base?: Proposta["base"];
  extras?: Proposta["extras"];
}) {
  const email = d.email.trim().toLowerCase();
  if (!email.includes("@")) return;
  const proposta = d.proposta ?? normalizar({ cliente: d.nome, negocio: "", base: d.base ?? "site", extras: d.extras ?? [] });
  if (!proposta) return;
  const atual = (await listarCarrinhos()).find((c) => c.email === email && !c.pagoEm);
  await salvar({
    email,
    nome: d.nome,
    whatsapp: d.whatsapp ?? undefined,
    proposta,
    origem: d.origem,
    referencias: [...new Set([...(atual?.referencias ?? []), d.referencia])].slice(-10),
    criadoEm: atual?.criadoEm ?? agora(),
    atualizadoEm: agora(),
    cupom: atual?.cupom,
  });
  // quem chega no pagamento é lead quente: entra (ou é atualizado) no kanban com selo
  await adicionarCartoes([
    { negocio: proposta.negocio || d.nome, contato: d.nome, whatsapp: d.whatsapp ?? undefined, email, origem: "site", coluna: "conversando" },
  ]).catch(() => {});
  await marcarPorEmail(email, "começou o pagamento").catch(() => {});
}

// Aviso de pagamento do Asaas: fecha o carrinho da cobrança (ou do cupom) correspondente.
export async function marcarCarrinhoPago(referencia: string) {
  const assinatura = referencia.replace(/^(proposta|parcelado):/, "");
  const c = (await listarCarrinhos()).find((x) => !x.pagoEm && (x.referencias.includes(referencia) || x.cupom?.assinatura === assinatura));
  if (!c) return;
  c.pagoEm = agora();
  await salvar(c);
  await marcarPorEmail(c.email, "pagou").catch(() => {});
}

// Confere direto no Asaas, antes de mandar e-mail, se alguma cobrança desse carrinho já foi paga
// (o aviso do webhook pode ter se perdido).
async function pagoNoAsaas(c: Carrinho) {
  if (!asaasConfigurado()) return false;
  const refs = [...c.referencias, ...(c.cupom ? [`proposta:${c.cupom.assinatura}`, `parcelado:${c.cupom.assinatura}`] : [])];
  for (const ref of refs) {
    const r = await asaas<{ data?: { status?: string }[] }>(`/payments?externalReference=${encodeURIComponent(ref)}&limit=10`).catch(() => null);
    if (r?.data?.some((p) => p.status === "RECEIVED" || p.status === "CONFIRMED" || p.status === "RECEIVED_IN_CASH")) return true;
  }
  return false;
}

const resumoDoPedido = (p: Proposta) => [bases[p.base].titulo, ...p.extras.map((e) => extras[e].titulo)].join(" + ");

async function enviarCupom(c: Carrinho, ultimo: boolean) {
  const valorCheio = total(c.proposta.extras, c.proposta.desconto);
  if (!c.cupom) {
    const desconto = Math.max(1, Math.round(valorCheio * cupom.percentual));
    const validade = hoje(cupom.validadeDias);
    const comCupom = { ...c.proposta, desconto: c.proposta.desconto + desconto, emitida: hoje(), validade };
    const link = linkProposta(comCupom);
    c.cupom = { link, assinatura: new URL(link).searchParams.get("a") ?? "", desconto, validade, enviadoEm: agora() };
  }
  const { desconto, validade, link: linkCupom } = c.cupom;
  const valorFinal = valorCheio - desconto;
  const nome = c.nome.split(" ")[0];
  const primeiroNome = config.nome.split(" ")[0];

  const r = await enviarRastreado({
    para: c.email,
    modelo: "carrinho",
    assunto: ultimo ? `Último dia: seu cupom de ${reais(desconto)} vence hoje` : `${nome}, guardei um desconto para o seu site`,
    negocio: c.proposta.negocio || c.nome,
    carrinho: c.email,
    responderPara: process.env.AVISO_EMAIL_PARA?.split(",")[0]?.trim() || undefined,
    variaveis: ({ link }) => ({
      PREVIA: escapar(`Cupom ${cupom.codigo}: ${reais(desconto)} de desconto, válido até ${formatarData(validade)}.`),
      TITULO: escapar(ultimo ? "Seu cupom vence hoje" : `${nome}, seu site ficou a um passo`),
      TEXTO: escapar(
        ultimo
          ? `Só para não passar: o desconto que separei para você acaba hoje. Depois disso, o site volta ao valor normal.`
          : `Vi que você começou o pagamento e não concluiu. Acontece! Para facilitar, separei um cupom de ${reais(desconto)} para você fechar o seu site.`,
      ),
      CUPOM: cupom.codigo,
      DESCONTO: escapar(reais(desconto)),
      DE: escapar(reais(valorCheio)),
      POR: escapar(reais(valorFinal)),
      PARCELA: escapar(`${assinaturaSite.parcelas}x de ${reais(parcelaAssinatura(valorFinal))}`),
      VALIDADE: formatarData(validade),
      RESUMO: escapar(resumoDoPedido(c.proposta)),
      LINK_CUPOM: link("usar-cupom", linkCupom),
      LINK_WHATSAPP: link("whatsapp", linkWhatsApp(`Oi ${primeiroNome}! Recebi o cupom ${cupom.codigo} e tenho uma dúvida sobre o site.`)),
    }),
  });
  if (r.enviado) {
    if (ultimo) c.ultimoAvisoEm = agora();
    await salvar(c);
    await marcarPorEmail(c.email, ultimo ? "recebeu o último aviso do cupom" : "recebeu cupom").catch(() => {});
  }
  return r.enviado;
}

// Roda uma vez por dia. Devolve quantos e-mails saíram, para o log do cron.
export async function processarCarrinhos() {
  const feito = { cupons: 0, ultimos: 0, pagos: 0, descartados: 0 };
  for (const c of await listarCarrinhos()) {
    if (c.pagoEm || horasDesde(c.criadoEm) > cupom.descartarDias * 24) {
      if (horasDesde(c.atualizadoEm) > cupom.descartarDias * 24) {
        await apagar(c.email);
        feito.descartados++;
      }
      continue;
    }
    const primeiro = !c.cupom && horasDesde(c.criadoEm) >= cupom.esperarHoras;
    const ultimo = !!c.cupom && !c.ultimoAvisoEm && c.cupom.validade === hoje();
    if (!primeiro && !ultimo) continue;
    if (await pagoNoAsaas(c)) {
      c.pagoEm = agora();
      await salvar(c);
      feito.pagos++;
      continue;
    }
    if (await enviarCupom(c, ultimo)) feito[ultimo ? "ultimos" : "cupons"]++;
  }
  return feito;
}
