// Redireciona (308) domínios extras do projeto "vendedor" na Vercel para o domínio principal.
// Só mexe em domínios que já estão no projeto; não cria, não apaga e não toca em DNS.
// Uso: node scripts/vercel-redirecionar.mjs soareslab.vercel.app www.soareslab.com
//      node scripts/vercel-redirecionar.mjs --desfazer www.soareslab.com   (tira o redirecionamento)
// Usa o login do CLI da Vercel desta máquina (vercel login).
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PRINCIPAL = "soareslab.com";
const projeto = JSON.parse(readFileSync(new URL("../.vercel/project.json", import.meta.url), "utf8"));
const auth = JSON.parse(readFileSync(join(process.env.APPDATA ?? "", "com.vercel.cli/Data/auth.json"), "utf8"));
const base = `https://api.vercel.com/v9/projects/${projeto.projectId}/domains`;
const q = `?teamId=${projeto.orgId}`;
const h = { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" };

const args = process.argv.slice(2);
const desfazer = args.includes("--desfazer");
const alvos = args.filter((a) => !a.startsWith("--"));
if (!alvos.length) throw new Error("Diga quais domínios redirecionar.");

const lista = await (await fetch(base + q, { headers: h })).json();
const existentes = new Set((lista.domains ?? []).map((d) => d.name));

for (const dominio of alvos) {
  if (dominio === PRINCIPAL) {
    console.log("pulado ", dominio, "(é o domínio principal)");
    continue;
  }
  if (!existentes.has(dominio)) {
    console.log("pulado ", dominio, "(não está no projeto)");
    continue;
  }
  const corpo = desfazer ? { redirect: null, redirectStatusCode: null } : { redirect: PRINCIPAL, redirectStatusCode: 308 };
  const r = await fetch(`${base}/${dominio}${q}`, { method: "PATCH", headers: h, body: JSON.stringify(corpo) });
  const j = await r.json();
  console.log(r.ok ? "ok     " : "FALHOU ", dominio, r.ok ? (j.redirect ? `-> ${j.redirect} (${j.redirectStatusCode})` : "sem redirecionamento") : j.error?.message ?? r.status);
}
