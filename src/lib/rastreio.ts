"use client";

import { rastreio } from "./config";

// Eventos de conversão para Meta Ads e Google Ads/GA4. Se os IDs não estiverem configurados
// ou a pessoa recusou cookies, as funções simplesmente não fazem nada.

type Evento = "lead" | "contato" | "proposta" | "orcamento";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const meta: Record<Evento, string> = {
  lead: "Lead",
  contato: "Contact",
  proposta: "ViewContent",
  orcamento: "InitiateCheckout",
};

const google: Record<Evento, string> = {
  lead: "generate_lead",
  contato: "contact",
  proposta: "view_item",
  orcamento: "begin_checkout",
};

export function evento(nome: Evento, dados: Record<string, unknown> = {}) {
  try {
    window.fbq?.("track", meta[nome], dados);
    window.gtag?.("event", google[nome], dados);
    if (nome === "lead" && rastreio.googleAdsLead) window.gtag?.("event", "conversion", { send_to: rastreio.googleAdsLead });
  } catch {
    // rastreamento nunca pode quebrar a página
  }
}

// Guarda de onde a pessoa veio na primeira visita (anúncio, Google, Instagram...)
const CHAVE = "origem-visita";
const CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

export function registrarOrigem() {
  try {
    if (localStorage.getItem(CHAVE)) return;
    const params = new URLSearchParams(location.search);
    const origem: Record<string, string> = { entrada: location.pathname, referencia: document.referrer || "direto" };
    for (const c of CAMPOS) {
      const v = params.get(c);
      if (v) origem[c] = v.slice(0, 120);
    }
    localStorage.setItem(CHAVE, JSON.stringify(origem));
  } catch {
    // modo anônimo ou armazenamento bloqueado
  }
}

export function lerOrigem(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "{}");
  } catch {
    return {};
  }
}

export async function enviarLead(dados: Record<string, unknown>): Promise<{ ok: boolean; erro?: string; proposta?: string }> {
  try {
    const r = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...dados, utm: lerOrigem(), pagina: location.href }),
    });
    const json = await r.json();
    if (json.ok) evento("lead", { origem: dados.origem });
    return json;
  } catch {
    return { ok: false, erro: "Sem conexão. Tente de novo ou me chame no WhatsApp." };
  }
}
