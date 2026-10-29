import { siteUrl } from "@/lib/config";
import { destinoDoCurto } from "@/lib/link-curto";

// Link curto de proposta (soareslab.com/p/negocio-x7k2): leva ao link assinado guardado.
export async function GET(_request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const destino = await destinoDoCurto(codigo).catch(() => null);
  return Response.redirect(`${siteUrl}${destino ?? "/"}`, 302);
}
