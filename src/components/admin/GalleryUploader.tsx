import { useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  ImagePlus,
  Play,
  Trash2,
  AlertTriangle,
  HardDrive,
} from "lucide-react";
import { useGalleryUpload, UploadingFile } from "@/hooks/useGalleryUpload";
import { useUploadQuotaCheck } from "@/hooks/useGalleryQuotas";
import { formatFileSize } from "@/hooks/useGalleries";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface GalleryUploaderProps {
  galleryId: string;
  onUploadComplete?: () => void;
}

export function GalleryUploader({ galleryId, onUploadComplete }: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

  const quotas = useUploadQuotaCheck();

  const {
    files,
    isUploading,
    addFiles,
    startUpload,
    removeFile,
    clearCompleted,
  } = useGalleryUpload({ galleryId, onUploadComplete });

  // Check quota before adding files
  const handleAddFiles = useCallback(
    (fileList: FileList | File[]) => {
      const filesArray = Array.from(fileList);
      
      // Calculate total size of new files
      const newFilesSize = filesArray.reduce((acc, f) => acc + f.size, 0);
      
      // Check if adding these files would exceed quota
      if (!quotas.canUpload(newFilesSize)) {
        const exceededBy = (quotas.storageUsed + newFilesSize) - quotas.storageLimit;
        toast({
          title: "Limite de armazenamento",
          description: `Esses arquivos excedem seu limite em ${formatFileSize(exceededBy)}. Remova alguns arquivos ou faça upgrade.`,
          variant: "destructive",
        });
        return;
      }

      // Show warning if close to limit
      const projectedUsage = quotas.storageUsed + newFilesSize;
      const usagePercentage = (projectedUsage / quotas.storageLimit) * 100;
      
      if (usagePercentage >= 90) {
        setQuotaWarning(`Você está usando ${usagePercentage.toFixed(0)}% do seu armazenamento`);
      } else {
        setQuotaWarning(null);
      }

      addFiles(filesArray);
    },
    [addFiles, quotas]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer.files?.length) {
        handleAddFiles(e.dataTransfer.files);
      }
    },
    [handleAddFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleAddFiles(e.target.files);
      }
      // Reset input
      e.target.value = "";
    },
    [handleAddFiles]
  );

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading" || f.status === "processing").length;
  const completedCount = files.filter((f) => f.status === "complete").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  const getStatusIcon = (file: UploadingFile) => {
    switch (file.status) {
      case "complete":
        return <Check className="h-4 w-4 text-emerald-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "uploading":
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
          "border-luma-glass-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <ImagePlus className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">
            Arraste fotos aqui
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP ou HEIC • Máx 50MB por foto
          </p>
          
          {/* Storage info */}
          <div className="mt-4 pt-4 border-t border-luma-glass-border/50 w-full">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5" />
              <span>
                {formatFileSize(quotas.storageUsed)} / {formatFileSize(quotas.storageLimit)} usado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Warning */}
      {quotaWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{quotaWarning}</span>
        </motion.div>
      )}

      {/* Files Queue */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Summary */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{files.length} arquivos</span>
                {completedCount > 0 && (
                  <span className="text-emerald-500">{completedCount} concluídos</span>
                )}
                {errorCount > 0 && (
                  <span className="text-destructive">{errorCount} erros</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {completedCount > 0 && !isUploading && (
                  <Button variant="ghost" size="sm" onClick={clearCompleted}>
                    Limpar concluídos
                  </Button>
                )}
              </div>
            </div>

            {/* File List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl glass border transition-all",
                    file.status === "complete" && "border-emerald-500/30 bg-emerald-500/5",
                    file.status === "error" && "border-destructive/30 bg-destructive/5",
                    (file.status === "pending" || file.status === "uploading" || file.status === "processing") && 
                      "border-luma-glass-border"
                  )}
                >
                  {/* Thumbnail Preview */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      {file.status === "uploading" && (
                        <span className="text-xs text-primary">
                          {file.progress}%
                        </span>
                      )}
                      {file.status === "processing" && (
                        <span className="text-xs text-primary">
                          Processando...
                        </span>
                      )}
                      {file.error && (
                        <span className="text-xs text-destructive truncate">
                          {file.error}
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {(file.status === "uploading" || file.status === "processing") && (
                      <Progress value={file.progress} className="h-1 mt-2" />
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(file)}
                  </div>

                  {/* Remove Button */}
                  {file.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            {pendingCount > 0 && !isUploading && (
              <Button
                variant="gradient"
                size="lg"
                className="w-full gap-2"
                onClick={startUpload}
              >
                <Play className="h-4 w-4" />
                Enviar {pendingCount} {pendingCount === 1 ? "foto" : "fotos"}
              </Button>
            )}

            {isUploading && (
              <div className="flex items-center justify-center gap-2 py-4 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">
                  Enviando {uploadingCount} de {files.length}...
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
