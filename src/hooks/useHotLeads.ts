import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HotLead {
  id: string;
  name: string | null;
  heat_level: string | null;
  status: string;
  service_type: string | null;
  updated_at: string;
}

export function useHotLeads(profileId?: string, limit = 3) {
  return useQuery({
    queryKey: ["hot-leads", profileId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, heat_level, status, service_type, updated_at")
        .eq("profile_id", profileId!)
        .in("heat_level", ["hot", "warm"])
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as HotLead[];
    },
    enabled: !!profileId,
  });
}
