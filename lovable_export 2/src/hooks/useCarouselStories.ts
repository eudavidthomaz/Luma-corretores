import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CarouselStory {
  id: string;
  title: string;
  category_id: string | null;
  cover_image_url: string | null;
}

export function useCarouselStories(profileId?: string) {
  const query = useQuery({
    queryKey: ["carousel-stories", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from("stories")
        .select("id, title, category_id, cover_image_url")
        .eq("profile_id", profileId)
        .eq("is_published", true)
        .eq("show_in_carousel", true)
        .order("views_count", { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as CarouselStory[];
    },
    enabled: !!profileId,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
