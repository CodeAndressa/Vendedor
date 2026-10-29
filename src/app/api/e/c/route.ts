import { siteUrl } from "@/lib/config";
import { cliqueConfere, registrarClique } from "@/lib/envios";

// Botões dos e-mails: registra o clique e redireciona. Só segue para o destino se a assinatura conferir
// (ninguém usa o site para redirecionar para outro lugar).
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const id = p.get("i") ?? "";
  const botao = (p.get("b") ?? "").slice(0, 40);
  const destino = p.get("u") ?? "";
  if (!id || !/^https?:\/\//.test(destino) || !cliqueConfere(id, botao, destino, p.get("s") ?? ""))
    return Response.redirect(siteUrl, 302);
  await registrarClique(id, botao, destino).catch((e) => console.error("Clique não registrado", e));
  return Response.redirect(destino, 302);
}
