import { config, precos, siteUrl } from "@/lib/config";
import { faq } from "@/lib/content";

// Dados estruturados (schema.org): ajudam Google e buscas com IA a entender quem você é,
// o que vende, quanto custa e as respostas mais comuns.
export function JsonLd({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      // conteúdo gerado por nós, sem entrada de usuário
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }}
    />
  );
}

export function dadosNegocio() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#negocio`,
    name: config.marca,
    founder: { "@id": `${siteUrl}/#pessoa` },
    image: `${siteUrl}/opengraph-image`,
    logo: `${siteUrl}/icon.svg`,
    url: siteUrl,
    telephone: `+${config.whatsapp}`,
    areaServed: [
      { "@type": "Country", name: "Brasil" },
      { "@type": "City", name: "Curitiba" },
    ],
    address: { "@type": "PostalAddress", addressLocality: config.cidade.split(",")[0], addressRegion: "PR", addressCountry: "BR" },
    description:
      "Criação de sites profissionais e landing pages para pequenos negócios de todo o Brasil (atendimento 100% online, com base em Curitiba), no ar em até 7 dias, a partir de R$ 997, com domínio .com.br incluso, preparados para aparecer no Google e nas buscas com inteligência artificial (ChatGPT, Gemini, Google com IA).",
    priceRange: `R$ ${precos.logo.toFixed(2).replace(".", ",")} - R$ ${precos.site + precos.projetoMaior}`,
    knowsAbout: ["criação de sites", "landing page", "SEO local", "Google Meu Negócio", "otimização para buscas com IA (GEO)", "assistente com inteligência artificial", "Next.js"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços",
      itemListElement: [
        { name: "Site profissional (até 5 páginas)", price: precos.site },
        { name: "Landing page", price: precos.site },
        { name: "Blog", price: precos.blog },
        { name: "Assistente com IA no site", price: precos.ia },
        { name: "Análise grátis: como a IA enxerga o seu negócio", price: 0 },
        { name: "Logo personalizada", price: precos.logo },
      ].map((o) => ({
        "@type": "Offer",
        priceCurrency: "BRL",
        price: o.price,
        itemOffered: { "@type": "Service", name: o.name },
      })),
    },
  };
}

// Quem é a Andressa: ajuda as IAs a ligar o nome à profissão, à cidade e aos trabalhos.
export function dadosPessoa() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#pessoa`,
    name: config.nome,
    jobTitle: "Desenvolvedora de sites e especialista em presença digital com IA",
    url: siteUrl,
    worksFor: { "@id": `${siteUrl}/#negocio` },
    homeLocation: { "@type": "City", name: "Curitiba" },
    knowsAbout: ["desenvolvimento web", "criação de sites", "inteligência artificial", "dados e BI", "GEO", "SEO local"],
    sameAs: config.perfis,
  };
}

export function dadosSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#site`,
    url: siteUrl,
    name: config.marca,
    inLanguage: "pt-BR",
    publisher: { "@id": `${siteUrl}/#negocio` },
  };
}

export function dadosFaq(perguntas: { pergunta: string; resposta: string }[] = faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: perguntas.map((p) => ({
      "@type": "Question",
      name: p.pergunta,
      acceptedAnswer: { "@type": "Answer", text: p.resposta },
    })),
  };
}
