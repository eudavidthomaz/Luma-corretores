import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentProposal {
  id: string;
  title: string;
  status: string;
  total_amount: number | null;
  updated_at: string | null;
  lead: { name: string | null } | null;
}

export function useRecentProposals(profileId?: string, limit = 3) {
  return useQuery({
    queryKey: ["recent-proposals", profileId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("id, title, status, total_amount, updated_at, lead:leads(name)")
        .eq("profile_id", profileId!)
        .neq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as RecentProposal[];
    },
    enabled: !!profileId,
  });
}
