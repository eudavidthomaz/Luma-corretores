import { useMemo } from "react";
import { Tables } from "@/integrations/supabase/types";

export interface LeadFilters {
  search: string;
  heat: "cold" | "warm" | "hot" | "all";
  status: string;
  category: string;
}

export const defaultLeadFilters: LeadFilters = {
  search: "",
  heat: "all",
  status: "all",
  category: "all",
};

type Lead = Tables<"leads">;

export function useFilteredLeads(
  leads: Lead[] | undefined,
  filters: LeadFilters
): Lead[] {
  return useMemo(() => {
    if (!leads) return [];

    return leads.filter((lead) => {
      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matches =
          lead.name?.toLowerCase().includes(query) ||
          lead.whatsapp?.includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.service_type?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Heat filter
      if (filters.heat && filters.heat !== "all") {
        const leadHeat = lead.heat_level || "cold";
        if (leadHeat !== filters.heat) return false;
      }

      // Status filter
      if (filters.status && filters.status !== "all") {
        if (lead.status !== filters.status) return false;
      }

      // Category filter
      if (filters.category && filters.category !== "all") {
        if (lead.interest_category_id !== filters.category) return false;
      }

      return true;
    });
  }, [leads, filters]);
}
