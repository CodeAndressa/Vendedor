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
    founder: { "@type": "Person", name: config.nome },
    url: siteUrl,
    telephone: `+${config.whatsapp}`,
    areaServed: { "@type": "Country", name: "Brasil" },
    address: { "@type": "PostalAddress", addressLocality: config.cidade.split(",")[0], addressRegion: "PR", addressCountry: "BR" },
    description:
      "Criação de sites profissionais e landing pages para pequenos negócios, no ar em até 7 dias, a partir de R$ 997, com domínio .com.br incluso.",
    priceRange: `R$ ${precos.logo.toFixed(2).replace(".", ",")} - R$ ${precos.site + precos.projetoMaior}`,
    knowsAbout: ["criação de sites", "landing page", "SEO local", "Google Meu Negócio", "criação de logo"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços",
      itemListElement: [
        { name: "Site profissional (até 5 páginas)", price: precos.site },
        { name: "Landing page", price: precos.site },
        { name: "Blog", price: precos.blog },
        { name: "Assistente com IA no site", price: precos.ia },
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
