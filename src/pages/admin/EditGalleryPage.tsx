import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  Settings,
  Image as ImageIcon,
  Share2,
  Eye,
  Download,
  Clock,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Save,
  Trash2,
} from "lucide-react";
import { useGallery, useGalleryPhotos, useUpdateGallery, useDeleteGallery, getDaysUntilExpiration, formatFileSize } from "@/hooks/useGalleries";
import { GalleryUploader } from "@/components/admin/GalleryUploader";
import { GalleryPhotoGrid } from "@/components/admin/GalleryPhotoGrid";
import { GalleryPreview } from "@/components/admin/GalleryPreview";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EditGalleryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: gallery, isLoading, refetch } = useGallery(id);
  const { data: photos } = useGalleryPhotos(gallery?.id);
  const updateGallery = useUpdateGallery();
  const deleteGallery = useDeleteGallery();

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Initialize form when gallery loads
  useState(() => {
    if (gallery) {
      setTitle(gallery.title);
      setDescription(gallery.description || "");
      setHasPassword(!!gallery.access_password);
      setPassword(gallery.access_password || "");
      setExpiresAt(format(new Date(gallery.expires_at), "yyyy-MM-dd"));
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Galeria não encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/gallery")}>
          Voltar para galerias
        </Button>
      </div>
    );
  }

  const daysLeft = getDaysUntilExpiration(gallery.expires_at);
  const galleryUrl = `${window.location.origin}/g/${profile?.slug}/${gallery.slug}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(galleryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copiado!" });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateGallery.mutateAsync({
        id: gallery.id,
        title,
        description: description || null,
        access_password: hasPassword && password ? password : null,
        expires_at: new Date(expiresAt).toISOString(),
      });
      toast({ title: "Configurações salvas!" });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await updateGallery.mutateAsync({
        id: gallery.id,
        status: gallery.status === "active" ? "draft" : "active",
      });
      toast({ 
        title: gallery.status === "active" 
          ? "Galeria despublicada" 
          : "Galeria publicada!" 
      });
      refetch();
    } catch (error) {
      toast({ title: "Erro ao alterar status", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGallery.mutateAsync(gallery.id);
      toast({ title: "Galeria excluída" });
      navigate("/admin/gallery");
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
      setIsDeleting(false);
    }
  };

  const getStatusBadge = () => {
    if (gallery.status === "expired" || daysLeft <= 0) {
      return <Badge variant="destructive">Expirada</Badge>;
    }
    if (gallery.status === "draft") {
      return <Badge variant="secondary">Rascunho</Badge>;
    }
    if (daysLeft <= 3) {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Expira em {daysLeft}d</Badge>;
    }
    return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativa</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/gallery")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{gallery.title}</h1>
              {getStatusBadge()}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
                <ImageIcon className="h-4 w-4" />
                {gallery.photos_count} fotos
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                <Eye className="h-4 w-4" />
                {gallery.views_count || 0} views
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Download className="h-4 w-4" />
                {gallery.downloads_count || 0} downloads
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-muted/50">
                {formatFileSize(gallery.total_size_bytes)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={gallery.status === "active" ? "outline" : "gradient"}
            onClick={handlePublish}
            disabled={gallery.photos_count === 0}
          >
            {gallery.status === "active" ? "Despublicar" : "Publicar"}
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="photos" className="space-y-6">
        <TabsList className="glass border border-luma-glass-border">
          <TabsTrigger value="photos" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Fotos
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="share" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-luma-glass-border"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Upload de Fotos</h2>
            <GalleryUploader galleryId={gallery.id} onUploadComplete={() => refetch()} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-luma-glass-border"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Fotos da Galeria</h2>
            <GalleryPhotoGrid 
              galleryId={gallery.id} 
              currentTotalSizeBytes={gallery.total_size_bytes || 0}
              currentCoverUrl={gallery.cover_url}
              onCoverChange={() => refetch()}
            />
          </motion.div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <GalleryPreview
            gallery={gallery}
            photos={photos || []}
            businessName={profile?.business_name || ""}
          />
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6"
          >
            <h2 className="text-lg font-semibold text-foreground">Link da Galeria</h2>

            {gallery.status !== "active" ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm text-amber-400">
                  Publique a galeria para compartilhar com seus clientes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={galleryUrl}
                    readOnly
                    className="glass border-luma-glass-border"
                  />
                  <Button variant="outline" onClick={copyLink} className="gap-2 shrink-0">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <Button variant="outline" asChild className="shrink-0">
                    <a href={galleryUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                {gallery.access_password && (
                  <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha de acesso
                    </p>
                    <p className="text-lg font-mono tracking-wider">{gallery.access_password}</p>
                    <p className="text-xs text-muted-foreground">
                      Compartilhe essa senha com seus clientes
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-muted/50 space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Validade
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {daysLeft > 0
                      ? `Expira em ${daysLeft} dias (${format(new Date(gallery.expires_at), "dd/MM/yyyy", { locale: ptBR })})`
                      : "Galeria expirada"
                    }
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6"
          >
            <h2 className="text-lg font-semibold text-foreground">Informações</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nome do Evento</Label>
                <Input
                  id="title"
                  value={title || gallery.title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass border-luma-glass-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description || gallery.description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass border-luma-glass-border min-h-[80px] resize-none"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Acesso
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Proteger com senha</Label>
                  <p className="text-sm text-muted-foreground">
                    Clientes precisarão digitar a senha
                  </p>
                </div>
                <Switch
                  checked={hasPassword ?? !!gallery.access_password}
                  onCheckedChange={setHasPassword}
                />
              </div>

              {(hasPassword ?? !!gallery.access_password) && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="text"
                    value={password || gallery.access_password || ""}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass border-luma-glass-border"
                  />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Validade
            </h2>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Data de Expiração</Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt || format(new Date(gallery.expires_at), "yyyy-MM-dd")}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="glass border-luma-glass-border"
              />
              <p className="text-xs text-muted-foreground">
                Após expirar, todas as fotos serão apagadas automaticamente.
              </p>
            </div>
          </motion.div>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Excluir Galeria
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-luma-glass-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir galeria?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todas as fotos serão excluídas permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
