"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Lock, Printer } from "lucide-react";
import { avisoAssinatura } from "@/lib/catalogo";
import { assinaturaSite } from "@/lib/config";
import { linkWhatsApp } from "@/lib/config";
import { evento } from "@/lib/rastreio";
import { Checkout } from "../checkout";
import { WhatsAppIcon } from "../ui";

// Conta a visualização e te avisa (pelo webhook) quando o cliente abre a proposta.
// Links abertos por você com &interno=1 não geram aviso.
export function ContarVisualizacao({ p, a }: { p: string; a: string }) {
  useEffect(() => {
    evento("proposta");
    if (new URLSearchParams(location.search).has("interno")) return;
    const chave = `proposta-aberta-${a}`;
    try {
      if (sessionStorage.getItem(chave)) return;
      sessionStorage.setItem(chave, "1");
    } catch {}
    fetch("/api/proposta/aberta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p, a }),
      keepalive: true,
    }).catch(() => {});
  }, [p, a]);
  return null;
}

export function AcoesProposta({
  link,
  p,
  a,
  podePagar,
  cliente,
  negocio,
  total,
  entrada,
  parcela,
}: {
  link: string;
  p: string;
  a: string;
  podePagar: boolean;
  cliente: string;
  negocio: string;
  total: string;
  entrada: string;
  parcela: string;
}) {
  const [pagando, setPagando] = useState<"entrada" | "parcelado" | null>(null);
  const quem = cliente || negocio || "eu";
  const mensagem = `Oi! Sou ${quem}${cliente && negocio ? `, da ${negocio}` : ""}. Li a proposta de ${total} e quero aprovar para começar.\n\n${link}`;
  return (
    <section className="mt-8 grid gap-3 print:hidden">
      {podePagar && (
        <button
          type="button"
          onClick={() => setPagando("entrada")}
          className="flex min-h-16 items-center justify-center gap-2.5 rounded-full bg-brand px-6 text-lg font-semibold text-white shadow-[0_12px_28px_-12px] shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-dark"
        >
          <Lock className="size-5" /> Aprovar e pagar a entrada ({entrada})
        </button>
      )}
      {podePagar && (
        <button
          type="button"
          onClick={() => setPagando("parcelado")}
          className="flex min-h-14 items-center justify-center gap-2.5 rounded-full border-[1.5px] border-brand/40 bg-brand-soft/50 px-6 font-semibold text-brand-dark transition hover:-translate-y-0.5 hover:border-brand"
        >
          <CalendarClock className="size-5" /> Ou assinar em {assinaturaSite.parcelas}x de {parcela} sem entrada
        </button>
      )}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <a
          href={linkWhatsApp(mensagem)}
          target="_blank"
          rel="noopener"
          className={`flex min-h-14 items-center justify-center gap-2.5 rounded-full px-6 font-semibold transition hover:-translate-y-0.5 ${
            podePagar ? "border-[1.5px] border-line hover:border-ink" : "bg-brand text-lg text-white hover:bg-brand-dark"
          }`}
        >
          <WhatsAppIcon /> {podePagar ? "Tirar uma dúvida no WhatsApp" : "Aprovar pelo WhatsApp"}
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-14 items-center justify-center gap-2 rounded-full border-[1.5px] border-line px-6 font-semibold transition hover:border-ink"
        >
          <Printer className="size-5" /> Salvar em PDF
        </button>
      </div>
      <Checkout
        aberto={pagando !== null}
        fechar={() => setPagando(null)}
        titulo={pagando === "parcelado" ? `Site por assinatura · ${assinaturaSite.parcelas} parcelas, sem entrada` : "Entrada de 50% para começar"}
        valor={pagando === "parcelado" ? `${parcela}/mês` : entrada}
        dados={{ tipo: pagando ?? "entrada", p, a }}
        aviso={pagando === "parcelado" ? `Li e concordo: são ${assinaturaSite.parcelas} parcelas mensais de ${parcela}. ${avisoAssinatura}` : undefined}
        nomeInicial={cliente}
        mensagemWhatsApp={mensagem}
      />
    </section>
  );
}
