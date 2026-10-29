import type { Metadata } from "next";
import { Rodape } from "@/components/final";
import { Header } from "@/components/header";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Política de privacidade",
  alternates: { canonical: "/privacidade" },
};

// Texto base de privacidade (LGPD). Revise com um profissional se o negócio crescer.
export default function Privacidade() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-16 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_p]:mt-3 [&_p]:text-ink-soft">
        <h1 className="font-display text-4xl tracking-tight">Política de privacidade</h1>
        <p>
          Este site é de {config.nome}, que presta serviços de criação de sites e logos em {config.cidade}. Aqui explico,
          de forma simples, quais dados coleto e por quê, conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>
        <h2>Quais dados eu coleto</h2>
        <p>
          Quando você preenche o diagnóstico ou pede uma proposta, coleto nome, WhatsApp, nome do
          negócio e as respostas que você escolheu. Também registro a página de origem da visita (por exemplo, um
          anúncio ou uma busca no Google).
        </p>
        <h2>Para que uso</h2>
        <p>
          Para te enviar a proposta, conversar sobre o seu projeto pelo WhatsApp e entender quais canais trazem
          clientes. Não vendo nem compartilho seus dados com terceiros para fins de marketing.
        </p>
        <h2>Cookies e anúncios</h2>
        <p>
          Se você aceitar cookies, o site usa ferramentas do Google e da Meta (Facebook e Instagram) para medir visitas e
          melhorar os anúncios. Você pode recusar no aviso de cookies; o site continua funcionando normalmente.
        </p>
        <h2>Estatísticas anônimas</h2>
        <p>
          O próprio site conta, de forma anônima, quantas visitas cada página recebe, de onde as pessoas vieram (por exemplo,
          Google ou ChatGPT), quanto tempo ficaram e quanto rolaram. Para contar visitantes únicos, o navegador guarda um número
          aleatório que não identifica você. Nenhum nome, telefone, endereço IP ou dado pessoal entra nessas estatísticas, e
          elas só aparecem somadas.
        </p>
        <h2>Seus direitos</h2>
        <p>
          Você pode pedir a qualquer momento para ver, corrigir ou apagar seus dados. É só mandar uma mensagem para o
          WhatsApp {config.whatsappVisivel}.
        </p>
      </main>
      <Rodape />
    </>
  );
}
