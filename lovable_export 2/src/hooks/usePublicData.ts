import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, Enums } from "@/integrations/supabase/types";

type Story = Tables<"stories"> & {
  profiles: { business_name: string; avatar_url: string | null } | null;
  story_chapters: Tables<"story_chapters">[];
};

type Profile = Tables<"profiles">;

export function usePublicProfile(slug?: string, userId?: string) {
  return useQuery({
    queryKey: ["public-profile", slug, userId],
    queryFn: async () => {
      // Priority 1: Search by slug
      if (slug) {
        const { data: bySlug, error: slugError } = await supabase
          .from("profiles")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        
        if (slugError) throw slugError;
        if (bySlug) return bySlug as Profile;
        
        // Fallback: try to find by ID (for backwards compatibility)
        const { data: byId, error: idError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", slug)
          .maybeSingle();
        
        if (idError) throw idError;
        return byId as Profile | null;
      }
      
      // Priority 2: Search by userId (logged in user viewing own Luma)
      if (userId) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        
        if (error) throw error;
        return data as Profile | null;
      }
      
      // No slug and no userId = return null (will trigger redirect)
      return null;
    },
    enabled: !!(slug || userId),
  });
}

export function usePublishedStoriesByCategory(profileId?: string, categoryId?: string) {
  return useQuery({
    queryKey: ["published-stories", profileId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from("stories")
        .select(`
          *,
          profiles (business_name, avatar_url),
          story_chapters (*)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (profileId) {
        query = query.eq("profile_id", profileId);
      }
      
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Story[];
    },
  });
}

export function useRandomPublishedStory(profileId?: string) {
  return useQuery({
    queryKey: ["random-story", profileId],
    queryFn: async () => {
      let query = supabase
        .from("stories")
        .select(`
          *,
          profiles (business_name, avatar_url),
          story_chapters (*)
        `)
        .eq("is_published", true)
        .limit(5);
      
      if (profileId) {
        query = query.eq("profile_id", profileId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      // Return a random story
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex] as Story;
    },
  });
}
