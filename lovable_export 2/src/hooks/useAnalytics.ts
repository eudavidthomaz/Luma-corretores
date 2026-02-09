import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { setCache, getCache } from "@/lib/offlineDB";
import { useOnlineStatus } from "./useOnlineStatus";

// Generate a unique visitor hash based on browser fingerprint
function getVisitorHash(): string {
  const stored = localStorage.getItem("luma_visitor_hash");
  if (stored) return stored;
  
  const hash = crypto.randomUUID();
  localStorage.setItem("luma_visitor_hash", hash);
  return hash;
}

// Track a story view
export function useTrackStoryView() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ storyId, profileId }: { storyId: string; profileId: string }) => {
      const visitorHash = getVisitorHash();
      
      // Check if this visitor already viewed this story today
      const today = startOfDay(new Date());
      const { data: existingView } = await supabase
        .from("story_views")
        .select("id")
        .eq("story_id", storyId)
        .eq("visitor_hash", visitorHash)
        .gte("viewed_at", today.toISOString())
        .maybeSingle();
      
      // Only insert if not already viewed today
      if (!existingView) {
        const { error } = await supabase
          .from("story_views")
          .insert({
            story_id: storyId,
            profile_id: profileId,
            visitor_hash: visitorHash,
          });
        
        if (error) throw error;
        
        // Also increment the views_count on the story
        const { data: story } = await supabase
          .from("stories")
          .select("views_count")
          .eq("id", storyId)
          .single();
        
        if (story) {
          await supabase
            .from("stories")
            .update({ views_count: (story.views_count || 0) + 1 })
            .eq("id", storyId);
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-views"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

// Get views data for dashboard chart (last 7 days)
export function useStoryViewsChart(profileId: string | undefined) {
  const { isOnline } = useOnlineStatus();
  
  return useQuery({
    queryKey: ["story-views-chart", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const cacheKey = `story-views-chart:${profileId}`;
      
      // If offline, return cached data
      if (!isOnline) {
        const cached = await getCache<{ name: string; fullDate: string; views: number }[]>(cacheKey);
        if (cached) return cached.data;
        return [];
      }
      
      const days = 7;
      const results = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();
        
        const { count } = await supabase
          .from("story_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", profileId)
          .gte("viewed_at", dayStart)
          .lte("viewed_at", dayEnd);
        
        results.push({
          name: format(date, "EEE", { locale: ptBR }).charAt(0).toUpperCase() + format(date, "EEE", { locale: ptBR }).slice(1, 3),
          fullDate: format(date, "dd/MM"),
          views: count || 0,
        });
      }
      
      // Cache for offline use
      await setCache(cacheKey, results, profileId);
      
      return results;
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get total views for a profile
export function useTotalViews(profileId: string | undefined) {
  const { isOnline } = useOnlineStatus();
  
  return useQuery({
    queryKey: ["total-views", profileId],
    queryFn: async () => {
      if (!profileId) return 0;
      
      const cacheKey = `total-views:${profileId}`;
      
      // If offline, return cached data
      if (!isOnline) {
        const cached = await getCache<number>(cacheKey);
        if (cached) return cached.data;
        return 0;
      }
      
      const { count } = await supabase
        .from("story_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId);
      
      const total = count || 0;
      
      // Cache for offline use
      await setCache(cacheKey, total, profileId);
      
      return total;
    },
    enabled: !!profileId,
  });
}
