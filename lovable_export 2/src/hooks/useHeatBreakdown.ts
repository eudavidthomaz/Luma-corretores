import { useMemo } from "react";
import { Tables } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;

export interface HeatBreakdown {
  cold: number;
  warm: number;
  hot: number;
  total: number;
}

export function useHeatBreakdown(leads: Lead[] | undefined): HeatBreakdown {
  return useMemo(() => {
    if (!leads) return { cold: 0, warm: 0, hot: 0, total: 0 };

    const cold = leads.filter((l) => !l.heat_level || l.heat_level === "cold").length;
    const warm = leads.filter((l) => l.heat_level === "warm").length;
    const hot = leads.filter((l) => l.heat_level === "hot").length;

    return {
      cold,
      warm,
      hot,
      total: leads.length,
    };
  }, [leads]);
}
