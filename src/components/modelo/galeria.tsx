"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { linkWhatsApp, precos, reais } from "@/lib/config";
import { categorias, estilos, modelos, type Modelo } from "@/lib/modelos";
import { useIlha } from "../ilha";
import { WhatsAppIcon } from "../ui";

const tipos = ["Todos", "Site", "Landing page"] as const;

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`min-h-10 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition ${
        ativo ? "border-forest bg-forest text-white" : "border-line bg-card text-ink-soft hover:border-ink/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function mensagemModelo(m: Modelo) {
  return `Oi! Vi o modelo "${m.nome}" (${m.segmento}) no seu site e quero um parecido para o meu negócio.`;
}

export function Galeria({ previas }: { previas: Record<string, ReactNode> }) {
  const [categoria, setCategoria] = useState<string | null>(null);
  const [tipo, setTipo] = useState<(typeof tipos)[number]>("Todos");
  const [estilo, setEstilo] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const { avisar } = useIlha();

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return modelos.filter(
      (m) =>
        (!categoria || m.categoria === categoria) &&
        (tipo === "Todos" || m.tipo === tipo) &&
        (!estilo || (m.estilos as string[]).includes(estilo)) &&
        (!termo || `${m.nome} ${m.segmento} ${m.categoria}`.toLowerCase().includes(termo)),
    );
  }, [categoria, tipo, estilo, busca]);

  const limpar = () => {
    setCategoria(null);
    setTipo("Todos");
    setEstilo(null);
    setBusca("");
  };
  const filtrando = categoria || tipo !== "Todos" || estilo || busca;

  return (
    <div>
      <div className="sticky top-[72px] z-30 -mx-5 border-b border-line bg-bg/90 px-5 py-4 backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block lg:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar: clínica, restaurante..."
              aria-label="Buscar modelo"
              className="min-h-11 w-full rounded-full border border-line bg-card pr-4 pl-11 text-[15px] outline-none transition focus:border-brand"
            />
          </label>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0">
            {tipos.map((t) => (
              <Chip key={t} ativo={tipo === t} onClick={() => setTipo(t)}>
                {t}
              </Chip>
            ))}
            <span className="mx-1 w-px shrink-0 bg-line" />
            {categorias.map((c) => (
              <Chip key={c} ativo={categoria === c} onClick={() => setCategoria(categoria === c ? null : c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
        <div className="-mx-5 mt-3 flex items-center gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:px-0">
          <span className="text-xs font-semibold tracking-wider text-ink-soft uppercase">Estilo</span>
          {estilos.map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={estilo === e}
              onClick={() => setEstilo(estilo === e ? null : e)}
              className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                estilo === e ? "bg-lime text-forest" : "bg-bg-alt text-ink-soft hover:text-ink"
              }`}
            >
              {e}
            </button>
          ))}
          {filtrando && (
            <button type="button" onClick={limpar} className="ml-auto flex items-center gap-1 text-xs font-semibold whitespace-nowrap text-brand">
              <X className="size-3.5" /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        {lista.length} {lista.length === 1 ? "modelo" : "modelos"} · todos a partir de {reais(precos.site)} e adaptados
        ao seu negócio
      </p>

      <motion.div layout className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {lista.map((m) => (
            <motion.article
              key={m.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="group overflow-hidden rounded-3xl border border-line bg-card transition-shadow hover:shadow-[0_30px_60px_-36px_rgba(10,42,28,0.5)]"
            >
              <Link href={`/modelos/${m.slug}`} className="relative block overflow-hidden border-b border-line">
                <div className="transition duration-500 group-hover:scale-[1.03]">{previas[m.slug]}</div>
                <span className="absolute top-3 left-3 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  {m.tipo}
                </span>
                <span className="absolute inset-0 grid place-items-center bg-forest/0 opacity-0 transition group-hover:bg-forest/40 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest">
                    Ver ao vivo <ArrowUpRight className="size-4" />
                  </span>
                </span>
              </Link>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl">{m.nome}</h3>
                    <p className="text-sm text-ink-soft">{m.segmento}</p>
                  </div>
                  <div className="flex -space-x-1.5 pt-1">
                    {[m.cores.fundo, m.cores.destaque, m.cores.texto].map((c, i) => (
                      <span key={i} className="size-5 rounded-full border-2 border-card" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.estilos.map((e) => (
                    <span key={e} className="rounded-full bg-bg-alt px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                      {e}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link
                    href={`/modelos/${m.slug}`}
                    className="flex min-h-11 items-center justify-center rounded-full border-[1.5px] border-line text-sm font-semibold transition hover:border-ink"
                  >
                    Ver ao vivo
                  </Link>
                  <a
                    href={linkWhatsApp(mensagemModelo(m))}
                    target="_blank"
                    rel="noopener"
                    onClick={() => avisar(`Modelo ${m.nome} escolhido`, "Abrindo o WhatsApp…")}
                    className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark"
                  >
                    <WhatsAppIcon className="size-4" /> Quero este
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {lista.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-line p-12 text-center">
          <p className="font-semibold">Nenhum modelo com esses filtros.</p>
          <p className="mt-1 text-ink-soft">Mas eu faço do zero para o seu segmento também.</p>
          <button type="button" onClick={limpar} className="mt-4 text-sm font-semibold text-brand">
            Ver todos os modelos
          </button>
        </div>
      )}
    </div>
  );
}
