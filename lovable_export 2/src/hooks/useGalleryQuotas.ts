import { useAuth } from "@/contexts/AuthContext";
import { useGalleries } from "@/hooks/useGalleries";
import { getPlanLimit, getGalleryStorageLimitBytes, canCreateGallery } from "@/lib/planLimits";

export interface GalleryQuotaInfo {
  // Plan info
  plan: string;
  
  // Galleries
  galleriesUsed: number;
  galleriesLimit: number;
  canCreateGallery: boolean;
  
  // Storage (in bytes)
  storageUsed: number;
  storageLimit: number;
  storageRemaining: number;
  canUpload: (fileSize: number) => boolean;
  
  // Access
  hasGalleryAccess: boolean;
  
  // Percentages
  galleriesPercentage: number;
  storagePercentage: number;
  
  // Loading state
  isLoading: boolean;
}

export function useGalleryQuotas(): GalleryQuotaInfo {
  const { profile } = useAuth();
  const { data: galleries, isLoading } = useGalleries();

  const plan = profile?.plan || "trial";
  const limits = getPlanLimit(plan);
  const storageLimitBytes = getGalleryStorageLimitBytes(plan);

  // Calculate totals
  const galleriesUsed = galleries?.length || 0;
  const storageUsed = galleries?.reduce((acc, g) => acc + (g.total_size_bytes || 0), 0) || 0;
  const storageRemaining = Math.max(0, storageLimitBytes - storageUsed);

  // Percentages
  const galleriesPercentage = limits.galleries > 0 
    ? Math.min(100, (galleriesUsed / limits.galleries) * 100) 
    : 0;
  const storagePercentage = storageLimitBytes > 0 
    ? Math.min(100, (storageUsed / storageLimitBytes) * 100) 
    : 0;

  // Check if can upload a file of given size
  const checkCanUpload = (fileSize: number): boolean => {
    if (limits.galleries === 0) return false; // Lite plan
    return (storageUsed + fileSize) <= storageLimitBytes;
  };

  return {
    plan,
    galleriesUsed,
    galleriesLimit: limits.galleries,
    canCreateGallery: canCreateGallery(plan, galleriesUsed),
    storageUsed,
    storageLimit: storageLimitBytes,
    storageRemaining,
    canUpload: checkCanUpload,
    hasGalleryAccess: limits.galleries > 0,
    galleriesPercentage,
    storagePercentage,
    isLoading,
  };
}

/**
 * Hook to check storage quota for a specific gallery upload
 */
export function useUploadQuotaCheck() {
  const quotas = useGalleryQuotas();

  const checkFilesSize = (files: File[]): { 
    canUpload: boolean; 
    totalSize: number; 
    exceededBy: number;
    message?: string;
  } => {
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const exceededBy = Math.max(0, (quotas.storageUsed + totalSize) - quotas.storageLimit);
    const canUpload = exceededBy === 0 && quotas.hasGalleryAccess;

    let message: string | undefined;
    if (!quotas.hasGalleryAccess) {
      message = "Seu plano não inclui acesso ao Luma Gallery";
    } else if (exceededBy > 0) {
      message = `Esses arquivos excedem seu limite de armazenamento em ${formatBytes(exceededBy)}`;
    }

    return { canUpload, totalSize, exceededBy, message };
  };

  return {
    ...quotas,
    checkFilesSize,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
