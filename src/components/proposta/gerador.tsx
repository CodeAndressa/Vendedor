"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Copy, ExternalLink } from "lucide-react";
import { bases, extras, total, type Base, type Extra } from "@/lib/catalogo";
import { reais } from "@/lib/config";
import { modelos } from "@/lib/modelos";
import { CampoChave, useChaveAdmin } from "../admin/chave";
import { WhatsAppIcon } from "../ui";

const campo = "min-h-12 w-full rounded-xl border-2 border-line bg-card px-4 outline-none transition focus:border-brand";

function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {rotulo}
      {children}
      {dica && <span className="text-xs font-normal text-ink-soft">{dica}</span>}
    </label>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-4 rounded-3xl border border-line bg-card p-5">
      <legend className="px-2 font-display text-lg">{titulo}</legend>
      {children}
    </fieldset>
  );
}

// Escolhe um modelo que combine com a categoria vinda do Google (ex.: "Hamburgueria" → Onda).
function modeloSugerido(categoria: string) {
  const c = categoria.toLowerCase();
  const pares: [string[], string][] = [
    [["hamb", "lanch", "burger"], "onda"],
    [["restaur", "pizz", "bar", "comida"], "brasa"],
    [["dent", "odonto", "clínic", "clinic", "médic", "saúde"], "sereno"],
    [["salão", "salao", "beleza", "estética", "estetica", "barb", "manicure"], "bloom"],
    [["advog", "jurid"], "toga"],
    [["contab", "contad"], "conta-certa"],
    [["academ", "personal", "fitness", "pilates"], "pulso"],
    [["pet", "veterin"], "patas"],
    [["arquit", "interior", "design"], "linha"],
  ];
  return pares.find(([chaves]) => chaves.some((k) => c.includes(k)))?.[1] ?? "";
}

