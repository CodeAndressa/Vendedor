import { assistenteConfigurado, instrucoes } from "@/lib/assistente";

// Conversa com o agente de IA (Groq). Devolve a resposta em texto, aos pedaços, conforme ela é gerada.
// A chave fica só no servidor; o navegador manda apenas as mensagens da conversa.

type Mensagem = { role: "user" | "assistant"; content: string };

const MAX_MENSAGENS = 16;
const MAX_CARACTERES = 800;

// Limite simples por visitante: 25 mensagens a cada 10 minutos (por instância do servidor).
const janela = 10 * 60 * 1000;
const usos = new Map<string, number[]>();
function passouDoLimite(ip: string) {
  const agora = Date.now();
  const recentes = (usos.get(ip) ?? []).filter((t) => agora - t < janela);
  recentes.push(agora);
  usos.set(ip, recentes);
  if (usos.size > 5000) usos.clear();
  return recentes.length > 25;
}

function validar(corpo: unknown): Mensagem[] | null {
  const lista = (corpo as { mensagens?: unknown })?.mensagens;
  if (!Array.isArray(lista) || lista.length === 0) return null;
  const mensagens = lista.slice(-MAX_MENSAGENS).map((m) => {
    const { role, content } = (m ?? {}) as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    return { role, content: content.trim().slice(0, MAX_CARACTERES) } as Mensagem;
  });
  if (mensagens.some((m) => !m || !m.content)) return null;
  return mensagens.at(-1)!.role === "user" ? (mensagens as Mensagem[]) : null;
}

export async function POST(request: Request) {
  if (!assistenteConfigurado()) return Response.json({ erro: "Assistente desligado." }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (passouDoLimite(ip))
    return Response.json({ erro: "Muitas mensagens seguidas. Me chama no WhatsApp que eu continuo por lá!" }, { status: 429 });

  const mensagens = validar(await request.json().catch(() => null));
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
  const texto = groq.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(pedaco, saida) {
        resto += decodificador.decode(pedaco, { stream: true });
        const linhas = resto.split("\n");
        resto = linhas.pop() ?? "";
        for (const linha of linhas) {
          if (!linha.startsWith("data:")) continue;
          const dado = linha.slice(5).trim();
          if (!dado || dado === "[DONE]") continue;
          try {
            const delta = JSON.parse(dado).choices?.[0]?.delta?.content;
            if (delta) saida.enqueue(codificador.encode(delta));
          } catch {
            // linha incompleta: ignora
          }
        }
      },
    }),
  );

  return new Response(texto, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
