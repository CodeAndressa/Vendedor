import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { identificarRobo, somar } from "@/lib/metricas";

// Conta os robôs das IAs e das buscas que leem o site (ChatGPT, Perplexity, Claude, Google, Bing...).
// O registro roda depois da resposta (waitUntil), então não atrasa a página.
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const robo = identificarRobo(request.headers.get("user-agent") ?? "");
  if (robo) {
    const pagina = request.nextUrl.pathname.slice(0, 80);
    event.waitUntil(
      somar({
        robos: 1,
        [`robo|${robo.nome}`]: 1,
        ...(robo.tipo === "ia" ? { robos_ia: 1, [`robo_pag|${pagina}`]: 1 } : {}),
      }).catch(() => {}),
    );
  }
  return NextResponse.next();
}

export const config = {
  // só páginas e arquivos que as IAs leem; fora estáticos, imagens e rotas internas
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|portfolio/|admin).*)"],
};
