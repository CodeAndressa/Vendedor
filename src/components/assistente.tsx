"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { config, linkWhatsApp } from "@/lib/config";
import { LogoSimbolo } from "./logo";
import { WhatsAppIcon } from "./ui";

type Mensagem = { role: "user" | "assistant"; content: string };

const primeiroNome = config.nome.split(" ")[0];
const sugestoes = ["Quanto custa um site?", "Dá para parcelar sem entrada?", "Em quanto tempo fica pronto?", "Como funciona a IA no site?"];
const boasVindas: Mensagem = {
  role: "assistant",
  content: `Oi! Sou o assistente da ${primeiroNome}. Posso tirar suas dúvidas sobre sites, prazos e preços. O que você precisa?`,
};

// **negrito** simples, sem interpretar HTML
function Texto({ conteudo }: { conteudo: string }) {
  return (
    <>
      {conteudo.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
        parte.startsWith("**") && parte.endsWith("**") ? <strong key={i}>{parte.slice(2, -2)}</strong> : <span key={i}>{parte}</span>,
      )}
    </>
  );
}

// Agente de IA do site (Groq). É também a demonstração do "Assistente com IA" que a Andressa vende.
export function Assistente() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([boasVindas]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ block: "end" });
  }, [mensagens, pensando]);

  const enviar = async (pergunta: string) => {
    const conteudo = pergunta.trim();
    if (!conteudo || pensando) return;
    setTexto("");
    const historico: Mensagem[] = [...mensagens, { role: "user", content: conteudo }];
    setMensagens([...historico, { role: "assistant", content: "" }]);
    setPensando(true);

    const r = await fetch("/api/assistente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagens: historico.filter((m) => m !== boasVindas) }),
    }).catch(() => null);

    const escrever = (parcial: string) =>
      setMensagens((atual) => [...atual.slice(0, -1), { role: "assistant", content: parcial }]);

    if (!r?.ok || !r.body) {
      const json = r ? await r.json().catch(() => null) : null;
      escrever(json?.erro ?? "Não consegui responder agora. Me chama no WhatsApp!");
      setPensando(false);
      return;
    }
    const leitor = r.body.getReader();
    const decodificador = new TextDecoder();
    let resposta = "";
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      resposta += decodificador.decode(value, { stream: true });
      escrever(resposta);
    }
    if (!resposta) escrever("Não consegui responder agora. Me chama no WhatsApp!");
    setPensando(false);
  };

  const ultimaPergunta = [...mensagens].reverse().find((m) => m.role === "user")?.content;
  const whats = linkWhatsApp(ultimaPergunta ? `Oi! Vim pelo assistente do seu site. Minha dúvida: ${ultimaPergunta}` : "Oi! Vim pelo seu site.");

  return (
    <>
      <AnimatePresence>
        {aberto && (
          <motion.div
            role="dialog"
            aria-label={`Assistente da ${primeiroNome}`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-24 z-[60] flex max-h-[min(620px,calc(100svh-120px))] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-card shadow-[0_40px_90px_-30px_rgba(8,30,20,0.6)] sm:inset-x-auto sm:right-6 sm:w-[390px] md:bottom-28"
          >
            <header className="relative flex items-center gap-3 bg-forest px-5 py-4 text-white">
              <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-[radial-gradient(circle,rgba(217,194,142,0.25),transparent_70%)]" />
              <LogoSimbolo className="relative size-10" />
              <div className="relative flex-1">
                <div className="font-semibold">Assistente da {primeiroNome}</div>
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> Inteligência artificial · responde na hora
                </div>
              </div>
              <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" className="relative grid size-9 place-items-center rounded-full hover:bg-white/10">
                <X className="size-4" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-bg px-4 py-5 text-[15px] leading-relaxed">
              {mensagens.map((m, i) =>
                m.role === "assistant" ? (
                  <div key={i} className="max-w-[88%] rounded-2xl rounded-tl-md border border-line bg-card px-4 py-3 whitespace-pre-line text-ink">
                    {m.content ? (
                      <Texto conteudo={m.content} />
                    ) : (
                      <span className="inline-flex gap-1" aria-label="Digitando">
                        {[0, 1, 2].map((k) => (
                          <span key={k} className="size-1.5 animate-bounce rounded-full bg-ink/30" style={{ animationDelay: `${k * 0.15}s` }} />
                        ))}
                      </span>
                    )}
                  </div>
                ) : (
                  <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-forest px-4 py-3 text-white">
                    {m.content}
                  </div>
                ),
              )}
              {mensagens.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {sugestoes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => enviar(s)}
                      className="rounded-full border border-brand/25 bg-brand-soft/60 px-3 py-1.5 text-[13px] text-brand-dark transition hover:border-brand"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div ref={fim} />
            </div>

            <div className="border-t border-line bg-card p-3">
              <a
                href={whats}
                target="_blank"
                rel="noopener"
                className="mb-2.5 flex min-h-10 items-center justify-center gap-2 rounded-full bg-wa/10 text-sm font-semibold text-[#128C4B] transition hover:bg-wa/20"
              >
                <WhatsAppIcon className="size-4" /> Falar com a {primeiroNome}
              </a>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  enviar(texto);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  maxLength={800}
                  placeholder="Escreva sua dúvida…"
                  aria-label="Sua mensagem"
                  className="min-h-11 flex-1 rounded-full border border-line bg-bg px-4 text-[15px] outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  disabled={!texto.trim() || pensando}
                  aria-label="Enviar"
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-lime transition disabled:opacity-35"
                >
                  <ArrowUp className="size-5" />
                </button>
              </form>
              <p className="mt-2 text-center text-[11px] text-ink-soft">
                Quer um assistente assim no seu site? Ele entra como item adicional.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? "Fechar assistente" : "Abrir assistente com IA"}
        aria-expanded={aberto}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        className="fixed right-4 bottom-20 z-[60] flex h-14 items-center gap-2 rounded-full bg-forest pr-5 pl-2 text-white shadow-[0_0_0_1px_rgba(217,194,142,0.35),0_18px_40px_-12px_rgba(8,30,20,0.7)] md:right-6 md:bottom-6"
      >
        {aberto ? (
          <span className="grid size-10 place-items-center"><X className="size-5" /></span>
        ) : (
          <LogoSimbolo className="size-10" />
        )}
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="size-4 text-lime" /> {aberto ? "Fechar" : "Tire suas dúvidas"}
        </span>
      </motion.button>
    </>
  );
}
