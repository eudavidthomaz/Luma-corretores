import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { generateThumbnail, optimizeForWeb, ProcessedImage } from "@/lib/imageUtils";

export interface CarouselPhoto {
  id: string;
  profile_id: string;
  file_url: string;
  thumbnail_url: string;
  order_index: number;
  width: number | null;
  height: number | null;
  file_size: number;
  created_at: string;
}

// Fetch carousel photos for a profile
export function useCarouselPhotos(profileId?: string) {
  return useQuery({
    queryKey: ['carousel-photos', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('minisite_carousel_photos')
        .select('*')
        .eq('profile_id', profileId)
        .order('order_index');
      
      if (error) throw error;
      return data as CarouselPhoto[];
    },
    enabled: !!profileId,
  });
}

// Upload a new carousel photo
export function useUploadCarouselPhoto() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, maxPhotos = 10 }: { file: File; maxPhotos?: number }) => {
      if (!profile?.id) throw new Error("Usuário não autenticado");

      // Check current count
      const { count, error: countError } = await supabase
        .from('minisite_carousel_photos')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id);

      if (countError) throw countError;
      if ((count || 0) >= maxPhotos) {
        throw new Error(`Limite de ${maxPhotos} fotos atingido`);
      }

      // Optimize image for web
      const optimizedBlob = await optimizeForWeb(file);
      const optimizedFile = new File([optimizedBlob], file.name, { type: 'image/jpeg' });

      // Generate thumbnail
      const thumbnailResult: ProcessedImage = await generateThumbnail(file);
      const thumbnailBlob = thumbnailResult.thumbnail;
      const originalWidth = thumbnailResult.width;
      const originalHeight = thumbnailResult.height;

      // Upload optimized image
      const filePath = `${profile.id}/carousel/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(filePath, optimizedFile);

      if (uploadError) throw uploadError;

      // Upload thumbnail
      const thumbPath = `${profile.id}/carousel/thumb-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: thumbUploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(thumbPath, thumbnailBlob);

      if (thumbUploadError) throw thumbUploadError;

      // Get public URLs
      const { data: { publicUrl: fileUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(filePath);

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(thumbPath);

      // Get next order index
      const { data: lastPhoto } = await supabase
        .from('minisite_carousel_photos')
        .select('order_index')
        .eq('profile_id', profile.id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const nextIndex = (lastPhoto?.order_index || 0) + 1;

      // Insert record
      const { data, error: insertError } = await supabase
        .from('minisite_carousel_photos')
        .insert({
          profile_id: profile.id,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          order_index: nextIndex,
          width: originalWidth,
          height: originalHeight,
          file_size: optimizedFile.size,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data as CarouselPhoto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-photos', profile?.id] });
      toast({ title: "Foto adicionada!", description: "A imagem foi otimizada e enviada." });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao enviar", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}

// Delete a carousel photo
export function useDeleteCarouselPhoto() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      if (!profile?.id) throw new Error("Usuário não autenticado");

      // Get photo info first
      const { data: photo, error: fetchError } = await supabase
        .from('minisite_carousel_photos')
        .select('file_url, thumbnail_url')
        .eq('id', photoId)
        .eq('profile_id', profile.id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const filePath = photo.file_url.split('/portfolio-media/')[1];
      const thumbPath = photo.thumbnail_url.split('/portfolio-media/')[1];

      if (filePath) {
        await supabase.storage.from('portfolio-media').remove([filePath]);
      }
      if (thumbPath) {
        await supabase.storage.from('portfolio-media').remove([thumbPath]);
      }

      // Delete record
      const { error: deleteError } = await supabase
        .from('minisite_carousel_photos')
        .delete()
        .eq('id', photoId)
        .eq('profile_id', profile.id);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-photos', profile?.id] });
      toast({ title: "Foto removida" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao remover", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}

// Reorder carousel photos
export function useReorderCarouselPhotos() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photos: CarouselPhoto[]) => {
      if (!profile?.id) throw new Error("Usuário não autenticado");

      // Update order_index for each photo
      const updates = photos.map((photo, index) => 
        supabase
          .from('minisite_carousel_photos')
          .update({ order_index: index })
          .eq('id', photo.id)
          .eq('profile_id', profile.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel-photos', profile?.id] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao reordenar", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}
