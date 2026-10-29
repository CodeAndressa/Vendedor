"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

// Altura do cabeçalho fixo: as âncoras param logo abaixo dele.
const DESLOCAMENTO = 88;

// Instância atual da rolagem suave (cada página que usa <Efeitos /> cria a sua).
let lenisAtual: Lenis | null = null;

// Rolagem suave, botões magnéticos e holofote nos cartões escuros. Desliga tudo com "reduzir movimento".
export function Efeitos() {
  useEffect(() => {
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const toque = matchMedia("(pointer: coarse)").matches;
    if (reduzir) return;

    const lenis = toque
      ? null
      : new Lenis({ duration: 1.15, anchors: { offset: -DESLOCAMENTO }, prevent: (no) => no.closest?.("[data-lenis-prevent]") !== null });
    lenisAtual = lenis;
    let quadro = 0;
    const rodar = (t: number) => {
      lenis?.raf(t);
      quadro = requestAnimationFrame(rodar);
    };
    if (lenis) quadro = requestAnimationFrame(rodar);

    // botões magnéticos: o botão acompanha um pouco o mouse
    const mover = (e: PointerEvent) => {
      if (toque) return;
      const alvo = (e.target as Element | null)?.closest?.<HTMLElement>("[data-magnetico]");
      document.querySelectorAll<HTMLElement>("[data-magnetico].puxado").forEach((b) => {
        if (b !== alvo) {
          b.classList.remove("puxado");
          b.style.transform = "";
        }
      });
      if (alvo) {
        const r = alvo.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.32;
        alvo.classList.add("puxado");
        alvo.style.transform = `translate(${x}px, ${y}px)`;
      }
      // holofote: a luz segue o mouse dentro do cartão
      const cartao = (e.target as Element | null)?.closest?.<HTMLElement>("[data-holofote]");
      if (cartao) {
        const r = cartao.getBoundingClientRect();
        cartao.style.setProperty("--hx", `${e.clientX - r.left}px`);
        cartao.style.setProperty("--hy", `${e.clientY - r.top}px`);
      }
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      cancelAnimationFrame(quadro);
      lenis?.destroy();
      if (lenisAtual === lenis) lenisAtual = null;
    };
  }, []);
  return null;
}

// Rola na hora (sem animação), avisando a rolagem suave para ela não "puxar" de volta.
function rolarPara(y: number) {
  const topo = Math.max(0, Math.round(y));
  if (lenisAtual) lenisAtual.scrollTo(topo, { immediate: true, force: true });
  window.scrollTo({ top: topo, left: 0, behavior: "instant" });
}

// Vai até a seção da âncora com o deslocamento do cabeçalho. A página pode mudar de altura logo
// depois de abrir (vitrine fixa, imagens), então confere a posição por um instante e corrige,
// a menos que a pessoa comece a rolar por conta própria.
function irParaAncora(id: string) {
  let parar = false;
  const interromper = () => {
    parar = true;
  };
  const eventos = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  eventos.forEach((e) => window.addEventListener(e, interromper, { once: true, passive: true }));
  const inicio = performance.now();
  const passo = () => {
    if (parar) return;
    const alvo = document.getElementById(id);
    if (alvo) {
      const destino = alvo.getBoundingClientRect().top + window.scrollY - DESLOCAMENTO;
      if (Math.abs(destino - window.scrollY) > 2) rolarPara(destino);
    }
    if (performance.now() - inicio < 5000) requestAnimationFrame(passo);
    else eventos.forEach((e) => window.removeEventListener(e, interromper));
  };
  requestAnimationFrame(passo);
}

// Ao trocar de página: volta ao topo na hora, ou vai até a âncora (ex.: /#orcamento vindo de outra página).
// No "voltar" e "avançar" do navegador, deixa a posição que o próprio Next restaura.
export function RolagemDaNavegacao() {
  const caminho = usePathname();
  const anterior = useRef<string | null>(null);
  const historico = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const marcar = () => {
      historico.current = true;
      // "voltar" que só troca a âncora não muda a página: não deixa a marca presa para a próxima navegação
      clearTimeout(timer);
      timer = setTimeout(() => {
        historico.current = false;
      }, 600);
    };
    // Âncora na mesma página sem a rolagem suave (celular): o Next rola na hora, mas a página ainda pode
    // mudar de altura logo depois. Confere e corrige a posição. Com a rolagem suave, ela cuida disso.
    const clique = (e: MouseEvent) => {
      // o <Link> do Next chama preventDefault e faz a navegação ele mesmo, então não dá para olhar defaultPrevented
      if (lenisAtual || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("data-rolagem-propria")) return;
      const destino = new URL(link.href, location.href);
      if (destino.origin !== location.origin || destino.pathname !== location.pathname || !destino.hash) return;
      const id = decodeURIComponent(destino.hash.slice(1));
      setTimeout(() => irParaAncora(id), 0);
    };
    window.addEventListener("popstate", marcar);
    document.addEventListener("click", clique);
    return () => {
      window.removeEventListener("popstate", marcar);
      document.removeEventListener("click", clique);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const primeira = anterior.current === null;
    const mudou = anterior.current !== caminho;
    anterior.current = caminho;
    if (!mudou) return;
    if (historico.current) {
      historico.current = false;
      return;
    }
    const ancora = decodeURIComponent(location.hash.slice(1));
    if (ancora) irParaAncora(ancora);
    else if (!primeira) rolarPara(0);
  }, [caminho]);

  return null;
}

// Volta ao topo com a rolagem suave (usado quando a pessoa clica no item da página em que já está).
export function rolarAoTopo() {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenisAtual) lenisAtual.scrollTo(0, { immediate: reduzir });
  else window.scrollTo({ top: 0, behavior: reduzir ? "instant" : "smooth" });
}

// Rola suave até um elemento, parando logo abaixo do cabeçalho (passa pela rolagem suave quando ela existe).
export function rolarAte(el: HTMLElement | null) {
  if (!el) return;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenisAtual) lenisAtual.scrollTo(el, { offset: -DESLOCAMENTO, immediate: reduzir });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - DESLOCAMENTO, behavior: reduzir ? "instant" : "smooth" });
}
