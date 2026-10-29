import { semAcesso, semCache } from "@/lib/admin";
import { emailValido } from "@/lib/servidor";
import { adicionarCartoes, atualizarCartao, colunas, ehColuna, excluirCartao, lerCartao, listarCartoes, moverCartao, type NovoCartao } from "@/lib/kanban";
import { enviarPropostaPorEmail } from "@/lib/email-proposta";
import { montarPropostaComIA } from "@/lib/proposta-ia";

// Kanban da aba Leads: listar, adicionar (do robô ou manual), mover, anotar, excluir, montar proposta com IA
// e enviar a proposta por e-mail (com abertura e cliques rastreados).

const texto = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const numero = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const situacoesSite = new Set(["sem-site", "so-rede-social", "tem-site"]);

function cartaoDoRobo(p: Record<string, unknown>): NovoCartao | null {
  const negocio = texto(p.nome ?? p.negocio, 100);
  if (!negocio) return null;
  const whatsapp = texto(p.telefone ?? p.whatsapp, 20).replace(/\D/g, "");
  return {
    negocio,
    contato: texto(p.contato, 80) || undefined,
    whatsapp: whatsapp.length >= 12 ? whatsapp : whatsapp.length >= 10 ? `55${whatsapp}` : undefined,
    telefoneVisivel: texto(p.telefoneVisivel, 30) || undefined,
    categoria: texto(p.categoria, 60) || undefined,
    endereco: texto(p.endereco, 160) || undefined,
    maps: texto(p.maps, 300) || undefined,
    site: situacoesSite.has(String(p.site)) ? (p.site as NovoCartao["site"]) : undefined,
    linkAtual: texto(p.linkAtual, 300) || undefined,
    pontos: numero(p.pontos),
    nota: numero(p.nota) ?? null,
    avaliacoes: numero(p.avaliacoes),
    origem: p.origem === "manual" ? "manual" : "robo",
  };
}

export async function GET(request: Request) {
  const negado = await semAcesso(request);
  if (negado) return negado;
  return Response.json({ ok: true, colunas, cartoes: await listarCartoes() }, { headers: semCache });
}

export async function POST(request: Request) {
  const negado = await semAcesso(request);
  if (negado) return negado;
  const c = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!c) return Response.json({ ok: false, erro: "Formato inválido." }, { status: 400 });
  const id = texto(c.id, 60);

  try {
    switch (c.acao) {
      case "adicionar": {
        const lista = (Array.isArray(c.cartoes) ? c.cartoes : [c.cartao]).slice(0, 200);
        const novos = lista.map((x) => (x && typeof x === "object" ? cartaoDoRobo(x as Record<string, unknown>) : null)).filter((x): x is NovoCartao => !!x);
        if (!novos.length) return Response.json({ ok: false, erro: "Nenhuma empresa válida." }, { status: 400 });
        const r = await adicionarCartoes(novos);
        return Response.json({ ok: true, ...r, cartoes: await listarCartoes() }, { headers: semCache });
      }
      case "mover": {
        if (!ehColuna(c.coluna)) return Response.json({ ok: false, erro: "Coluna inválida." }, { status: 400 });
        await moverCartao(id, c.coluna);
        break;
      }
      case "nota": {
        const nota = texto(c.texto, 600);
        if (!nota) return Response.json({ ok: false, erro: "Escreva a anotação." }, { status: 400 });
        await atualizarCartao(id, (x) => {
          x.notas = [...(x.notas ?? []), { texto: nota, em: new Date().toISOString() }].slice(-50);
        });
        break;
      }
      case "editar": {
        await atualizarCartao(id, (x) => {
          const contato = texto(c.contato, 80);
          const whatsapp = texto(c.whatsapp, 20).replace(/\D/g, "");
          if (contato) x.contato = contato;
          if (whatsapp.length >= 10) x.whatsapp = whatsapp.length >= 12 ? whatsapp : `55${whatsapp}`;
        });
        break;
      }
      case "excluir":
        await excluirCartao(id);
        break;
      case "proposta": {
        const cartao = await lerCartao(id);
        if (!cartao) return Response.json({ ok: false, erro: "Cartão não encontrado." }, { status: 404 });
        if (!cartao.whatsapp) return Response.json({ ok: false, erro: "Esse lead não tem WhatsApp. Adicione o número no cartão." }, { status: 400 });
        const pronta = await montarPropostaComIA({
          nome: cartao.negocio,
          categoria: cartao.categoria ?? "",
          endereco: cartao.endereco ?? "",
          telefone: cartao.whatsapp,
          site: cartao.site ?? "sem-site",
          linkAtual: cartao.linkAtual ?? "",
          maps: cartao.maps ?? "",
          nota: cartao.nota ?? null,
          avaliacoes: cartao.avaliacoes ?? 0,
        });
        const assinatura = new URL(pronta.link).searchParams.get("a") ?? "";
        await atualizarCartao(id, (x) => {
          x.proposta = { link: pronta.link, mensagem: pronta.mensagem, whatsapp: pronta.whatsapp, assinatura, geradaEm: new Date().toISOString() };
        });
        break;
      }
      case "email-proposta": {
        const cartao = await lerCartao(id);
        if (!cartao?.proposta) return Response.json({ ok: false, erro: "Monte a proposta antes de enviar." }, { status: 400 });
        const email = (texto(c.email, 120) || cartao.email || "").toLowerCase();
        if (!emailValido(email)) return Response.json({ ok: false, erro: "Informe o e-mail do cliente." }, { status: 400 });
        const r = await enviarPropostaPorEmail({ para: email, link: cartao.proposta.link, contato: cartao.contato });
        if (!r.enviado)
          return Response.json(
            { ok: false, erro: r.motivo === "descadastrado" ? "Esse e-mail pediu para não receber mais mensagens." : "O e-mail não saiu. Confira o endereço e tente de novo." },
            { status: 400 },
          );
        await atualizarCartao(id, (x) => {
          x.email = email;
          x.selos = [...new Set([...(x.selos ?? []), "proposta por e-mail"])];
        });
        await moverCartao(id, "proposta");
        break;
      }
      case "enviada": {
        // clicou em "Enviar no WhatsApp": vai para "Proposta enviada"
        await moverCartao(id, "proposta");
        break;
      }
      default:
        return Response.json({ ok: false, erro: "Ação inválida." }, { status: 400 });
    }
  } catch (e) {
    console.error("Erro no kanban", e);
    return Response.json({ ok: false, erro: "Não consegui concluir agora. Tente de novo." }, { status: 500 });
  }
  return Response.json({ ok: true, cartoes: await listarCartoes() }, { headers: semCache });
}
