"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, Sparkles } from "lucide-react";
import { bases, extras, total, type Base, type Extra } from "@/lib/catalogo";
import { linkWhatsApp, reais } from "@/lib/config";
import { modelos } from "@/lib/modelos";
import { enviarLead } from "@/lib/rastreio";
import { useIlha } from "./ilha";
import { Eyebrow, Titulo, WhatsAppIcon } from "./ui";

const segmentos = [
  { rotulo: "Saúde", categoria: "Saúde" },
  { rotulo: "Beleza e estética", categoria: "Beleza" },
  { rotulo: "Restaurante e delivery", categoria: "Alimentação" },
  { rotulo: "Advocacia, contabilidade e serviços", categoria: "Serviços" },
  { rotulo: "Academia e personal", categoria: "Fitness" },
  { rotulo: "Pet", categoria: "Pet" },
  { rotulo: "Arquitetura e criativos", categoria: "Criativo" },
  { rotulo: "Outro", categoria: "" },
];

const objetivos = [
  "Receber mais contatos no WhatsApp",
  "Aparecer no Google",
  "Anunciar no Instagram e Google",
  "Vender online",
  "Passar mais credibilidade",
];

const temJa = ["Logo", "Domínio (.com.br)", "Instagram ativo", "Fotos do negócio", "Nada ainda"];

type Respostas = { segmento: string; objetivo: string; tem: string[] };

// Transforma as respostas em uma recomendação de plano e modelo.
function recomendar(r: Respostas) {
  const base: Base = r.objetivo.startsWith("Anunciar") ? "landing" : "site";
  const lista: Extra[] = [];
  if (r.objetivo === "Vender online") lista.push("maior");
  if (r.objetivo === "Aparecer no Google") lista.push("blog");
  if (!r.tem.includes("Logo")) lista.push("logo");
  const categoria = segmentos.find((s) => s.rotulo === r.segmento)?.categoria;
  const modelo = modelos.find((m) => m.categoria === categoria && (base === "landing" ? m.tipo === "Landing page" : true))
    ?? modelos.find((m) => m.categoria === categoria);
  return { base, extras: lista, modelo };
}