export function GeradorProposta() {
  const q = useSearchParams();
  const admin = useChaveAdmin();
  const [pagina, setPagina] = useState<"proposta" | "resultado">("proposta");
  const [cliente, setCliente] = useState(q.get("cliente") ?? "");
  const [negocio, setNegocio] = useState(q.get("negocio") ?? "");
  const [telefone, setTelefone] = useState(q.get("telefone") ?? "");
  const [objetivo, setObjetivo] = useState("");
  const [modelo, setModelo] = useState(modeloSugerido(q.get("segmento") ?? ""));
  const [base, setBase] = useState<Base>("site");
  const [escolhidos, setEscolhidos] = useState<Extra[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [dias, setDias] = useState(7);
  const [observacao, setObservacao] = useState("");
  const [atualSite, setAtualSite] = useState("");
  const [previa, setPrevia] = useState("");
  const [entregue, setEntregue] = useState("");
  const [maps, setMaps] = useState({
    nome: q.get("mapsNome") ?? "",
    nota: q.get("mapsNota") ?? "",
    avaliacoes: q.get("mapsAvaliacoes") ?? "",
    endereco: q.get("mapsEndereco") ?? "",
    categoria: q.get("mapsCategoria") ?? "",
    url: q.get("mapsUrl") ?? "",
    link: q.get("mapsLink") ?? "",
  });
  const [link, setLink] = useState("");
  const [curto, setCurto] = useState(""); // o que vai para o cliente (soareslab.com/p/...)
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const gerar = async () => {
    setErro("");
    setLink("");
    setEnviando(true);
    admin.lembrar();
    const validade = new Date();
    validade.setDate(validade.getDate() + dias);
    const r = await fetch("/api/proposta", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-chave": admin.chave },
      body: JSON.stringify({
        pagina,
        cliente,
        negocio,
        objetivo,
        modelo,
        base,
        extras: escolhidos,
        desconto,
        observacao,
        validade: validade.toISOString().slice(0, 10),
        atualSite,
        previa,
        entregue,
        maps: maps.nome ? maps : undefined,
      }),
    }).catch(() => null);
    const json = r ? await r.json().catch(() => null) : null;
    setEnviando(false);
    if (json?.ok) {
      setLink(json.link);
      setCurto(json.curto ?? json.link);
    }
    else setErro(json?.erro ?? "Não consegui gerar. Confira a conexão.");
  };

  const copiar = async () => {
    await navigator.clipboard.writeText(curto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const saudacao = cliente ? `Oi, ${cliente.split(" ")[0]}!` : "Oi, tudo bem?";
  const mensagemCliente =
    pagina === "resultado"
      ? `${saudacao} O site${negocio ? ` da ${negocio}` : ""} está no ar! Montei um antes e depois pra você ver. Abre no seu celular:\n\n${curto}`
      : `${saudacao} Montei uma prévia de como ficaria o site${negocio ? ` da ${negocio}` : ""}, lado a lado com como está hoje. Abre no seu celular, que é onde seus clientes vão ver:\n\n${curto}`;
  const numero = telefone.replace(/\D/g, "");
  const destino = numero ? `https://wa.me/${numero.length <= 11 ? `55${numero}` : numero}` : "https://wa.me/";

  return (
    <div className="mt-10 grid gap-6">
      <CampoChave {...admin} />

      <div className="grid grid-cols-2 gap-2 rounded-full bg-bg-alt p-1.5">
        {(["proposta", "resultado"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setPagina(t)}
            className={`min-h-11 rounded-full text-sm font-semibold ${pagina === t ? "bg-forest text-white" : "text-ink-soft"}`}
          >
            {t === "proposta" ? "Proposta (antes de vender)" : "Resultado (depois de entregar)"}
          </button>
        ))}
      </div>

      <Bloco titulo="Cliente">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Nome do dono">
            <input value={cliente} onChange={(e) => setCliente(e.target.value)} className={campo} placeholder="Se souber" />
          </Campo>
          <Campo rotulo="Negócio *">
            <input value={negocio} onChange={(e) => setNegocio(e.target.value)} className={campo} placeholder="Ex.: Burger do Zé" />
          </Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="WhatsApp do cliente" dica="Para mandar o link direto para ele.">
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className={campo} inputMode="tel" />
          </Campo>
          <Campo rotulo="Objetivo">
            <input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} className={campo} placeholder="Ex.: receber pedidos pelo WhatsApp" />
          </Campo>
        </div>
      </Bloco>

      <Bloco titulo="Hoje × como vai ficar">
        <Campo rotulo="Site atual do cliente" dica="Se tiver site, eu tiro o print no celular e meço a velocidade como o Google mede.">
          <input value={atualSite} onChange={(e) => setAtualSite(e.target.value)} className={campo} placeholder="https://..." />
        </Campo>
        <p className="text-sm text-ink-soft">Sem site? Preencha como ele aparece no Google Maps (o robô já preenche sozinho):</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={maps.nome} onChange={(e) => setMaps({ ...maps, nome: e.target.value })} className={campo} placeholder="Nome no Maps" aria-label="Nome no Maps" />
          <input value={maps.categoria} onChange={(e) => setMaps({ ...maps, categoria: e.target.value })} className={campo} placeholder="Categoria" aria-label="Categoria" />
          <input value={maps.nota} onChange={(e) => setMaps({ ...maps, nota: e.target.value })} className={campo} placeholder="Nota (ex.: 4,7)" aria-label="Nota" inputMode="decimal" />
          <input value={maps.avaliacoes} onChange={(e) => setMaps({ ...maps, avaliacoes: e.target.value })} className={campo} placeholder="Nº de avaliações" aria-label="Avaliações" inputMode="numeric" />
          <input value={maps.endereco} onChange={(e) => setMaps({ ...maps, endereco: e.target.value })} className={`${campo} sm:col-span-2`} placeholder="Endereço" aria-label="Endereço" />
        </div>
        <Campo rotulo={pagina === "resultado" ? "Link do site entregue *" : "Link da prévia que você montou (opcional)"} dica={pagina === "resultado" ? undefined : "Sem prévia, uso o modelo escolhido abaixo com o nome do negócio."}>
          {pagina === "resultado" ? (
            <input value={entregue} onChange={(e) => setEntregue(e.target.value)} className={campo} placeholder="https://..." />
          ) : (
            <input value={previa} onChange={(e) => setPrevia(e.target.value)} className={campo} placeholder="https://..." />
          )}
        </Campo>
      </Bloco>

      {pagina === "proposta" && (
        <Bloco titulo="O que vai ser feito">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Tipo">
              <select value={base} onChange={(e) => setBase(e.target.value as Base)} className={campo}>
                {Object.entries(bases).map(([id, b]) => (
                  <option key={id} value={id}>
                    {b.titulo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Modelo de partida">
              <select value={modelo} onChange={(e) => setModelo(e.target.value)} className={campo}>
                <option value="">Nenhum (do zero)</option>
                {modelos.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.nome} · {m.segmento}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <div className="grid gap-2">
            {(Object.keys(extras) as Extra[]).map((id) => (
              <label key={id} className="flex items-center gap-3 rounded-xl border-2 border-line bg-bg px-4 py-3">
                <input
                  type="checkbox"
                  checked={escolhidos.includes(id)}
                  onChange={() => setEscolhidos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))}
                  className="size-4 accent-[var(--color-brand)]"
                />
                <span className="flex-1">{extras[id].titulo}</span>
                <span className="font-semibold">+ {reais(extras[id].valor)}</span>
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Desconto (R$)">
              <input type="number" min={0} step={10} value={desconto} onChange={(e) => setDesconto(Number(e.target.value))} className={campo} />
            </Campo>
            <Campo rotulo="Validade (dias)">
              <input type="number" min={1} max={60} value={dias} onChange={(e) => setDias(Number(e.target.value))} className={campo} />
            </Campo>
          </div>
          <Campo rotulo="Observações (aparecem para o cliente)">
            <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={3} className={`${campo} py-3`} />
          </Campo>
          <div className="flex items-center justify-between rounded-2xl bg-forest p-5 text-white">
            <span className="text-white/70">Total da proposta</span>
            <span className="font-display text-3xl">{reais(total(escolhidos, desconto))}</span>
          </div>
        </Bloco>
      )}

      <button
        type="button"
        onClick={gerar}
        disabled={!(negocio || cliente) || !admin.chave || enviando || (pagina === "resultado" && !entregue)}
        className="min-h-14 rounded-full bg-brand text-lg font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {enviando ? "Gerando…" : pagina === "resultado" ? "Gerar link do resultado" : "Gerar link da proposta"}
      </button>
      {erro && <p className="text-center font-semibold text-red-700">{erro}</p>}

      {link && (
        <div className="grid gap-3 rounded-2xl border-2 border-brand bg-brand-soft p-5">
          <div className="text-sm font-semibold">Link pronto. Abra uma vez antes de mandar: assim a medição já fica pronta e o cliente vê na hora.</div>
          <div className="truncate rounded-lg bg-card px-3 py-2 font-mono text-xs">{curto}</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={copiar} className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-card font-semibold">
              {copiado ? <Check className="size-4" /> : <Copy className="size-4" />} {copiado ? "Copiado" : "Copiar"}
            </button>
            <a href={`${link}&interno=1`} target="_blank" rel="noopener" className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-card font-semibold">
              <ExternalLink className="size-4" /> Conferir
            </a>
            <a
              href={`${destino}?text=${encodeURIComponent(mensagemCliente)}`}
              target="_blank"
              rel="noopener"
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand font-semibold text-white"
            >
              <WhatsAppIcon className="size-4" /> {numero ? "Mandar para ele" : "Enviar"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
