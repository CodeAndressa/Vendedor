import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { modelos } from "@/lib/modelos";
import { nichos } from "@/lib/nichos";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/analise-ia`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/criacao-de-sites`, changeFrequency: "monthly", priority: 0.95 },
    { url: `${siteUrl}/criacao-de-sites-curitiba`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/como-aparecer-no-chatgpt`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/modelos`, changeFrequency: "weekly", priority: 0.8 },
    ...nichos.map((n) => ({ url: `${siteUrl}/para/${n.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...modelos.map((m) => ({ url: `${siteUrl}/modelos/${m.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    { url: `${siteUrl}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
