import { semAcesso, semCache } from "@/lib/admin";
import { listarCarrinhos } from "@/lib/carrinho";
import { listarEnvios, resumoEnvios } from "@/lib/envios";

// E-mails para clientes (relatório da análise, proposta, carrinho com cupom) com aberturas e cliques,
// e os carrinhos abandonados. Alimenta a seção de e-mails da aba Leads do painel.
export async function GET(request: Request) {
  const negado = await semAcesso(request);
  if (negado) return negado;
  const envios = await listarEnvios();
  const carrinhos = await listarCarrinhos();
  const porModelo = Object.fromEntries(
    [...new Set(envios.map((e) => e.modelo))].map((m) => [m, resumoEnvios(envios.filter((e) => e.modelo === m))]),
  );
  return Response.json(
    {
      ok: true,
      resumo: resumoEnvios(envios),
      porModelo,
      envios: envios.slice(0, 300),
      carrinhos: carrinhos.map((c) => ({
        email: c.email,
        nome: c.nome,
        whatsapp: c.whatsapp,
        negocio: c.proposta.negocio,
        origem: c.origem,
        criadoEm: c.criadoEm,
        pagoEm: c.pagoEm,
        cupom: c.cupom ? { desconto: c.cupom.desconto, validade: c.cupom.validade, enviadoEm: c.cupom.enviadoEm } : null,
        ultimoAvisoEm: c.ultimoAvisoEm,
      })),
    },
    { headers: semCache },
  );
}
