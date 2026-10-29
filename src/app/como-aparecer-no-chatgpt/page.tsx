import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PaginaConteudo } from "@/components/pagina-conteudo";
import { Botao, WhatsAppIcon } from "@/components/ui";

export const metadata: Metadata = {
  title: "Como fazer o seu negócio aparecer no ChatGPT e no Google com IA",
  description:
    "Guia prático para pequenos negócios: por que a busca mudou com a IA, o que faz o ChatGPT, o Gemini e o Google com IA recomendarem uma empresa e o que você pode fazer hoje.",
  alternates: { canonical: "/como-aparecer-no-chatgpt" },
};

const perguntas = [
  {
    pergunta: "Dá para pagar para aparecer no ChatGPT?",
    resposta:
      "Não. Nenhuma IA vende lugar na resposta e ninguém pode garantir citação. O que funciona é deixar o seu negócio fácil de encontrar e de entender: site claro, dados estruturados, Perfil da Empresa no Google e avaliações.",
  },
  {
    pergunta: "O ChatGPT usa o Google?",
    resposta:
      "O ChatGPT tem um robô de busca próprio (OAI-SearchBot) e usa em parte o índice do Bing. Por isso vale cadastrar o site também no Bing Webmaster Tools e no Bing Places, além do Google.",
  },
  {
    pergunta: "Preciso de um arquivo llms.txt?",
    resposta:
      "Não é obrigatório e o efeito ainda não é comprovado: o próprio Google diz que não precisa de arquivo especial para IA. Ele não atrapalha e é barato de ter, mas não substitui o básico bem feito.",
  },
  {
    pergunta: "Só Instagram não basta?",
    resposta:
      "Para a IA, quase nunca. Ela precisa de uma página aberta, em texto, com o que você faz, onde fica e como contratar. Perfil de rede social e link na bio são difíceis de ler e de confirmar.",
  },
  {
    pergunta: "Quanto tempo leva para a IA começar a citar o meu negócio?",
    resposta:
      "Depende de quando os robôs passam pelo site e da concorrência no seu segmento. Em geral são semanas ou meses. O primeiro passo é medir onde você está hoje com a análise grátis.",
  },
];

export default function PaginaGuiaIA() {
  return (
    <PaginaConteudo
      selo="Guia · buscas com IA"
      titulo="Como fazer o seu negócio aparecer no ChatGPT"
      destaque="e no Google com IA."
      resumo="O cliente agora pergunta para a IA qual empresa escolher e recebe poucos nomes, prontos. Este guia explica, sem promessa milagrosa, o que faz uma IA recomendar um negócio e o que você pode fazer hoje."
      acoes={
        <>
          <Botao href="/analise-ia" variante="lima">
            <Sparkles className="size-5" /> Fazer a análise grátis
          </Botao>
          <Botao mensagem="Oi! Li seu guia sobre aparecer no ChatGPT e quero ajuda com o meu negócio." variante="claro">
            <WhatsAppIcon /> Falar comigo
          </Botao>
        </>
      }
      pontos={["Dados com fonte", "Sem promessa de citação garantida", "Checklist prático"]}
      perguntas={perguntas}
    >
      <h2>A busca mudou</h2>
      <p>
        O Modo IA da busca do Google passou de <strong>1 bilhão de usuários por mês</strong> (Google, resultado do 2º trimestre
        de 2026). Quando o Google mostra um resumo de IA, as pessoas clicam em algum link em <strong>8% das visitas</strong>;
        sem o resumo, em 15% (Pew Research, 2025, nos EUA). E, também nos EUA, o uso de IA para achar negócios locais foi de
        6% para <strong>45%</strong> em um ano (BrightLocal, 2026).
      </p>
      <p>
        Na prática: a resposta vem pronta, com poucos nomes, e muita gente nem chega a clicar. A IA só recomenda quem ela
        consegue encontrar e entender.
      </p>
      <h2>O que faz uma IA recomendar um negócio</h2>
      <ol>
        <li>
          <strong>Um site aberto, em texto.</strong> Com o que você faz, para quem, onde fica, horário, preços e como contratar.
          Texto dentro de imagem não conta.
        </li>
        <li>
          <strong>Dados estruturados (schema.org).</strong> Um pequeno código que diz às buscas, sem ambiguidade, o tipo de
          negócio, endereço, telefone e serviços.
        </li>
        <li>
          <strong>Perfil da Empresa no Google completo e com avaliações.</strong> É de lá que o Gemini e o Google com IA tiram
          endereço, horário e nota.
        </li>
        <li>
          <strong>Nome, endereço e telefone iguais em todo lugar.</strong> Site, Google, Instagram, iFood, Doctoralia,
          diretórios. Divergência gera dúvida, e a IA evita recomendar quando está em dúvida.
        </li>
        <li>
          <strong>Páginas que respondem perguntas reais.</strong> &quot;Atende sábado?&quot;, &quot;Aceita convênio?&quot;,
          &quot;Quanto custa?&quot;. É o formato que a IA mais aproveita.
        </li>
        <li>
          <strong>Robôs liberados.</strong> O robots.txt não pode bloquear o Googlebot, o Bingbot, o OAI-SearchBot (ChatGPT) nem
          o PerplexityBot.
        </li>
        <li>
          <strong>Presença no Bing.</strong> O ChatGPT e o Copilot usam em parte o índice do Bing: cadastre o site no Bing
          Webmaster Tools e o negócio no Bing Places.
        </li>
      </ol>
      <h2>O que eu faço por você</h2>
      <p>
        Todo site que eu entrego já sai com esses pontos resolvidos. Para quem já tem site, revejo o que falta e corrijo. E no
        plano mensal Crescimento eu testo todo mês como o ChatGPT, o Gemini e o Google com IA respondem sobre o seu negócio.
      </p>
      <p>
        Comece pela <Link href="/analise-ia">análise grátis</Link>: em 30 segundos você vê se a IA já cita você e o que está
        impedindo.
      </p>
    </PaginaConteudo>
  );
}
