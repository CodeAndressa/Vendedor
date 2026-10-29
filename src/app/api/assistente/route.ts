import { assistenteConfigurado, instrucoes } from "@/lib/assistente";
import { gravarTemporario, ipDe, lerTemporario, limitar, resumo } from "@/lib/limite";

// Conversa com o agente de IA (Groq). Devolve a resposta em texto, aos pedaços, conforme ela é gerada.
// A chave fica só no servidor; o navegador manda apenas as mensagens da conversa.

type Mensagem = { role: "user" | "assistant"; content: string };

const MAX_MENSAGENS = 6;
const MAX_CARACTERES = 800;
const RESPOSTA_VALE = 2 * 3600; // por quanto tempo uma resposta do assistente é aceita de volta no histórico

// Cada resposta que o servidor gera fica registrada (só o hash, por 2 h). Mensagem "assistant" que volta do
// navegador só entra no histórico se for idêntica a uma resposta registrada: assim ninguém inventa falas do
// assistente ("como combinamos, o site sai por R$ 100") para manipular a IA.
const chaveResposta = (texto: string) => `assistente:${resumo(texto)}`;

async function validar(corpo: unknown): Promise<Mensagem[] | null> {
  const lista = (corpo as { mensagens?: unknown })?.mensagens;
  if (!Array.isArray(lista) || lista.length === 0) return null;
  const ultimas = lista.slice(-MAX_MENSAGENS);
  const mensagens: Mensagem[] = [];
  for (const m of ultimas) {
    const { role, content } = (m ?? {}) as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    if (!content.trim()) continue;
    if (role === "assistant" && !(await lerTemporario<number>(chaveResposta(content)))) continue;
    mensagens.push({ role, content: content.trim().slice(0, MAX_CARACTERES) });
  }
  return mensagens.at(-1)?.role === "user" ? mensagens : null;
}

export async function POST(request: Request) {
  if (!assistenteConfigurado()) return Response.json({ erro: "Assistente desligado." }, { status: 503 });

  // 25 mensagens a cada 10 minutos por visitante (no Redis vale para todas as instâncias).
  if (!(await limitar("assistente-ip", ipDe(request), 25, 600)).ok)
    return Response.json({ erro: "Muitas mensagens seguidas. Me chama no WhatsApp que eu continuo por lá!" }, { status: 429 });

  const mensagens = await validar(await request.json().catch(() => null));
  if (!mensagens) return Response.json({ erro: "Mensagem inválida." }, { status: 400 });

  const base = (process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
  const groq = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [{ role: "system", content: instrucoes() }, ...mensagens],
      temperature: 0.4,
      max_completion_tokens: 600,
      reasoning_effort: "low",
      include_reasoning: false,
      stream: true,
    }),
    signal: AbortSignal.timeout(30000),
  }).catch(() => null);

  if (!groq?.ok || !groq.body) {
    console.error("Groq respondeu", groq?.status, await groq?.text().catch(() => ""));
    return Response.json({ erro: "O assistente não respondeu agora. Me chama no WhatsApp!" }, { status: 502 });
  }

  // Converte o fluxo SSE do Groq em texto puro.
  const decodificador = new TextDecoder();
  const codificador = new TextEncoder();
  let resto = "";
  let completa = "";
  const processar = (linhas: string[], saida: TransformStreamDefaultController<Uint8Array>) => {
    for (const linha of linhas) {
      if (!linha.startsWith("data:")) continue;
      const dado = linha.slice(5).trim();
      if (!dado || dado === "[DONE]") continue;
      try {
        const delta = JSON.parse(dado).choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) {
          completa += delta;
          saida.enqueue(codificador.encode(delta));
        }
      } catch {
        // linha incompleta: ignora
      }
    }
  };
  const texto = groq.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(pedaco, saida) {
        resto += decodificador.decode(pedaco, { stream: true });
        const linhas = resto.split("\n");
        resto = linhas.pop() ?? "";
        processar(linhas, saida);
      },
      async flush(saida) {
        processar([resto + decodificador.decode()], saida);
        // registra a resposta inteira, exatamente como o navegador vai mandar de volta no histórico
        if (completa) await gravarTemporario(chaveResposta(completa), 1, RESPOSTA_VALE);
      },
    }),
  );

  return new Response(texto, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
