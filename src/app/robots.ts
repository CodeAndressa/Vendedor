import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

// Liberado para Google e para os robôs das buscas com IA (ChatGPT, Perplexity, Claude, Gemini).
// Propostas e telas internas ficam fora.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/proposta", "/prospectar", "/resultado"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
