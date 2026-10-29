"use client";

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

// Título que entra palavra por palavra, cada uma subindo por trás de uma máscara.
// Mantém <em>, <span> e quebras do texto original; com "reduzir movimento" mostra o texto parado.
export function PalavrasSobem({ children, atraso = 0, aoCarregar = false }: { children: ReactNode; atraso?: number; aoCarregar?: boolean }) {
  const reduzir = useReducedMotion();
  if (reduzir) return <>{children}</>;
  const contador = { i: 0 };

  const palavra = (texto: string, chave: string) => {
    const i = contador.i++;
    const anima = aoCarregar ? { animate: { y: "0%" } } : { whileInView: { y: "0%" }, viewport: { once: true, margin: "-40px" } };
    return (
      <span key={chave} className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
        <motion.span
          className="inline-block will-change-transform"
          initial={{ y: "108%" }}
          {...anima}
          transition={{ duration: 0.85, delay: atraso + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
        >
          {texto}
        </motion.span>
      </span>
    );
  };

  const montar = (no: ReactNode, prefixo: string): ReactNode =>
    Children.toArray(no).map((filho, k) => {
      const chave = `${prefixo}-${k}`;
      if (typeof filho === "string" || typeof filho === "number") {
        return String(filho)
          .split(/(\s+)/)
          .map((parte, j) => (/^\s+$/.test(parte) ? " " : parte ? palavra(parte, `${chave}-${j}`) : null));
      }
      if (isValidElement<{ children?: ReactNode }>(filho)) {
        return cloneElement(filho as ReactElement<{ children?: ReactNode }>, { key: chave }, montar(filho.props.children, chave));
      }
      return filho;
    });

  return <>{montar(children, "p")}</>;
}
