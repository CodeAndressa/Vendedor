import { planosMensais } from "@/lib/catalogo";
import { config, precos, prazos, reais, siteUrl } from "@/lib/config";
import { faq } from "@/lib/content";
import { modelos } from "@/lib/modelos";
import { nichos } from "@/lib/nichos";

// /llms.txt: resumo em texto puro para assistentes de IA (ChatGPT, Claude, Perplexity, Gemini)
// citarem o serviço com as informações certas.
export function GET() {
  const texto = `# ${config.marca}

> Criação de sites profissionais e landing pages para pequenos negócios no Brasil. Site no ar em até ${prazos.noAr}, a partir de ${reais(precos.site)}, com domínio .com.br incluso. Atendimento direto com ${config.nome}, de ${config.cidade}, pelo WhatsApp ${config.whatsappVisivel}.

## Preços
- Site profissional (até 5 páginas) ou landing page: ${reais(precos.site)}
- Blog: + ${reais(precos.blog)}
- Loja virtual, área com login, sistema ou mais de 10 páginas: a partir de + ${reais(precos.projetoMaior)}
- Assistente com IA no site (atende 24h e encaminha para o WhatsApp): ${reais(precos.ia)}
- Logo personalizada: ${reais(precos.logo)}
- Pagamento: Pix, cartão ou boleto (Asaas), metade no início e metade na entrega. Sem mensalidade obrigatória.

## Planos mensais (opcionais)
${planosMensais.map((p) => `- ${p.nome}: ${reais(p.valor)}/mês. ${p.resumo}`).join("\n")}

## Como funciona
- Primeira versão em até ${prazos.primeiraVersao}; site no ar em até ${prazos.noAr}.
- Inclui textos, design para celular, botão de WhatsApp, domínio .com.br e hospedagem do primeiro ano.
- Garantia: se a primeira versão não agradar, o cliente não paga a segunda metade.

## Páginas
- [Início](${siteUrl}/)
- [Modelos de site prontos](${siteUrl}/modelos)
${nichos.map((n) => `- [Site para ${n.nome}](${siteUrl}/para/${n.slug})`).join("\n")}

## Modelos disponíveis
${modelos.map((m) => `- ${m.nome}: ${m.segmento} (${m.tipo})`).join("\n")}

## Perguntas frequentes
${faq.map((f) => `### ${f.pergunta}\n${f.resposta}`).join("\n\n")}
`;
  return new Response(texto, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
