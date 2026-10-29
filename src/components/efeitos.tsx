"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Rolagem suave, botões magnéticos e holofote nos cartões escuros. Desliga tudo com "reduzir movimento".
export function Efeitos() {
  useEffect(() => {
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const toque = matchMedia("(pointer: coarse)").matches;
    if (reduzir) return;

    const lenis = toque ? null : new Lenis({ duration: 1.15, anchors: { offset: -88 }, prevent: (no) => no.closest?.("[data-lenis-prevent]") !== null });
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
    };
  }, []);
  return null;
}
