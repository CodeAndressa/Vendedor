import type { Metadata } from "next";
import { Rodape } from "@/components/final";
import { Header } from "@/components/header";
import { config, linkWhatsApp, rastreio } from "@/lib/config";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Quais dados o site de ${config.nome} coleta, para quê, com quem são compartilhados, por quanto tempo ficam guardados e como pedir acesso ou exclusão.`,
  alternates: { canonical: "/privacidade" },
};

const emailContato = "andressasoaresvalesko@gmail.com";
const atualizada = "29 de outubro de 2026";

// Operadores: empresas que tratam dados em nome da controladora para o site funcionar.
const operadores = [
  { nome: "Vercel", papel: "hospedagem do site", local: "EUA" },
  { nome: "Upstash", papel: "banco de dados onde ficam os pedidos de proposta e de análise", local: "EUA" },
  { nome: "Resend", papel: "envio do relatório da análise de IA e dos e-mails de aviso de novo contato", local: "EUA" },
  { nome: "Asaas", papel: "cobranças e pagamentos (Pix, cartão e boleto)", local: "Brasil" },
  { nome: "Groq", papel: "modelo de inteligência artificial do chat e da análise de IA", local: "EUA" },
];

// Texto base de privacidade (LGPD). Revise com um profissional se o negócio crescer.
export default function Privacidade() {
  const temCookies = Boolean(rastreio.metaPixel || rastreio.googleTag);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-16 [&_a]:font-semibold [&_a]:text-brand-dark [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_li]:mt-2 [&_p]:mt-3 [&_p]:text-ink-soft [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-ink-soft">
        <h1 className="font-display text-4xl tracking-tight">Política de privacidade</h1>
        <p className="!mt-2 text-sm">Atualizada em {atualizada}.</p>
        <p>
          Aqui explico, de forma simples, quais dados este site coleta, para que uso, com quem eles são compartilhados e
          como você pode pedir para ver, corrigir ou apagar o que for seu, conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>

        <h2>Quem cuida dos seus dados</h2>
        <p>
          A controladora dos dados é {config.nome}, que presta serviços de criação de sites em {config.cidade}. Contato para
          qualquer assunto de privacidade: WhatsApp{" "}
          <a href={linkWhatsApp("Oi! Tenho uma dúvida sobre os meus dados no seu site.")} target="_blank" rel="noopener">
            {config.whatsappVisivel}
          </a>{" "}
          ou e-mail <a href={`mailto:${emailContato}`}>{emailContato}</a>.
        </p>

        <h2>Quais dados eu coleto</h2>
        <ul>
          <li>
            <strong className="text-ink">Diagnóstico e pedido de proposta:</strong> nome, WhatsApp, nome do negócio e as
            respostas que você escolheu.
          </li>
          <li>
            <strong className="text-ink">Análise de IA:</strong> nome do negócio, segmento, cidade, site ou Instagram (se
            informar), seu nome, e-mail (para onde mando o relatório) e WhatsApp.
          </li>
          <li>
            <strong className="text-ink">Chat do site:</strong> as mensagens que você escreve na conversa com o assistente.
          </li>
          <li>
            <strong className="text-ink">Pagamento:</strong> nome ou razão social, CPF ou CNPJ, celular e e-mail (opcional),
            enviados ao Asaas para gerar a cobrança. Dados de cartão são digitados direto na página do Asaas e não passam
            por este site.
          </li>
          <li>
            <strong className="text-ink">Origem da visita:</strong> a página de entrada e de onde você veio (por exemplo, um
            anúncio ou uma busca no Google), guardadas no seu navegador e enviadas junto com um pedido de proposta.
          </li>
        </ul>

        <h2>Para que uso</h2>
        <p>
          Para responder ao seu pedido, montar e enviar a proposta, fazer a análise que você pediu, conversar sobre o seu
          projeto pelo WhatsApp, emitir cobranças quando você contrata e entender quais canais trazem clientes. A base
          legal é o seu consentimento (marcado no formulário) e, quando você contrata, a execução do contrato e o
          cumprimento de obrigações legais e fiscais. Não vendo seus dados nem os uso para marketing de terceiros.
        </p>

        <h2>Com quem os dados são compartilhados</h2>
        <p>Só com as empresas que fazem o site funcionar, que tratam os dados em meu nome:</p>
        <ul>
          {operadores.map((o) => (
            <li key={o.nome}>
              <strong className="text-ink">{o.nome}</strong>: {o.papel} ({o.local}).
            </li>
          ))}
        </ul>

        <h2>Inteligência artificial e transferência internacional</h2>
        <p>
          As mensagens do chat e os dados do negócio informados na análise de IA são enviados a um provedor de
          inteligência artificial (Groq, nos EUA) para gerar a resposta. Hospedagem, banco de dados e e-mail também ficam
          em servidores nos EUA. Essa transferência internacional é necessária para o serviço funcionar e é feita com
          empresas que adotam medidas de segurança compatíveis com a LGPD. Evite escrever no chat dados sensíveis, como
          documentos ou informações de saúde.
        </p>

        <h2>Por quanto tempo guardo</h2>
        <ul>
          <li>Pedidos de proposta e de análise: até 2 anos depois do último contato, ou até você pedir a exclusão.</li>
          <li>
            Conversas do chat: não ficam guardadas. O site mantém por pouco tempo só um código de conferência de cada resposta,
            que não permite ler a conversa.
          </li>
          <li>
            Dados de clientes que contrataram (cobranças e notas): pelo prazo exigido pela legislação fiscal e contábil.
          </li>
        </ul>

        {temCookies ? (
          <>
            <h2>Cookies e anúncios</h2>
            <p>
              Se você aceitar cookies, o site usa ferramentas do Google e da Meta (Facebook e Instagram) para medir visitas
              e melhorar os anúncios. Você pode recusar no aviso de cookies e o site continua funcionando normalmente.
            </p>
          </>
        ) : (
          <>
            <h2>Cookies</h2>
            <p>
              Hoje o site não usa cookies de anúncios nem ferramentas de rastreamento de terceiros. Se isso mudar, um aviso
              vai pedir a sua permissão antes.
            </p>
          </>
        )}

        <h2>Estatísticas anônimas</h2>
        <p>
          O próprio site conta, de forma anônima, quantas visitas cada página recebe, de onde as pessoas vieram (por exemplo,
          Google ou ChatGPT), quanto tempo ficaram e quanto rolaram. Para contar visitantes únicos, o navegador guarda um
          número aleatório que não identifica você. Nenhum nome, telefone, endereço IP ou dado pessoal entra nessas
          estatísticas, e elas só aparecem somadas.
        </p>

        <h2>Seus direitos</h2>
        <p>
          Você pode, a qualquer momento e sem custo: confirmar se tenho dados seus, ver uma cópia, corrigir o que estiver
          errado, pedir a exclusão, revogar o consentimento, saber com quem os dados foram compartilhados e pedir a
          portabilidade. É só mandar uma mensagem para o WhatsApp {config.whatsappVisivel} ou para{" "}
          <a href={`mailto:${emailContato}`}>{emailContato}</a>. Respondo em até 15 dias. Se não ficar satisfeito, você
          também pode procurar a Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </main>
      <Rodape />
    </>
  );
}
