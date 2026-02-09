import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, Calendar, Lock, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateGallery, generateSlug } from "@/hooks/useGalleries";
import { useGalleryQuotas } from "@/hooks/useGalleryQuotas";
import { getGalleryDefaultExpiration, getPlanLimit } from "@/lib/planLimits";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function NewGalleryPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const createGallery = useCreateGallery();
  const quotas = useGalleryQuotas();

  const planLimits = getPlanLimit(profile?.plan);
  const defaultExpiration = getGalleryDefaultExpiration(profile?.plan);

  // Redirect if no access
  useEffect(() => {
    if (!quotas.isLoading && !quotas.hasGalleryAccess) {
      toast({
        title: "Acesso negado",
        description: "Seu plano não inclui o Luma Showcase. Faça upgrade para continuar.",
        variant: "destructive",
      });
      navigate("/admin/gallery");
    } else if (!quotas.isLoading && !quotas.canCreateGallery) {
      toast({
        title: "Limite atingido",
        description: `Você atingiu o limite de ${quotas.galleriesLimit} vitrines do seu plano.`,
        variant: "destructive",
      });
      navigate("/admin/gallery");
    }
  }, [quotas.isLoading, quotas.hasGalleryAccess, quotas.canCreateGallery, navigate]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState(format(defaultExpiration, "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = generateSlug(title);

      const gallery = await createGallery.mutateAsync({
        profile_id: user.id,
        title: title.trim(),
        slug,
        description: description.trim() || null,
        event_date: eventDate || null,
        access_password: hasPassword && password ? password : null,
        expires_at: new Date(expiresAt).toISOString(),
        status: "draft",
        cover_url: null,
      });

      toast({ title: "Vitrine criada com sucesso!" });
      navigate(`/admin/gallery/${gallery.id}`);
    } catch (error: any) {
      if (error.code === "23505") {
        toast({
          title: "Slug já existe",
          description: "Já existe uma galeria com nome similar. Tente um título diferente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao criar galeria",
          description: error.message || "Tente novamente",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/gallery")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nova Vitrine</h1>
          <p className="text-muted-foreground mt-1">Configure a apresentação do seu imóvel</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6"
        >
          <h2 className="text-lg font-semibold text-foreground">Informações da Vitrine</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nome da Coleção / Imóvel *</Label>
              <Input
                id="title"
                placeholder="Ex: Cobertura Leblon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass border-luma-glass-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Uma breve descrição do evento..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass border-luma-glass-border min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data da Captação (opcional)
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="glass border-luma-glass-border"
              />
            </div>
          </div>
        </motion.div>

        {/* Access Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Controle de Acesso
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hasPassword">Proteger com senha</Label>
                <p className="text-sm text-muted-foreground">
                  Clientes precisarão digitar a senha para acessar
                </p>
              </div>
              <Switch
                id="hasPassword"
                checked={hasPassword}
                onCheckedChange={setHasPassword}
              />
            </div>

            {hasPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="password">Senha de Acesso</Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Defina uma senha simples"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass border-luma-glass-border"
                />
                <p className="text-xs text-muted-foreground">
                  Você compartilhará essa senha com seus clientes
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Expiration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Validade da Vitrine
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Data de Expiração</Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="glass border-luma-glass-border"
              />
              <p className="text-xs text-muted-foreground">
                Seu plano <span className="font-medium capitalize">{profile?.plan || "trial"}</span> inclui {planLimits.galleryDurationDays} dias de validade gratuita.
                Após expirar, todas as fotos serão apagadas automaticamente.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Criar Vitrine
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/admin/gallery")}
          >
            Cancelar
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
