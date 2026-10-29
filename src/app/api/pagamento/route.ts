import { asaasConfigurado, criarAssinatura, criarCobranca } from "@/lib/asaas";
import { bases, ehBase, ehExtra, extras, metades, parcelaAssinatura, planoMensal, total, type Extra } from "@/lib/catalogo";
import { registrarCarrinho } from "@/lib/carrinho";
import { assinaturaSite } from "@/lib/config";
import { documentoValido } from "@/lib/documento";
import { destravar, gravarTemporario, ipDe, lerTemporario, limitar, muitasTentativas, travar } from "@/lib/limite";
import { decodificar, hoje, podeCobrarProjetoMaior } from "@/lib/proposta";
import { assinaturaConfere, notificar, whatsappComDDI } from "@/lib/servidor";

// Cria a cobrança no Asaas e devolve o link de pagamento.
// O valor é sempre calculado aqui no servidor (a partir da proposta assinada ou do plano), nunca vem do navegador.

const recusa = (erro: string, status = 400) => Response.json({ ok: false, erro }, { status });
const FALHA = "Não consegui gerar o pagamento agora. Fale comigo no WhatsApp que eu te mando o link.";
const TRES_DIAS = 3 * 24 * 3600;

export async function POST(request: Request) {
  if (!asaasConfigurado()) return recusa("Pagamento online ainda não está ativo. Fale comigo no WhatsApp.", 503);

  // 5 pedidos por hora por IP (conta toda tentativa, até as recusadas: ninguém testa CPFs em série).
  const ip = ipDe(request);
  if (!(await limitar("pagamento-ip", ip, 5, 3600, "bloquear")).ok)
    return muitasTentativas("Muitas tentativas de pagamento seguidas. Tente de novo em uma hora ou me chame no WhatsApp.");

  let c: Record<string, unknown>;
  try {
    c = await request.json();
  } catch {
    return recusa("Formato inválido.");
  }
  if (!c || typeof c !== "object") return recusa("Formato inválido.");
  const texto = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const nome = texto(c.nome, 100);
  const documento = texto(c.documento, 20);
  const email = texto(c.email, 120);
  const celular = texto(c.celular, 20);
  if (nome.length < 3) return recusa("Informe seu nome completo.");
  if (!documentoValido(documento)) return recusa("CPF ou CNPJ inválido.");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return recusa("E-mail inválido.");

  // 3 pedidos por hora para o mesmo CPF/CNPJ, venha de onde vier.
  if (!(await limitar("pagamento-doc", documento.replace(/\D/g, ""), 3, 3600, "bloquear")).ok)
    return muitasTentativas("Muitas tentativas de pagamento com este documento. Tente de novo em uma hora ou me chame no WhatsApp.");

  const dadosCliente = { nome, documento, email, celular };
  // Se não pagar, vira carrinho abandonado (e-mail com cupom no dia seguinte). Falha aqui nunca bloqueia o pagamento.
  const lembrar = (d: Omit<Parameters<typeof registrarCarrinho>[0], "email" | "nome" | "whatsapp">) =>
    email ? registrarCarrinho({ ...d, email, nome, whatsapp: whatsappComDDI(celular) }).catch((e) => console.error("Carrinho não registrado", e)) : undefined;

  try {
    if (c.tipo === "entrada" || c.tipo === "parcelado") {
      const tipo = c.tipo;
      const codigo = texto(c.p, 4000);
      const assinatura = texto(c.a, 60);
      const proposta = decodificar(codigo);
      if (!proposta || !assinaturaConfere(codigo, assinatura)) return recusa("Proposta não confere. Peça o link original no WhatsApp.");
      if (proposta.validade < hoje()) return recusa("Esta proposta venceu. Me chama no WhatsApp para renovar.");
      // Projeto sob medida só com proposta feita no painel (o preço "a partir de" passa por conversa antes).
      if (!podeCobrarProjetoMaior(proposta))
        return recusa("Projetos maiores precisam de uma conversa antes. Me chama no WhatsApp.");
      if (tipo === "parcelado" && c.aceite !== true) return recusa("É preciso aceitar as condições do parcelamento.");

      // Mesma proposta + mesmo tipo: devolve o link já criado nos últimos 3 dias em vez de abrir outra cobrança.
      const chave = `cobranca:${assinatura}:${tipo}`;
      const existente = await lerTemporario<string>(chave);
      if (existente) return Response.json({ ok: true, url: existente });
      if (!(await travar(chave, 60))) return recusa("Já estou gerando este pagamento. Aguarde alguns segundos e tente de novo.", 409);
      try {
        const valorTotal = total(proposta.extras, proposta.desconto);
        let url: string;
        if (tipo === "parcelado") {
          // Site por assinatura: 12 parcelas sem entrada. O cliente precisa aceitar o aviso de atraso.
          const parcela = parcelaAssinatura(valorTotal);
          const desc = `Site por assinatura (${assinaturaSite.parcelas}x)${proposta.negocio ? ` - ${proposta.negocio}` : ""}`;
          url = await criarAssinatura({ ...dadosCliente, referencia: `parcelado:${assinatura}` }, parcela, desc, assinaturaSite.parcelas);
          await gravarTemporario(chave, url, TRES_DIAS);
          await lembrar({ referencia: `parcelado:${assinatura}`, origem: "proposta-12x", proposta });
          await notificar({ tipo: "checkout", origem: "parcelado", nome, negocio: proposta.negocio, valor: parcela, parcelas: assinaturaSite.parcelas, link: url });
        } else {
          const [entrada] = metades(valorTotal);
          const descricao = `Entrada (50%) do site${proposta.negocio ? ` - ${proposta.negocio}` : ""}`;
          url = await criarCobranca({ ...dadosCliente, referencia: `proposta:${assinatura}` }, entrada, descricao);
          await gravarTemporario(chave, url, TRES_DIAS);
          await lembrar({ referencia: `proposta:${assinatura}`, origem: "proposta", proposta });
          await notificar({ tipo: "checkout", origem: "proposta", nome, negocio: proposta.negocio, valor: entrada, link: url });
        }
        return Response.json({ ok: true, url });
      } finally {
        await destravar(chave);
      }
    }

    // Compra direta pela calculadora, sem proposta: o valor sai só dos itens do catálogo, sem desconto.
    // Projetos maiores (loja, sistema) têm preço "a partir de" e passam por conversa antes.
    if (c.tipo === "direto") {
      const base = ehBase(c.base) ? c.base : "site";
      const itens = Array.isArray(c.extras) ? ([...new Set(c.extras.filter(ehExtra))] as Extra[]) : [];
      if (itens.includes("maior")) return recusa("Projetos maiores precisam de uma conversa antes. Me chama no WhatsApp.");
      const valorTotal = total(itens);
      const resumo = [bases[base].titulo, ...itens.map((i) => extras[i].titulo)].join(" + ");
      const referencia = `direto:${Date.now().toString(36)}`;
      if (c.forma === "parcelado") {
        if (c.aceite !== true) return recusa("É preciso aceitar as condições do parcelamento.");
        const parcela = parcelaAssinatura(valorTotal);
        const url = await criarAssinatura({ ...dadosCliente, referencia }, parcela, `Site por assinatura (${assinaturaSite.parcelas}x): ${resumo}`, assinaturaSite.parcelas);
        await lembrar({ referencia, origem: "calculadora-12x", base, extras: itens });
        await notificar({ tipo: "checkout", origem: "calculadora-12x", nome, negocio: resumo, valor: parcela, parcelas: assinaturaSite.parcelas, link: url, whatsapp: celular });
        return Response.json({ ok: true, url });
      }
      const [entrada] = metades(valorTotal);
      const url = await criarCobranca({ ...dadosCliente, referencia }, entrada, `Entrada (50%): ${resumo}`);
      await lembrar({ referencia, origem: "calculadora", base, extras: itens });
      await notificar({ tipo: "checkout", origem: "calculadora", nome, negocio: resumo, valor: entrada, link: url, whatsapp: celular });
      return Response.json({ ok: true, url });
    }

    if (c.tipo === "assinatura") {
      const plano = planoMensal(c.plano);
      if (!plano) return recusa("Plano não encontrado.");
      const url = await criarAssinatura({ ...dadosCliente, referencia: `plano:${plano.id}` }, plano.valor, `Plano ${plano.nome} (mensal)`);
      await notificar({ tipo: "checkout", origem: "assinatura", nome, plano: plano.nome, valor: plano.valor, link: url });
      return Response.json({ ok: true, url });
    }

    return recusa("Tipo de pagamento inválido.");
  } catch (e) {
    // o detalhe (mensagem do Asaas) fica só no log; o visitante recebe a mensagem genérica
    console.error("Erro no Asaas", e);
    return recusa(FALHA, 502);
  }
}
