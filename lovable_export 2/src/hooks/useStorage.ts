import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({
      file,
      bucket = "portfolio-media",
      path,
    }: {
      file: File;
      bucket?: string;
      path: string;
    }) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    },
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: async ({
      paths,
      bucket = "portfolio-media",
    }: {
      paths: string[];
      bucket?: string;
    }) => {
      const { error } = await supabase.storage.from(bucket).remove(paths);

      if (error) throw error;
    },
  });
}
