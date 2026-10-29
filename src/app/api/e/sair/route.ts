import { descadastrar, sairConfere } from "@/lib/envios";

// Descadastro dos e-mails. GET mostra a confirmação (leitores de e-mail abrem links sozinhos, então
// descadastrar só no POST). O POST também atende o "cancelar inscrição" do Gmail (List-Unsubscribe One-Click).

const pagina = (titulo: string, texto: string, form = "") =>
  new Response(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${titulo}</title></head>
<body style="margin:0;background:#f3f1ea;font-family:Inter,'Segoe UI',Arial,sans-serif;color:#0d1a14;display:grid;place-items:center;min-height:100vh;padding:16px">
<main style="max-width:440px;background:#fff;border-radius:24px;padding:32px;text-align:center">
<p style="margin:0 0 12px;font-size:24px;font-weight:800;letter-spacing:-.04em">soares<span style="color:#d9c28e">▍</span></p>
<h1 style="font-size:22px;margin:0 0 10px">${titulo}</h1><p style="color:#56615a;line-height:1.6;margin:0">${texto}</p>${form}
<p style="margin:20px 0 0"><a href="/" style="color:#17784a;font-weight:700">Voltar ao site</a></p></main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );

const escapar = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const email = p.get("e") ?? "";
  const s = p.get("s") ?? "";
  if (!email || !sairConfere(email, s)) return pagina("Link inválido", "Esse link de descadastro não confere. Responda qualquer e-mail meu pedindo para sair que eu removo na hora.");
  return pagina(
    "Parar de receber e-mails?",
    `Você não vai mais receber e-mails em <strong>${escapar(email)}</strong>.`,
    `<form method="post" style="margin:22px 0 0"><button style="background:#0b1d15;color:#fff;border:0;border-radius:999px;padding:14px 26px;font-size:16px;font-weight:700;cursor:pointer">Confirmar descadastro</button></form>`,
  );
}

export async function POST(request: Request) {
  const p = new URL(request.url).searchParams;
  const email = p.get("e") ?? "";
  if (!email || !sairConfere(email, p.get("s") ?? "")) return pagina("Link inválido", "Esse link de descadastro não confere.");
  await descadastrar(email);
  return pagina("Pronto, você saiu da lista", "Não vou mais mandar e-mails para esse endereço. Se mudar de ideia, é só me chamar no WhatsApp.");
}
