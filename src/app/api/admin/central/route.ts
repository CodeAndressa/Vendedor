import { semAcesso, semCache } from "@/lib/admin";
import { ondeGuarda } from "@/lib/armazem";
import { lerDias, ultimosDias, visitantesNoPeriodo } from "@/lib/metricas";

// Indicadores do funil no período: robôs de IA, visitas, engajamento, páginas, origens e conversões.
export async function GET(request: Request) {
  const negado = semAcesso(request);
  if (negado) return negado;
  const n = Math.min(Math.max(Number(new URL(request.url).searchParams.get("dias")) || 30, 1), 365);
  const dias = ultimosDias(n);
  const [porDia, visitantes] = await Promise.all([lerDias(dias), visitantesNoPeriodo(dias)]);

  const total: Record<string, number> = {};
  for (const d of porDia) for (const [k, v] of Object.entries(d.c)) total[k] = (total[k] ?? 0) + v;
  const grupo = (prefixo: string) =>
    Object.entries(total)
      .filter(([k]) => k.startsWith(`${prefixo}|`))
      .map(([k, v]) => ({ nome: k.slice(prefixo.length + 1), valor: v }))
      .sort((a, b) => b.valor - a.valor);
  const v = (k: string) => total[k] ?? 0;
  const tempoPorPagina = Object.fromEntries(grupo("pag_tempo").map((p) => [p.nome, p.valor]));

  return Response.json(
    {
      ok: true,
      onde: ondeGuarda(),
      dias: n,
      serie: porDia.map((d) => ({ dia: d.dia, visitas: d.c.visitas ?? 0, visitantes: d.visitantes, robosIA: d.c.robos_ia ?? 0 })),
      resumo: {
        visitas: v("visitas"),
        visitantes,
        robosIA: v("robos_ia"),
        robos: v("robos"),
        visitasIA: v("ia_visitas"),
        engajadas: v("engajadas"),
        medicoes: v("tempo_n"),
        tempoMedio: v("tempo_n") ? Math.round(v("tempo_total") / v("tempo_n")) : 0,
        rolagemMedia: v("tempo_n") ? Math.round(v("rolagem_total") / v("tempo_n")) : 0,
      },
      funil: [
        { etapa: "Robôs de IA leram o site", valor: v("robos_ia") },
        { etapa: "Visitas", valor: v("visitas") },
        { etapa: "Visitantes únicos", valor: visitantes },
        { etapa: "Visitas engajadas", valor: v("engajadas") },
        { etapa: "Cliques no WhatsApp", valor: v("evento|whatsapp") },
        { etapa: "Pediram contato (leads)", valor: v("evento|lead") },
        { etapa: "Abriram a proposta", valor: v("evento|proposta_aberta") },
        { etapa: "Foram pagar", valor: v("evento|checkout") },
        { etapa: "Pagamentos confirmados", valor: v("asaas|PAYMENT_RECEIVED") + v("asaas|PAYMENT_CONFIRMED") },
      ],
      paginas: grupo("pag").map((p) => ({ ...p, tempoMedio: p.valor ? Math.round((tempoPorPagina[p.nome] ?? 0) / p.valor) : 0 })),
      origens: grupo("origem"),
      fontesIA: grupo("ia"),
      robos: grupo("robo"),
      paginasLidasPorIA: grupo("robo_pag").slice(0, 10),
      eventos: {
        whatsapp: v("evento|whatsapp"),
        analise: v("evento|cta_analise"),
        chat: v("evento|chat"),
        leads: v("evento|lead"),
        propostasAbertas: v("evento|proposta_aberta"),
        checkouts: v("evento|checkout"),
      },
    },
    { headers: semCache },
  );
}
