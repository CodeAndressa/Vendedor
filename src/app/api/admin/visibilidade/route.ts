import { semCache } from "@/lib/admin";
import { adminAutorizado } from "@/lib/servidor";
import { lerTestes, testarVisibilidade } from "@/lib/visibilidade";

// Histórico do teste "a IA cita você?" e botão para testar agora.
export async function GET(request: Request) {
  const negado = await adminAutorizado(request);
  if (negado) return negado;
  return Response.json({ ok: true, testes: await lerTestes() }, { headers: semCache });
}

export async function POST(request: Request) {
  const negado = await adminAutorizado(request);
  if (negado) return negado;
  await testarVisibilidade();
  return Response.json({ ok: true, testes: await lerTestes() }, { headers: semCache });
}
