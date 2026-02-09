import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Gallery {
  id: string;
  profile_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  event_date: string | null;
  access_password: string | null;
  expires_at: string;
  status: "draft" | "active" | "expired";
  views_count: number;
  photos_count: number;
  downloads_count: number;
  total_size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhoto {
  id: string;
  gallery_id: string;
  file_path: string;
  file_url: string;
  thumbnail_url: string | null;
  filename: string;
  file_size: number;
  width: number | null;
  height: number | null;
  order_index: number;
  created_at: string;
}

export function useGalleries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["galleries", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("galleries")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Gallery[];
    },
    enabled: !!user?.id,
  });
}

export function useGallery(galleryId: string | undefined) {
  return useQuery({
    queryKey: ["gallery", galleryId],
    queryFn: async () => {
      if (!galleryId) return null;

      const { data, error } = await supabase
        .from("galleries")
        .select("*")
        .eq("id", galleryId)
        .single();

      if (error) throw error;
      return data as Gallery;
    },
    enabled: !!galleryId,
  });
}

export function useGalleryPhotos(galleryId: string | undefined) {
  return useQuery({
    queryKey: ["gallery-photos", galleryId],
    queryFn: async () => {
      if (!galleryId) return [];

      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .eq("gallery_id", galleryId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as GalleryPhoto[];
    },
    enabled: !!galleryId,
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gallery: Omit<Gallery, "id" | "created_at" | "updated_at" | "views_count" | "photos_count" | "downloads_count" | "total_size_bytes">) => {
      const { data, error } = await supabase
        .from("galleries")
        .insert(gallery)
        .select()
        .single();

      if (error) throw error;
      return data as Gallery;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
}

export function useUpdateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Gallery> & { id: string }) => {
      const { data, error } = await supabase
        .from("galleries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Gallery;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      queryClient.invalidateQueries({ queryKey: ["gallery", data.id] });
    },
  });
}

export function useDeleteGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (galleryId: string) => {
      const { error } = await supabase
        .from("galleries")
        .delete()
        .eq("id", galleryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
}

// Helper to generate unique slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 50);
}

// Helper to calculate days until expiration
export function getDaysUntilExpiration(expiresAt: string): number {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffTime = expiration.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
