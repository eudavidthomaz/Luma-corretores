import { useState, useEffect, useCallback } from "react";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateThumbnail } from "@/lib/imageUtils";
import { useQueryClient } from "@tanstack/react-query";

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  previewUrl: string;
  error?: string;
}

export interface UseGalleryUploadOptions {
  galleryId: string;
  onUploadComplete?: () => void;
}

export function useGalleryUpload({ galleryId, onUploadComplete }: UseGalleryUploadOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uppy, setUppy] = useState<Uppy | null>(null);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize Uppy
  useEffect(() => {
    if (!user) return;

    const initUppy = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const uppyInstance = new Uppy({
        id: "gallery-uploader",
        autoProceed: false,
        restrictions: {
          maxFileSize: 50 * 1024 * 1024, // 50MB
          allowedFileTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
        },
      });

      uppyInstance.use(Tus, {
        endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
        headers: {
          authorization: `Bearer ${session.access_token}`,
        },
        chunkSize: 6 * 1024 * 1024, // Required: 6MB chunks
        allowedMetaFields: ["bucketName", "objectName", "contentType", "cacheControl"],
        retryDelays: [0, 1000, 3000, 5000],
        removeFingerprintOnSuccess: true,
      });

      // File added
      uppyInstance.on("file-added", (file) => {
        const objectName = `${user.id}/${galleryId}/${Date.now()}-${file.name}`;
        
        file.meta = {
          ...file.meta,
          bucketName: "gallery-photos",
          objectName,
          contentType: file.type || "image/jpeg",
          cacheControl: "3600",
        };

        setFiles((prev) => [
          ...prev,
          {
            id: file.id,
            name: file.name || "Unnamed",
            size: file.size || 0,
            progress: 0,
            status: "pending",
            previewUrl: URL.createObjectURL(file.data as Blob),
          },
        ]);
      });

      // Upload progress
      uppyInstance.on("upload-progress", (file, progress) => {
        if (!file) return;
        const percentage = progress.bytesTotal 
          ? Math.round((progress.bytesUploaded / progress.bytesTotal) * 100)
          : 0;
        
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, progress: percentage, status: "uploading" }
              : f
          )
        );
      });

      // Single file upload success
      uppyInstance.on("upload-success", async (file, response) => {
        if (!file) return;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing", progress: 100 } : f
          )
        );

        try {
          // Generate thumbnail client-side
          const { thumbnail, width, height } = await generateThumbnail(file.data as File);

          // Upload thumbnail
          const thumbnailPath = `${user.id}/${galleryId}/thumbs/${Date.now()}-${file.name}`;
          const { error: thumbError } = await supabase.storage
            .from("gallery-thumbnails")
            .upload(thumbnailPath, thumbnail, {
              contentType: "image/jpeg",
              cacheControl: "3600",
            });

          if (thumbError) {
            console.error("Thumbnail upload error:", thumbError);
          }

          // Get thumbnail URL
          const { data: thumbUrlData } = supabase.storage
            .from("gallery-thumbnails")
            .getPublicUrl(thumbnailPath);

          // Get the file path from metadata
          const filePath = file.meta.objectName as string;

          // Get current photo count for order_index
          const { count } = await supabase
            .from("gallery_photos")
            .select("*", { count: "exact", head: true })
            .eq("gallery_id", galleryId);

          // Save to database
          const { error: dbError } = await supabase.from("gallery_photos").insert({
            gallery_id: galleryId,
            file_path: filePath,
            file_url: filePath, // We'll generate signed URLs on access
            thumbnail_url: thumbUrlData?.publicUrl || null,
            filename: file.name || "image.jpg",
            file_size: file.size || 0,
            width,
            height,
            order_index: (count || 0) + 1,
          });

          if (dbError) throw dbError;

          // Update gallery photo count and size - manual update
          try {
            const { data: galleryData } = await supabase
              .from("galleries")
              .select("photos_count, total_size_bytes")
              .eq("id", galleryId)
              .single();
            
            if (galleryData) {
              await supabase
                .from("galleries")
                .update({
                  photos_count: (galleryData.photos_count || 0) + 1,
                  total_size_bytes: (galleryData.total_size_bytes || 0) + (file.size || 0),
                })
                .eq("id", galleryId);
            }
          } catch (statsError) {
            console.error("Error updating gallery stats:", statsError);
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: "complete" } : f
            )
          );
        } catch (error) {
          console.error("Post-upload processing error:", error);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, status: "error", error: "Falha ao processar imagem" }
                : f
            )
          );
        }
      });

      // Upload error
      uppyInstance.on("upload-error", (file, error) => {
        if (!file) return;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: "error", error: error.message }
              : f
          )
        );
      });

      // All uploads complete
      uppyInstance.on("complete", () => {
        setIsUploading(false);
        queryClient.invalidateQueries({ queryKey: ["gallery", galleryId] });
        queryClient.invalidateQueries({ queryKey: ["gallery-photos", galleryId] });
        onUploadComplete?.();
      });

      setUppy(uppyInstance);
    };

    initUppy();

    return () => {
      uppy?.destroy();
    };
  }, [user, galleryId]);

  // Refresh auth token periodically
  useEffect(() => {
    if (!uppy) return;

    const refreshToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        uppy.getPlugin("Tus")?.setOptions({
          headers: {
            authorization: `Bearer ${session.access_token}`,
          },
        });
      }
    };

    const interval = setInterval(refreshToken, 5 * 60 * 1000); // Every 5 min
    return () => clearInterval(interval);
  }, [uppy]);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (!uppy) return;

      Array.from(fileList).forEach((file) => {
        try {
          uppy.addFile({
            name: file.name,
            type: file.type,
            data: file,
            source: "Local",
          });
        } catch (error) {
          console.error("Error adding file:", error);
        }
      });
    },
    [uppy]
  );

  const startUpload = useCallback(() => {
    if (!uppy) return;
    setIsUploading(true);
    uppy.upload();
  }, [uppy]);

  const removeFile = useCallback(
    (fileId: string) => {
      if (!uppy) return;
      uppy.removeFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    },
    [uppy]
  );

  const clearCompleted = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== "complete"));
  }, []);

  const retryFailed = useCallback(() => {
    if (!uppy) return;
    uppy.retryAll();
  }, [uppy]);

  return {
    files,
    isUploading,
    addFiles,
    startUpload,
    removeFile,
    clearCompleted,
    retryFailed,
    uppy,
  };
}
