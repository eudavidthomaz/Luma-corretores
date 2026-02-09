import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesUpdate } from "@/integrations/supabase/types";

type ChapterUpdate = TablesUpdate<"story_chapters">;

export function useUpdateChapter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ChapterUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("story_chapters")
        .update(updates)
        .eq("id", id)
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

export function useDeleteChapter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (chapterId: string) => {
      // Get the story_id before deleting
      const { data: chapter } = await supabase
        .from("story_chapters")
        .select("story_id")
        .eq("id", chapterId)
        .single();
      
      const { error } = await supabase
        .from("story_chapters")
        .delete()
        .eq("id", chapterId);
      
      if (error) throw error;
      return chapter?.story_id;
    },
    onSuccess: (storyId) => {
      if (storyId) {
        queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      }
    },
  });
}
