import "server-only";
import { randomBytes } from "node:crypto";
import { comando, gravarValor, lerValor, ondeGuarda } from "./armazem";
import { siteUrl } from "./config";

// Link curto para mandar ao cliente: soareslab.com/p/jackbulls-burger-x7k2 em vez do link assinado gigante.
// O curto só guarda o caminho do link assinado e redireciona para ele (rota /p/[codigo]); a assinatura
// continua protegendo os valores, então trocar letras do curto só leva a "não encontrado".

const CHAVE = "links-curtos";

const paraSlug = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 3)
    .join("-")
    .slice(0, 28);

export async function encurtar(link: string, nome = "") {
  const url = new URL(link);
  const destino = url.pathname + url.search; // só caminhos do próprio site
  const sufixo = randomBytes(3).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "x").slice(0, 4);
  const codigo = [paraSlug(nome), sufixo].filter(Boolean).join("-");
  if (ondeGuarda() === "redis") await comando("HSET", CHAVE, codigo, destino);
  else if (ondeGuarda() === "arquivo") await gravarValor(CHAVE, { ...(await lerValor<Record<string, string>>(CHAVE, {})), [codigo]: destino });
  else return link; // sem onde guardar, manda o link longo mesmo
  return `${siteUrl}/p/${codigo}`;
}

export async function destinoDoCurto(codigo: string) {
  if (!/^[a-z0-9-]{4,40}$/.test(codigo)) return null;
  const destino =
    ondeGuarda() === "redis" ? await comando<string | null>("HGET", CHAVE, codigo) : (await lerValor<Record<string, string>>(CHAVE, {}))[codigo];
  return destino && destino.startsWith("/") && !destino.startsWith("//") ? destino : null;
}
