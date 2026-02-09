import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  conversionFromPrevious: number | null;
}

const FUNNEL_PHASES = [
  { id: "abertura", name: "Abertura" },
  { id: "descoberta", name: "Descoberta" },
  { id: "qualificacao", name: "Qualificação" },
  { id: "fechamento", name: "Fechamento" },
] as const;

export function useFunnelStats(profileId?: string) {
  return useQuery({
    queryKey: ["funnel-stats", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data: leads, error } = await supabase
        .from("leads")
        .select("conversation_phase, status, heat_level")
        .eq("profile_id", profileId);

      if (error) throw error;

      const phaseCounts: Record<string, number> = {};
      FUNNEL_PHASES.forEach((phase) => {
        phaseCounts[phase.id] = 0;
      });

      leads?.forEach((lead) => {
        const phase = lead.conversation_phase || "abertura";
        if (phaseCounts[phase] !== undefined) {
          phaseCounts[phase]++;
        }
      });

      const total = leads?.length || 0;

      const stages: FunnelStage[] = FUNNEL_PHASES.map((phase, index) => {
        const count = phaseCounts[phase.id];
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        let conversionFromPrevious: number | null = null;
        if (index > 0) {
          const previousCount = phaseCounts[FUNNEL_PHASES[index - 1].id];
          conversionFromPrevious = previousCount > 0 
            ? (count / previousCount) * 100 
            : 0;
        }

        return {
          id: phase.id,
          name: phase.name,
          count,
          percentage,
          conversionFromPrevious,
        };
      });

      // Heat level breakdown
      const heatBreakdown = {
        cold: leads?.filter((l) => l.heat_level === "cold" || !l.heat_level).length || 0,
        warm: leads?.filter((l) => l.heat_level === "warm").length || 0,
        hot: leads?.filter((l) => l.heat_level === "hot").length || 0,
      };

      // Status breakdown
      const statusBreakdown = {
        novo: leads?.filter((l) => l.status === "novo").length || 0,
        qualificando: leads?.filter((l) => l.status === "qualificando").length || 0,
        engajado: leads?.filter((l) => l.status === "engajado").length || 0,
        em_contato: leads?.filter((l) => l.status === "em_contato").length || 0,
        proposta_enviada: leads?.filter((l) => l.status === "proposta_enviada").length || 0,
        pronto: leads?.filter((l) => l.status === "pronto").length || 0,
        convertido: leads?.filter((l) => l.status === "convertido").length || 0,
        perdido: leads?.filter((l) => l.status === "perdido").length || 0,
      };

      return {
        stages,
        total,
        heatBreakdown,
        statusBreakdown,
      };
    },
    enabled: !!profileId,
  });
}
