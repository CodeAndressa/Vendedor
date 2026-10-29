import { ImageResponse } from "next/og";
import { config, precos, reais } from "@/lib/config";

// Imagem que aparece quando o link do site é compartilhado no WhatsApp, Instagram etc.
export const alt = "Site profissional em 7 dias a partir de R$ 997";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Imagem() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0A2A1C",
          color: "#F5F8F2",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
          <span>{config.marca}</span>
          <span style={{ color: "#B8F26B" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>Seu site profissional</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.1, letterSpacing: -3, color: "#B8F26B" }}>no ar em 7 dias.</div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 30 }}>
          <span style={{ background: "#B8F26B", color: "#0A2A1C", padding: "10px 24px", borderRadius: 999, fontWeight: 700 }}>
            {`a partir de ${reais(precos.site)}`}
          </span>
          <span style={{ padding: "10px 0", opacity: 0.75 }}>Domínio incluso · primeira versão em 48h</span>
        </div>
      </div>
    ),
    size,
  );
}
