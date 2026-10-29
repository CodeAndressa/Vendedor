import type { Metadata } from "next";
import { PainelAdmin } from "@/components/admin/painel";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default function PaginaAdmin() {
  return <PainelAdmin />;
}