function Opcao({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 px-5 py-3 text-left font-medium transition ${
        ativo ? "border-brand bg-brand-soft/70" : "border-line bg-card hover:border-ink/30"
      }`}
    >
      {children}
      <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition ${ativo ? "border-brand bg-brand text-white" : "border-line"}`}>
        {ativo && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

const campo = "min-h-13 w-full rounded-2xl border-2 border-line bg-card px-4 py-3 outline-none transition focus:border-brand";

export function Diagnostico() {
  const [passo, setPasso] = useState(0);
  const [direcao, setDirecao] = useState(1);
  const [r, setR] = useState<Respostas>({ segmento: "", objetivo: "", tem: [] });
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [negocio, setNegocio] = useState("");
  const [aceite, setAceite] = useState(false);
  const [armadilha, setArmadilha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [proposta, setProposta] = useState<string | null>(null);
  const reduzir = useReducedMotion();
  const { avisar } = useIlha();

  const ir = (n: number) => {
    setDirecao(n > passo ? 1 : -1);
    setPasso(n);
  };
  const escolher = (campoR: "segmento" | "objetivo", valor: string) => {
    setR((a) => ({ ...a, [campoR]: valor }));
    setTimeout(() => ir(passo + 1), 220);
  };
  const alternarTem = (v: string) =>
    setR((a) => {
      if (v === "Nada ainda") return { ...a, tem: a.tem.includes(v) ? [] : [v] };
      const sem = a.tem.filter((x) => x !== "Nada ainda");
      return { ...a, tem: sem.includes(v) ? sem.filter((x) => x !== v) : [...sem, v] };
    });

  const rec = recomendar(r);
  const valor = total(rec.extras);
  const digitos = whatsapp.replace(/\D/g, "");
  const podeEnviar = nome.trim().length >= 2 && digitos.length >= 10 && aceite && !enviando;

  const enviar = async () => {
    setErro("");
    setEnviando(true);
    const resposta = await enviarLead({
      origem: "diagnostico",
      nome,
      whatsapp: digitos.length <= 11 ? `55${digitos}` : digitos,
      negocio,
      consentimento: aceite,
      site: armadilha,
      respostas: r,
      proposta: { negocio, segmento: r.segmento, objetivo: r.objetivo, modelo: rec.modelo?.slug, base: rec.base, extras: rec.extras },
    });
    setEnviando(false);
    if (!resposta.ok) {
      setErro(resposta.erro ?? "Não deu certo. Tente de novo.");
      return;
    }
    setProposta(resposta.proposta ?? "");
    avisar("Proposta pronta!", "Feita sob medida para você");
    ir(4);
  };

  const mensagem = `Oi! Sou ${nome.trim() || "eu"}${negocio ? `, da ${negocio}` : ""}. Fiz o diagnóstico no seu site.\nObjetivo: ${r.objetivo}\nRecomendação: ${bases[rec.base].titulo}${rec.extras.length ? ` + ${rec.extras.map((e) => extras[e].titulo).join(", ")}` : ""} (${reais(valor)})${proposta ? `\n\nMinha proposta: ${proposta}` : ""}`;

  const passos = [
    {
      titulo: "Qual é o seu tipo de negócio?",
      conteudo: (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {segmentos.map((s) => (
            <Opcao key={s.rotulo} ativo={r.segmento === s.rotulo} onClick={() => escolher("segmento", s.rotulo)}>
              {s.rotulo}
            </Opcao>
          ))}
        </div>
      ),
    },
    {
      titulo: "O que você mais quer agora?",
      conteudo: (
        <div className="grid gap-2.5">
          {objetivos.map((o) => (
            <Opcao key={o} ativo={r.objetivo === o} onClick={() => escolher("objetivo", o)}>
              {o}
            </Opcao>
          ))}
        </div>
      ),
    },
    {
      titulo: "O que você já tem?",
      conteudo: (
        <>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {temJa.map((t) => (
              <Opcao key={t} ativo={r.tem.includes(t)} onClick={() => alternarTem(t)}>
                {t}
              </Opcao>
            ))}
          </div>
          <button
            type="button"
            disabled={r.tem.length === 0}
            onClick={() => ir(3)}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest px-6 font-semibold text-white transition disabled:opacity-40"
          >
            Continuar <ArrowRight className="size-4" />
          </button>
        </>
      ),
    },
    {
      titulo: "Para onde eu mando sua proposta?",
      conteudo: (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (podeEnviar) enviar();
          }}
          className="grid gap-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" aria-label="Seu nome" autoComplete="name" className={campo} />
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="WhatsApp com DDD"
              aria-label="WhatsApp com DDD"
              inputMode="tel"
              autoComplete="tel"
              className={campo}
            />
          </div>
          <input value={negocio} onChange={(e) => setNegocio(e.target.value)} placeholder="Nome do negócio (opcional)" aria-label="Nome do negócio" className={campo} />
          {/* campo escondido contra robôs */}
          <input value={armadilha} onChange={(e) => setArmadilha(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="site" />
          <label className="flex items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-brand)]" />
            Autorizo receber a proposta e o contato pelo WhatsApp. Seus dados não são compartilhados.
          </label>
          <button
            type="submit"
            disabled={!podeEnviar}
            className="mt-2 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-brand px-6 text-lg font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
          >
            {enviando ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
            {enviando ? "Montando sua proposta…" : "Ver minha proposta"}
          </button>
          {erro && <p className="text-sm font-semibold text-red-700">{erro}</p>}
        </form>
      ),
    },
  ];

  const progresso = Math.min(passo, 4) / 4;

  return (
    <section id="diagnostico" className="py-24 md:py-32">
      <div className="mx-auto grid max-w-[1440px] items-start gap-12 px-5 md:px-10 xl:px-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28">
          <Eyebrow>Diagnóstico grátis · 30 segundos</Eyebrow>
          <Titulo>Descubra o site certo para o seu negócio</Titulo>
          <p className="mt-5 text-lg text-ink-soft">
            Responda 3 perguntas e receba na hora uma proposta com plano, modelo e valor. Sem compromisso.
          </p>
          <ul className="mt-8 grid gap-3 text-ink-soft">
            {["Proposta personalizada na hora", "Preço fechado, sem surpresa", "Você decide depois, com calma"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <Check className="size-4 text-brand" strokeWidth={3} /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-line bg-bg-alt p-6 md:p-10">
          <div className="mb-8 flex items-center gap-4">
            {passo > 0 && passo < 4 && (
              <button type="button" onClick={() => ir(passo - 1)} aria-label="Voltar" className="grid size-10 place-items-center rounded-full border border-line bg-card">
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
              <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${progresso * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
            <span className="text-sm font-semibold text-ink-soft">{passo < 4 ? `${passo + 1}/4` : "Pronto"}</span>
          </div>

          <AnimatePresence mode="wait" custom={direcao}>
            <motion.div
              key={passo}
              initial={reduzir ? { opacity: 0 } : { opacity: 0, x: 40 * direcao }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduzir ? { opacity: 0 } : { opacity: 0, x: -40 * direcao }}
              transition={{ duration: 0.25 }}
            >
              {passo < 4 ? (
                <>
                  <h3 className="mb-6 font-display text-2xl md:text-3xl">{passos[passo].titulo}</h3>
                  {passos[passo].conteudo}
                </>
              ) : (
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1 text-sm font-bold text-forest">
                    <Sparkles className="size-4" /> Sua recomendação
                  </span>
                  <h3 className="mt-4 font-display text-3xl">
                    {bases[rec.base].titulo}
                    {rec.extras.length > 0 && <span className="text-brand"> + {rec.extras.map((e) => extras[e].titulo.split(" (")[0]).join(" + ")}</span>}
                  </h3>
                  <p className="mt-3 text-ink-soft">
                    Para quem quer <strong className="text-ink">{r.objetivo.charAt(0).toLowerCase() + r.objetivo.slice(1)}</strong>
                    {rec.modelo ? `, começando pelo modelo ${rec.modelo.nome}` : ""}.
                  </p>
                  <div className="mt-6 flex items-baseline justify-between rounded-2xl bg-forest p-5 text-white">
                    <span className="text-white/70">Investimento</span>
                    <span className="font-display text-4xl">{reais(valor)}</span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {proposta && (
                      <a
                        href={proposta}
                        target="_blank"
                        rel="noopener"
                        className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-forest font-semibold text-white transition hover:-translate-y-0.5"
                      >
                        <FileText className="size-5" /> Ver proposta completa
                      </a>
                    )}
                    <a
                      href={linkWhatsApp(mensagem)}
                      target="_blank"
                      rel="noopener"
                      className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-brand font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark"
                    >
                      <WhatsAppIcon /> Quero começar
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
