"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Mostra um site em tamanho real (1280px no computador, 390px no celular) reduzido para caber
// no espaço, como uma captura de tela viva. Os modelos usam container queries, então com 390px
// eles aparecem exatamente como no celular.
export function Miniatura({
  children,
  className = "",
  largura = 1280,
  altura = 800,
}: {
  children: ReactNode;
  className?: string;
  largura?: number;
  altura?: number;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.25);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / largura);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [largura]);

  return (
    <div ref={caixa} className={`relative overflow-hidden ${className}`} style={{ aspectRatio: `${largura} / ${altura}` }} aria-hidden>
      <div
        inert
        className="pointer-events-none absolute top-0 left-0 origin-top-left select-none"
        style={{ width: largura, height: altura, transform: `scale(${escala})` }}
      >
        {children}
      </div>
    </div>
  );
}
