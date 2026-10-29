import type { Metadata } from "next";
import { Bricolage_Grotesque, Fraunces, Inter, Space_Grotesk } from "next/font/google";
import { scriptAbertura } from "@/components/abertura";
import { RolagemDaNavegacao } from "@/components/efeitos";
import { IlhaProvider } from "@/components/ilha";
import { Medidor } from "@/components/medidor";
import { Rastreamento } from "@/components/rastreamento";
import { config, siteUrl } from "@/lib/config";
import "./globals.css";

// Mesma fonte do site da 4Core
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Fontes extras usadas nos modelos de site
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "800"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

// Título da página inicial (aba do navegador e Google): marca primeiro, o que vende depois.
const titulo = "soares.ai · Site profissional em 7 dias";
const descricao =
  "Seu site ou landing page no ar em até 7 dias, a partir de R$ 997, com domínio .com.br incluso. Primeira versão em 48h e, no pagamento 50% + 50%, você só paga a segunda metade se gostar.";

export const metadata: Metadata = {
  title: { default: titulo, template: `%s | ${config.marca}` },
  description: descricao,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: titulo,
    description: descricao,
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      // o script da abertura marca o <html> antes do React assumir a página
      suppressHydrationWarning
      // o Next desliga a rolagem suave do CSS durante a troca de página (senão ela "escorrega" até o topo)
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${bricolage.variable} ${fraunces.variable} ${grotesk.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptAbertura }} />
      </head>
      <body className="min-h-full font-sans">
        <IlhaProvider>{children}</IlhaProvider>
        <RolagemDaNavegacao />
        <Rastreamento />
        <Medidor />
      </body>
    </html>
  );
}
