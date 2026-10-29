import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PaginaConteudo } from "@/components/pagina-conteudo";
import { Botao, WhatsAppIcon } from "@/components/ui";
import { assinaturaSite, config, precos, prazos, reais } from "@/lib/config";
import { parcelaAssinatura } from "@/lib/catalogo";

const titulo = `Criação de sites para todo o Brasil a partir de ${reais(precos.site)}`;

export const metadata: Metadata = {
  title: titulo,
  description: `Criação de sites e landing pages para pequenos negócios de todo o Brasil, com atendimento 100% online: no ar em até ${prazos.noAr}, a partir de ${reais(precos.site)}, com domínio .com.br, versão para celular e preparado para o Google e para as buscas com IA.`,
  alternates: { canonical: "/criacao-de-sites" },
};

const perguntas = [
  {
    pergunta: "Quanto custa criar um site profissional?",
    resposta: `Com a ${config.nome}, um site de até 5 páginas ou uma landing page custa ${reais(precos.site)}, preço fechado, com domínio .com.br e hospedagem do primeiro ano. Dá para pagar metade no início e metade na entrega, ou em ${assinaturaSite.parcelas}x de ${reais(parcelaAssinatura(precos.site))} sem entrada.`,
  },
  {
    pergunta: "Em quanto tempo o site fica pronto?",
    resposta: `A primeira versão fica pronta em ${prazos.primeiraVersao} e o site vai ao ar em até ${prazos.noAr}, com os ajustes que você pedir.`,
  },
  {
    pergunta: "Você atende a minha cidade?",
    resposta:
      "Atendo negócios de qualquer cidade do Brasil. Todo o processo é online: conversa pelo WhatsApp, primeira versão por link, pagamento por Pix, cartão ou boleto e site publicado no seu domínio. A base é em Curitiba.",
  },
  {
    pergunta: "O site aparece no Google e no ChatGPT?",
    resposta:
      "O site sai pronto para ser lido pelo Google e pelas buscas com IA: dados estruturados do negócio, textos claros com cidade e serviços, robôs liberados e página rápida. Ninguém pode garantir posição ou citação, mas tirar esses obstáculos é o que faz a diferença.",
  },
  {
    pergunta: "Preciso escrever os textos?",
    resposta: "Não. Os textos são escritos a partir de uma conversa no WhatsApp sobre o seu negócio. Você só revisa e aprova.",
  },
];

export default function PaginaBrasil() {
  return (
    <PaginaConteudo
      selo="Atendimento online · todo o Brasil"
      titulo="Criação de sites para o Brasil inteiro,"
      destaque={`no ar em ${prazos.noAr}.`}
      resumo={`Sites e landing pages para pequenos negócios de qualquer cidade do Brasil, com atendimento direto comigo pelo WhatsApp, do primeiro oi ao site no ar. A partir de ${reais(precos.site)}, com domínio incluso e preparado para o Google e para as IAs.`}
      acoes={
        <>
          <Botao mensagem="Oi! Quero um site para o meu negócio." variante="lima">
            <WhatsAppIcon /> Quero meu site
          </Botao>
          <Botao href="/analise-ia" variante="claro">
            <Sparkles className="size-4" /> Ver como a IA me enxerga
          </Botao>
        </>
      }
      pontos={[`Primeira versão em ${prazos.primeiraVersao}`, "Domínio .com.br incluso", `${assinaturaSite.parcelas}x sem entrada`, "100% online, qualquer cidade"]}
      perguntas={perguntas}
    >
      <h2>Site profissional, de qualquer lugar do Brasil</h2>
      <p>
        Em qualquer cidade, a concorrência é grande: tem hamburgueria em cada esquina, clínica em cada bairro e escritório em cada prédio. Quem procura um serviço pergunta ao Google, ao Google Maps e, cada vez mais, ao ChatGPT e ao
        Gemini. O cliente escolhe entre os poucos nomes que aparecem, e quem não tem um site claro fica de fora.
      </p>
      <p>
        Eu faço o site do seu negócio do zero, com textos, design, versão para celular, botão de WhatsApp em todas as páginas
        e configuração para as buscas. Você acompanha tudo pelo WhatsApp, vê a primeira versão em {prazos.primeiraVersao} e, no
        pagamento em duas partes (50% + 50%), só paga a segunda metade se gostar.
      </p>
      <h2>O que está incluso</h2>
      <ul>
        <li>Site de até 5 páginas ou landing page focada em anúncios</li>
        <li>Textos escritos para você, pensados para vender e para as buscas</li>
        <li>Domínio .com.br no seu nome e hospedagem do primeiro ano</li>
        <li>Dados estruturados (schema.org) com endereço, horário e serviços</li>
        <li>Cadeado de segurança (HTTPS), página rápida e boas práticas de segurança</li>
        <li>Ajustes pequenos por 30 dias depois da entrega</li>
      </ul>
      <h2>Para quais negócios</h2>
      <p>
        Restaurantes, hamburguerias, clínicas, dentistas, salões, advogados, contadores, academias, personal trainers e
        empresas que vendem para outras empresas. Veja os <Link href="/modelos">modelos prontos</Link> para começar e o{" "}
        <Link href="/#portfolio">portfólio</Link>.
      </p>
      <h2>Quer saber se a IA já recomenda você?</h2>
      <p>
        Faça a <Link href="/analise-ia">análise grátis</Link>: eu pergunto à IA o que o seu cliente perguntaria, leio o seu site
        como os robôs leem e mostro uma nota de 0 a 100 com o que corrigir.
      </p>
    </PaginaConteudo>
  );
}
