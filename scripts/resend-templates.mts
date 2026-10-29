// Cria ou atualiza no Resend os templates de src/lib/email-modelos.ts e publica.
// Uso: node scripts/resend-templates.mts   (lê RESEND_API_KEY do .env.local; a chave precisa ser "Full access")
// Atenção: sobrescreve o que foi editado no painel do Resend. Editou lá? Copie a mudança para o email-modelos.ts antes.
import { readFileSync } from "node:fs";
import { modelos } from "../src/lib/email-modelos.ts";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const chave = process.env.RESEND_API_KEY ?? env.match(/^RESEND_API_KEY=(.*)$/m)?.[1]?.trim().replace(/^"|"$/g, "");
if (!chave) throw new Error("RESEND_API_KEY não encontrada");

const api = async (metodo: string, rota: string, corpo?: object) => {
  const r = await fetch(`https://api.resend.com${rota}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  return { ok: r.ok, status: r.status, json: await r.json().catch(() => ({})) };
};

for (const [alias, m] of Object.entries(modelos)) {
  const dados = {
    name: m.nome,
    alias,
    subject: m.assunto,
    html: m.html,
    variables: m.variaveis.map((v) => ({ ...v, type: "string" })),
  };
  const existe = await api("GET", `/templates/${alias}`);
  const salvo = existe.ok ? await api("PATCH", `/templates/${alias}`, dados) : await api("POST", "/templates", dados);
  if (!salvo.ok) {
    console.log("FALHOU", alias, salvo.status, JSON.stringify(salvo.json));
    continue;
  }
  const pub = await api("POST", `/templates/${alias}/publish`);
  console.log(pub.ok ? "ok    " : "FALHOU", alias, existe.ok ? "(atualizado)" : "(criado)", pub.ok ? "" : JSON.stringify(pub.json));
}
