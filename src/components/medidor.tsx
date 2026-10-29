"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Mede visitas, tempo, rolagem e cliques de forma anônima (só contadores, nenhum dado pessoal).
// O identificador é um número aleatório guardado no navegador, usado só para contar visitantes únicos.

export function enviarMetrica(dados: Record<string, unknown>) {
  try {
    const corpo = JSON.stringify(dados);
    if (navigator.sendBeacon) navigator.sendBeacon("/api/metrica", new Blob([corpo], { type: "application/json" }));
    else fetch("/api/metrica", { method: "POST", body: corpo, keepalive: true, headers: { "Content-Type": "application/json" } });
  } catch {
    // métrica nunca pode quebrar o site
  }
}

function idDoVisitante() {
  try {
    let id = localStorage.getItem("vid");
    if (!id) {
      id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      localStorage.setItem("vid", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export function Medidor() {
  const pagina = usePathname();

  useEffect(() => {
    if (pagina.startsWith("/admin")) return;
    let novo = false;
    try {
      novo = !sessionStorage.getItem("sessao");
      sessionStorage.setItem("sessao", "1");
    } catch {}
    const utm = new URLSearchParams(location.search).get("utm_source") ?? "";
    const referrer = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : "";
    enviarMetrica({ t: "vista", p: pagina, r: referrer, u: utm, v: idDoVisitante(), novo });

    // tempo com a aba visível e quanto da página foi rolado
    let visivelDesde = document.visibilityState === "visible" ? Date.now() : 0;
    let acumulado = 0;
    let rolagem = 0;
    let enviado = false;
    const medirRolagem = () => {
      const total = document.documentElement.scrollHeight - innerHeight;
      if (total > 0) rolagem = Math.max(rolagem, Math.round((scrollY / total) * 100));
    };
    const visibilidade = () => {
      if (document.visibilityState === "hidden") {
        if (visivelDesde) acumulado += Date.now() - visivelDesde;
        visivelDesde = 0;
        fechar();
      } else visivelDesde = Date.now();
    };
    const fechar = () => {
      if (enviado) return;
      enviado = true;
      const total = acumulado + (visivelDesde ? Date.now() - visivelDesde : 0);
      enviarMetrica({ t: "tempo", p: pagina, s: Math.round(total / 1000), r: rolagem });
    };
    // cliques que interessam no funil
    const clique = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a");
      const href = link?.getAttribute("href") ?? "";
      if (/wa\.me|api\.whatsapp/.test(href)) enviarMetrica({ t: "evento", n: "whatsapp" });
      else if (href.startsWith("/analise-ia")) enviarMetrica({ t: "evento", n: "cta_analise" });
    };
    addEventListener("scroll", medirRolagem, { passive: true });
    document.addEventListener("visibilitychange", visibilidade);
    addEventListener("pagehide", fechar);
    document.addEventListener("click", clique, true);
    return () => {
      fechar();
      removeEventListener("scroll", medirRolagem);
      document.removeEventListener("visibilitychange", visibilidade);
      removeEventListener("pagehide", fechar);
      document.removeEventListener("click", clique, true);
    };
  }, [pagina]);

  return null;
}
