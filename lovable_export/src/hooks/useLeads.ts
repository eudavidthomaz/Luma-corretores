import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";
import { setCache, getCache, addPendingSync } from "@/lib/offlineDB";
import { useOnlineStatus } from "./useOnlineStatus";

type Lead = Tables<"leads">;
type LeadInsert = TablesInsert<"leads">;
type LeadUpdate = TablesUpdate<"leads">;

const CACHE_KEY_PREFIX = "leads";

export function useLeads(profileId?: string) {
  const { isOnline } = useOnlineStatus();
  
  return useQuery({
    queryKey: ["leads", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const cacheKey = `${CACHE_KEY_PREFIX}:${profileId}`;
      
      // If offline, return cached data
      if (!isOnline) {
        const cached = await getCache<Lead[]>(cacheKey);
        if (cached) return cached.data;
        throw new Error("Sem conexão - dados não disponíveis offline");
      }
      
      // Online: fetch from database
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Cache for offline use
      await setCache(cacheKey, data, profileId);
      
      return data as Lead[];
    },
    enabled: !!profileId,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lead: LeadInsert) => {
      const { data, error } = await supabase
        .from("leads")
        .insert(lead)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const { isOnline } = useOnlineStatus();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: LeadUpdate & { id: string }) => {
      if (!isOnline) {
        // Queue for later sync
        await addPendingSync("leads", "update", { id, ...updates });
        return { id, ...updates } as Lead;
      }
      
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { isOnline } = useOnlineStatus();
  
  return useMutation({
    mutationFn: async (leadId: string) => {
      if (!isOnline) {
        // Queue for later sync
        await addPendingSync("leads", "delete", { id: leadId });
        return;
      }
      
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useLeadStats(profileId?: string) {
  const { isOnline } = useOnlineStatus();
  
  return useQuery({
    queryKey: ["lead-stats", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const cacheKey = `lead-stats:${profileId}`;
      
      // If offline, return cached data
      if (!isOnline) {
        const cached = await getCache<{ total: number; newLeads: number; converted: number; conversionRate: string }>(cacheKey);
        if (cached) return cached.data;
        return null;
      }
      
      const { data: leads, error } = await supabase
        .from("leads")
        .select("status, created_at")
        .eq("profile_id", profileId);
      
      if (error) throw error;
      
      const total = leads?.length || 0;
      const newLeads = leads?.filter(l => l.status === "novo").length || 0;
      const converted = leads?.filter(l => l.status === "convertido").length || 0;
      const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0";
      
      const stats = {
        total,
        newLeads,
        converted,
        conversionRate,
      };
      
      // Cache for offline use
      await setCache(cacheKey, stats, profileId);
      
      return stats;
    },
    enabled: !!profileId,
  });
}

// Status display helpers
export const leadStatusLabels: Record<Enums<"lead_status">, string> = {
  novo: "Novo",
  qualificando: "Qualificando",
  engajado: "Engajado",
  em_contato: "Em contato",
  proposta_enviada: "Proposta enviada",
  pronto: "Pronto",
  convertido: "Convertido",
  perdido: "Perdido",
};

export const heatLevelLabels: Record<string, string> = {
  cold: "Frio",
  warm: "Morno",
  hot: "Quente",
};

export const heatLevelColors: Record<string, string> = {
  cold: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  warm: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hot: "bg-red-500/20 text-red-400 border-red-500/30",
};
