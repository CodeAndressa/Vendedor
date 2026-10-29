import { pixelConfere, registrarAbertura } from "@/lib/envios";

// Pixel de abertura dos e-mails (imagem 1x1 transparente).
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const id = p.get("i") ?? "";
  if (id && pixelConfere(id, p.get("s") ?? "")) await registrarAbertura(id).catch(() => {});
  return new Response(GIF, { headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, max-age=0" } });
}
