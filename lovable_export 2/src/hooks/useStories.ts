import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Story = Tables<"stories">;
type StoryInsert = TablesInsert<"stories">;
type StoryUpdate = TablesUpdate<"stories">;
type StoryChapter = Tables<"story_chapters">;
type StoryChapterInsert = TablesInsert<"story_chapters">;

export function useStories(profileId?: string) {
  return useQuery({
    queryKey: ["stories", profileId],
    queryFn: async () => {
      let query = supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (profileId) {
        query = query.eq("profile_id", profileId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Story[];
    },
  });
}

export function useStory(storyId: string) {
  return useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          story_chapters (*)
        `)
        .eq("id", storyId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Story & { story_chapters: StoryChapter[] };
    },
    enabled: !!storyId,
  });
}

export function usePublishedStories() {
  return useQuery({
    queryKey: ["published-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          profiles (business_name, avatar_url)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (story: StoryInsert) => {
      const { data, error } = await supabase
        .from("stories")
        .insert(story)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: StoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("stories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["story", data.id] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useAddChapter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (chapter: StoryChapterInsert) => {
      const { data, error } = await supabase
        .from("story_chapters")
        .insert(chapter)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["story", data.story_id] });
    },
  });
}
