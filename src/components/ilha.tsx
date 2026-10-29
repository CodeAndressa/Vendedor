"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";

// Notificação no estilo "ilha" (inspirada no notch do iPhone): uma pílula preta no topo
// que se expande com a mensagem e se recolhe sozinha.

type Aviso = { id: number; titulo: string; detalhe?: string };
type Contexto = { avisar: (titulo: string, detalhe?: string) => void };

const IlhaContexto = createContext<Contexto>({ avisar: () => {} });

export function useIlha() {
  return useContext(IlhaContexto);
}

export function IlhaProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduzir = useReducedMotion();

  const avisar = useCallback((titulo: string, detalhe?: string) => {
    clearTimeout(timer.current);
    setAviso({ id: Date.now(), titulo, detalhe });
    timer.current = setTimeout(() => setAviso(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <IlhaContexto.Provider value={{ avisar }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-4" aria-live="polite">
        <AnimatePresence>
          {aviso && (
            <motion.div
              key="ilha"
              layout
              initial={reduzir ? { opacity: 0 } : { width: 120, height: 36, opacity: 0, borderRadius: 999 }}
              animate={reduzir ? { opacity: 1 } : { width: "auto", height: "auto", opacity: 1, borderRadius: 28 }}
              exit={reduzir ? { opacity: 0 } : { width: 120, height: 36, opacity: 0, borderRadius: 999 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="overflow-hidden bg-black text-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]"
            >
              <motion.div
                key={aviso.id}
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.08, duration: 0.25 }}
                className="flex items-center gap-3 py-2.5 pr-5 pl-2.5 whitespace-nowrap"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime text-forest">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                <span className="text-sm leading-tight">
                  <span className="block font-semibold">{aviso.titulo}</span>
                  {aviso.detalhe && <span className="text-white/60">{aviso.detalhe}</span>}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </IlhaContexto.Provider>
  );
}
