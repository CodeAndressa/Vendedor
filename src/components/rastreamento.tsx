"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { AnimatePresence, motion } from "motion/react";
import { config, rastreio } from "@/lib/config";
import { evento, registrarOrigem } from "@/lib/rastreio";

const CHAVE = "consentimento-cookies";
type Escolha = "sim" | "nao" | null;

// Escolha de cookies guardada no navegador (com memória de reserva se o armazenamento estiver bloqueado).
let emMemoria: Escolha | undefined;
const ouvintes = new Set<() => void>();
const assinar = (f: () => void) => {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
};
const ler = (): Escolha => {
  if (emMemoria !== undefined) return emMemoria;
  try {
    return (localStorage.getItem(CHAVE) as Escolha) ?? null;
  } catch {
    return null;
  }
};
const salvar = (v: "sim" | "nao") => {
  emMemoria = v;
  try {
    localStorage.setItem(CHAVE, v);
  } catch {
    // fica só na memória desta visita
  }
  ouvintes.forEach((f) => f());
};

// Carrega Meta Pixel e Google (GA4/Ads) só depois que a pessoa aceita cookies (LGPD),
// registra de onde ela veio e conta cada clique no WhatsApp como conversão.
export function Rastreamento() {
  const consentimento = useSyncExternalStore(assinar, ler, () => "nao" as Escolha);
  const temRastreio = Boolean(rastreio.metaPixel || rastreio.googleTag);

  useEffect(() => {
    registrarOrigem();
    const aoClicar = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest?.(`a[href^='https://wa.me/${config.whatsapp}']`);
      if (link) evento("contato", { pagina: location.pathname });
    };
    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, []);

  const decidir = salvar;

  return (
    <>
      {consentimento === "sim" && rastreio.metaPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${rastreio.metaPixel}');fbq('track','PageView');`}
        </Script>
      )}
      {consentimento === "sim" && rastreio.googleTag && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${rastreio.googleTag}`} strategy="afterInteractive" />
          <Script id="google-tag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${rastreio.googleTag}');${
              rastreio.googleAdsLead ? `gtag('config','${rastreio.googleAdsLead.split("/")[0]}');` : ""
            }`}
          </Script>
        </>
      )}

      <AnimatePresence>
        {temRastreio && consentimento === null && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-24 left-4 z-50 max-w-sm rounded-2xl border border-line bg-card p-5 text-sm shadow-xl md:bottom-6"
          >
            <p className="text-ink-soft">
              Uso cookies para entender de onde vêm as visitas e melhorar os anúncios.{" "}
              <Link href="/privacidade" className="font-semibold text-brand underline">
                Saiba mais
              </Link>
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => decidir("sim")} className="min-h-10 flex-1 rounded-full bg-brand font-semibold text-white">
                Aceitar
              </button>
              <button type="button" onClick={() => decidir("nao")} className="min-h-10 flex-1 rounded-full border border-line font-semibold">
                Recusar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
