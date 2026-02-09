import { useState, useRef, useEffect, useCallback } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { 
  Upload, 
  Plus, 
  Trash2, 
  GripVertical,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  MessageCircle,
  Instagram,
  Facebook,
  Mail,
  Phone,
  Calendar,
  Tag,
  MapPin,
  Youtube,
  Twitter,
  Linkedin,
  Globe,
  Image as ImageIcon,
  Video,
  Crown,
  Lock,
  Smartphone,
  Link2,
  Check,
  X,
  Loader2,
  Type,
  Layout,
  Images,
  Sparkles,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile, useCheckSlugAvailability, validateSlugFormat } from "@/hooks/useProfile";
import { useUploadFile } from "@/hooks/useStorage";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { MinisitePreview } from "@/components/admin/MinisitePreview";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useCarouselPhotos, useUploadCarouselPhoto, useDeleteCarouselPhoto, useReorderCarouselPhotos } from "@/hooks/useMinisiteCarousel";
import { CarouselUploader } from "@/components/minisite/CarouselUploader";
import { LayoutSelector } from "@/components/minisite/LayoutSelector";
import { ThemeSelector } from "@/components/minisite/ThemeSelector";
import { MinisiteTheme } from "@/components/minisite/MinisiteThemeProvider";
import { UpgradeModal } from "@/components/admin/UpgradeModal";

interface ActionButton {
  id: string;
  label: string;
  url: string;
  icon: string;
  isPrimary: boolean;
}

const iconOptions = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Telefone", icon: Phone },
  { value: "calendar", label: "Agenda", icon: Calendar },
  { value: "tag", label: "Preços", icon: Tag },
  { value: "map", label: "Localização", icon: MapPin },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "globe", label: "Website", icon: Globe },
  { value: "link", label: "Link", icon: ExternalLink },
];

// =====================================================
// DUAL-DOMAIN: Domínios disponíveis para links públicos
// =====================================================
const DOMAINS = {
  primary: {
    label: "Link Principal",
    baseUrl: "ligadafotografia.com",
    pathPrefix: "/p/",  // Mantém /p/ no domínio principal
    description: "Use este link para manter a associação com a Liga da Fotografia.",
    icon: "🏢",
  },
  alternative: {
    label: "Link Alternativo",
    baseUrl: "saibamais.app",
    pathPrefix: "/",  // URL limpa, sem /p/
    description: "URL limpa e profissional para compartilhar com seus clientes.",
    icon: "✨",
    isNew: true,
  },
};

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find(opt => opt.value === iconName);
  return found?.icon || ExternalLink;
};

// Reorderable Button Item Component
interface ReorderableButtonItemProps {
  button: ActionButton;
  index: number;
  onUpdate: (index: number, field: keyof ActionButton, value: string | boolean) => void;
  onRemove: (index: number) => void;
}

function ReorderableButtonItem({ button, index, onUpdate, onRemove }: ReorderableButtonItemProps) {
  const dragControls = useDragControls();
  const IconComponent = getIconComponent(button.icon);

  return (
    <Reorder.Item
      value={button}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 cursor-default"
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        zIndex: 50 
      }}
    >
      <div 
        className="mt-2 text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1 grid gap-3 md:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Ícone</Label>
          <Select 
            value={button.icon} 
            onValueChange={(v) => onUpdate(index, "icon", v)}
          >
            <SelectTrigger className="h-10">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="truncate">
                    {iconOptions.find(o => o.value === button.icon)?.label}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Texto do Botão</Label>
          <Input
            value={button.label}
            onChange={(e) => onUpdate(index, "label", e.target.value)}
            placeholder="Ex: WhatsApp"
            maxLength={30}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs">URL / Link</Label>
          <Input
            value={button.url}
            onChange={(e) => onUpdate(index, "url", e.target.value)}
            placeholder="https://wa.me/5511999999999"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={button.isPrimary}
            onCheckedChange={(v) => onUpdate(index, "isPrimary", v)}
          />
          <span className="text-xs text-muted-foreground">Destaque</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  );
}

// Locked Feature Block Component
interface LockedFeatureBlockProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onUpgrade: () => void;
  children?: React.ReactNode;
  benefitText?: string;
}

// Locked Feature Block with semi-transparent overlay
interface LockedFeatureBlockWithBenefitProps extends LockedFeatureBlockProps {
  benefitText?: string;
}

function LockedFeatureBlock({ title, description, icon, onUpgrade, children, benefitText }: LockedFeatureBlockWithBenefitProps) {
  return (
    <Card className="glass border-border/50 relative overflow-hidden">
      {/* Semi-transparent overlay - allows seeing content underneath */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/80 z-10 flex flex-col items-center justify-center cursor-pointer gap-3"
        onClick={onUpgrade}
      >
        <Badge className="bg-gradient-to-r from-primary to-violet-500 text-white border-0 px-4 py-1.5 gap-2">
          <Crown className="h-3.5 w-3.5" />
          PRO
        </Badge>
        {benefitText && (
          <p className="text-sm text-foreground/80 text-center max-w-xs px-4 font-medium">
            {benefitText}
          </p>
        )}
        <p className="text-xs text-muted-foreground text-center max-w-xs px-4">
          Clique para fazer upgrade e desbloquear
        </p>
      </div>

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

// =====================================================
// Componente para exibir link com botão de copiar
// =====================================================
interface CopyableLinkProps {
  url: string;
  label: string;
  description: string;
  icon: string;
  isNew?: boolean;
}

function CopyableLink({ url, label, description, icon, isNew }: CopyableLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ 
        title: "Link copiado!", 
        description: url 
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ 
        title: "Erro ao copiar", 
        description: "Não foi possível copiar o link.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="font-medium text-sm">{label}</span>
        {isNew && (
          <Badge 
            variant="secondary" 
            className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20"
          >
            NOVO
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center h-10 px-3 bg-muted/30 border border-border rounded-md overflow-hidden">
          <span className="text-sm text-foreground truncate">{url}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="shrink-0 h-10 w-10"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default function AdminMinisite() {
  const { profile } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadFile = useUploadFile();
  const navigate = useNavigate();
  const { checkSlug, isChecking: isCheckingSlug, isAvailable: isSlugAvailable, error: slugError, reset: resetSlugCheck } = useCheckSlugAvailability();
  
  // Feature access hook
  const { maxCarouselPhotos, plan } = useFeatureAccess();
  
  // Carousel hooks
  const { data: carouselPhotos = [] } = useCarouselPhotos(profile?.id);
  const uploadCarouselPhoto = useUploadCarouselPhoto();
  const deleteCarouselPhoto = useDeleteCarouselPhoto();
  const reorderCarouselPhotos = useReorderCarouselPhotos();
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const aboutPhotoInputRef = useRef<HTMLInputElement>(null);
  const minisiteAvatarInputRef = useRef<HTMLInputElement>(null);
  const slugCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Form state
  const [slug, setSlug] = useState<string>("");
  const [originalSlug, setOriginalSlug] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [minisiteAvatarUrl, setMinisiteAvatarUrl] = useState<string>("");
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const [aboutPhotoUrl, setAboutPhotoUrl] = useState<string>("");
  const [aboutVideoUrl, setAboutVideoUrl] = useState<string>("");
  const [aboutText, setAboutText] = useState<string>("");
  const [theme, setTheme] = useState<MinisiteTheme>("dark");
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  // New fields
  const [headline, setHeadline] = useState<string>("");
  const [subheadline, setSubheadline] = useState<string>("");
  const [carouselLayout, setCarouselLayout] = useState<"carousel" | "pinterest">("carousel");
  
  // Upgrade modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<"portfolio" | "luma">("portfolio");

  // Debounced slug check
  const debouncedCheckSlug = useCallback((value: string) => {
    if (slugCheckTimeoutRef.current) {
      clearTimeout(slugCheckTimeoutRef.current);
    }
    
    // Don't check if slug is the same as original
    if (value === originalSlug) {
      resetSlugCheck();
      return;
    }

    slugCheckTimeoutRef.current = setTimeout(() => {
      checkSlug(value);
    }, 500);
  }, [checkSlug, originalSlug, resetSlugCheck]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to lowercase and replace invalid chars with hyphens
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-");
    
    setSlug(value);
    debouncedCheckSlug(value);
  };

  // Get the base URL for mini-site
  const getBaseUrl = () => {
    return "https://ligadafotografia.com/p/";
  };

  // Load existing data
  useEffect(() => {
    if (profile) {
      setSlug(profile.slug || "");
      setOriginalSlug(profile.slug || "");
      setCoverUrl(profile.minisite_cover_url || "");
      setMinisiteAvatarUrl((profile as any).minisite_avatar_url || "");
      setAboutPhotoUrl(profile.about_photo_url || "");
      setAboutVideoUrl(profile.about_video_url || "");
      setAboutText(profile.about_text || "");
      setTheme((profile.minisite_theme as MinisiteTheme) || "dark");
      setHeadline(profile.minisite_headline || "");
      setSubheadline(profile.minisite_subheadline || "");
      setCarouselLayout((profile.minisite_carousel_layout as "carousel" | "pinterest") || "carousel");
      
      try {
        const buttons = profile.action_buttons;
        if (Array.isArray(buttons)) {
          // Ensure all buttons have IDs
          const buttonsWithIds = (buttons as unknown as ActionButton[]).map((b, i) => ({
            ...b,
            id: b.id || `btn-${Date.now()}-${i}`
          }));
          setActionButtons(buttonsWithIds);
        }
      } catch {
        setActionButtons([]);
      }
    }
  }, [profile]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploading(true);
    try {
      const path = `${profile.id}/minisite/cover-${Date.now()}.${file.name.split('.').pop()}`;
      const url = await uploadFile.mutateAsync({ file, path });
      setCoverUrl(url);
      toast({ title: "Capa enviada!", description: "Sua imagem de capa foi atualizada." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível enviar a imagem.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMinisiteAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploadingAvatar(true);
    try {
      const path = `${profile.id}/minisite/avatar-${Date.now()}.${file.name.split('.').pop()}`;
      const url = await uploadFile.mutateAsync({ file, path });
      setMinisiteAvatarUrl(url);
      toast({ title: "Foto atualizada!", description: "Sua foto do mini-site foi atualizada." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível enviar a imagem.", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAboutPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploading(true);
    try {
      const path = `${profile.id}/minisite/about-${Date.now()}.${file.name.split('.').pop()}`;
      const url = await uploadFile.mutateAsync({ file, path });
      setAboutPhotoUrl(url);
      toast({ title: "Foto enviada!", description: "Sua foto pessoal foi atualizada." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível enviar a imagem.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const addButton = () => {
    if (actionButtons.length >= 4) {
      toast({ title: "Limite atingido", description: "Você pode ter no máximo 4 botões.", variant: "destructive" });
      return;
    }
    setActionButtons([...actionButtons, { 
      id: `btn-${Date.now()}`, 
      label: "", 
      url: "", 
      icon: "link", 
      isPrimary: false 
    }]);
  };

  const updateButton = (index: number, field: keyof ActionButton, value: string | boolean) => {
    const updated = [...actionButtons];
    updated[index] = { ...updated[index], [field]: value };
    setActionButtons(updated);
  };

  const removeButton = (index: number) => {
    setActionButtons(actionButtons.filter((_, i) => i !== index));
  };

  // Carousel handlers
  const handleCarouselUpload = async (file: File) => {
    await uploadCarouselPhoto.mutateAsync({ file, maxPhotos: maxCarouselPhotos });
  };

  const handleCarouselDelete = async (photoId: string) => {
    await deleteCarouselPhoto.mutateAsync(photoId);
  };

  const handleCarouselReorder = async (photos: typeof carouselPhotos) => {
    await reorderCarouselPhotos.mutateAsync(photos);
  };

  const handleOpenUpgradeModal = (feature: "portfolio" | "luma") => {
    setUpgradeFeature(feature);
    setUpgradeModalOpen(true);
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate slug if changed
    if (slug !== originalSlug) {
      const slugValidation = validateSlugFormat(slug);
      if (!slugValidation.valid) {
        toast({ 
          title: "Slug inválido", 
          description: slugValidation.error, 
          variant: "destructive" 
        });
        return;
      }
      
      // Double-check availability
      if (isSlugAvailable === false) {
        toast({ 
          title: "Slug indisponível", 
          description: "Este slug já está em uso por outro perfil.", 
          variant: "destructive" 
        });
        return;
      }
    }

    // Validate buttons
    const validButtons = actionButtons.filter(b => b.label.trim() && b.url.trim());

    try {
      await updateProfile.mutateAsync({
        slug: slug || null,
        minisite_cover_url: coverUrl || null,
        minisite_avatar_url: minisiteAvatarUrl || null,
        action_buttons: validButtons as unknown as null,
        about_photo_url: aboutPhotoUrl || null,
        about_video_url: aboutVideoUrl || null,
        about_text: aboutText || null,
        minisite_theme: theme,
        minisite_headline: headline || null,
        minisite_subheadline: subheadline || null,
        minisite_carousel_layout: carouselLayout,
      } as any);

      setOriginalSlug(slug);
      resetSlugCheck();

      toast({ 
        title: "Salvo com sucesso!", 
        description: "Seu mini-site foi atualizado." 
      });
    } catch {
      toast({ 
        title: "Erro ao salvar", 
        description: "Não foi possível salvar as alterações.", 
        variant: "destructive" 
      });
    }
  };

  const handlePreview = () => {
    if (profile?.slug) {
      window.open(`/p/${profile.slug}`, "_blank");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Editor Panel */}
      <div className={`flex-1 p-6 space-y-8 overflow-auto pb-24 ${showPreview ? 'xl:max-w-2xl' : 'max-w-4xl mx-auto'}`}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meu Mini-Site</h1>
            <p className="text-muted-foreground text-sm">Personalize sua página pública</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={showPreview ? "secondary" : "outline"} 
              onClick={() => setShowPreview(!showPreview)} 
              className="gap-2 hidden xl:flex"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
            </Button>
            <Button variant="outline" onClick={handlePreview} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Abrir</span>
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleSave} 
              disabled={updateProfile.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateProfile.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* URL / Slug Section */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              URL do Mini-Site
            </CardTitle>
            <CardDescription>
              Personalize o endereço da sua página pública
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Seu link personalizado</Label>
              <div className="flex items-center gap-0">
                <div className="flex items-center h-10 px-3 bg-muted/50 border border-r-0 border-border rounded-l-md text-sm text-muted-foreground">
                  <span className="hidden sm:inline">{getBaseUrl()}</span>
                  <span className="sm:hidden">/p/</span>
                </div>
                <div className="relative flex-1">
                  <Input
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="meu-estudio"
                    className="rounded-l-none pr-10"
                    maxLength={50}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isCheckingSlug && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!isCheckingSlug && slug && slug !== originalSlug && isSlugAvailable === true && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {!isCheckingSlug && slug && slug !== originalSlug && isSlugAvailable === false && (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Status message */}
              {slug && slug !== originalSlug && (
                <p className={`text-xs ${isSlugAvailable === true ? 'text-green-500' : isSlugAvailable === false ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {isCheckingSlug 
                    ? "Verificando disponibilidade..." 
                    : slugError 
                      ? slugError 
                      : isSlugAvailable 
                        ? "✓ URL disponível!" 
                        : ""}
                </p>
              )}
              
              {slug === originalSlug && slug && (
                <p className="text-xs text-muted-foreground">
                  Esta é sua URL atual
                </p>
              )}
            </div>

            {/* =====================================================
                DUAL-DOMAIN: Seção de Links Públicos
                ===================================================== */}
            {slug ? (
              <div className="space-y-4 p-4 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Seus Links Públicos</span>
                </div>
                
                {/* Link Principal - Liga da Fotografia */}
                <CopyableLink
                  url={`https://${DOMAINS.primary.baseUrl}${DOMAINS.primary.pathPrefix}${slug}`}
                  label={DOMAINS.primary.label}
                  description={DOMAINS.primary.description}
                  icon={DOMAINS.primary.icon}
                />
                
                <div className="border-t border-border/50 my-4" />
                
                {/* Link Alternativo - Saiba Mais */}
                <CopyableLink
                  url={`https://${DOMAINS.alternative.baseUrl}${DOMAINS.alternative.pathPrefix}${slug}`}
                  label={DOMAINS.alternative.label}
                  description={DOMAINS.alternative.description}
                  icon={DOMAINS.alternative.icon}
                  isNew={DOMAINS.alternative.isNew}
                />
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Preview da URL:</p>
                <p className="text-sm font-medium text-muted-foreground">
                  Configure um slug para ver seus links
                </p>
              </div>
            )}

            {/* Links do Chat Luma - Dual Domain Info */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <MessageCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1.5">
                <p className="font-medium text-foreground">Links do Chat Luma:</p>
                <div className="space-y-1 font-mono">
                  <p className="text-primary">
                    {DOMAINS.primary.baseUrl}/chat/{slug || "seu-slug"}
                  </p>
                  <p className="text-primary">
                    {DOMAINS.alternative.baseUrl}/chat/{slug || "seu-slug"}
                  </p>
                </div>
                <p className="text-muted-foreground pt-1">
                  O mesmo slug funciona em ambos os domínios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Selector - NEW */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Tema Visual
            </CardTitle>
            <CardDescription>
              Escolha a estética do seu mini-site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelector value={theme} onChange={setTheme} />
          </CardContent>
        </Card>

        {/* Headline Section - NEW */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Headline
            </CardTitle>
            <CardDescription>
              Um título impactante para sua página (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título Principal</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex: Eternizando Momentos Únicos"
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground">
                {headline.length}/80 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Textarea
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                placeholder="Ex: Fotografia de casamentos e eventos com paixão e criatividade"
                rows={2}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {subheadline.length}/200 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Minisite Avatar Section - NEW */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Foto do Mini-Site
            </CardTitle>
            <CardDescription>
              Esta foto aparece no seu mini-site público (separada da foto do chat)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={minisiteAvatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleMinisiteAvatarUpload}
              className="hidden"
            />
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                  {minisiteAvatarUrl ? (
                    <img src={minisiteAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold">
                      {profile?.business_name?.charAt(0) || "S"}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => minisiteAvatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Foto de Perfil do Mini-Site</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta foto aparece no cabeçalho do seu mini-site público. Recomendado: 400x400px
                </p>
                {minisiteAvatarUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-destructive hover:text-destructive"
                    onClick={() => setMinisiteAvatarUrl("")}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image Section */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Imagem de Capa
            </CardTitle>
            <CardDescription>
              Imagem fullscreen no topo do seu mini-site. Recomendado: 1920x1080px
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            
            {coverUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Trocar imagem
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => setCoverUrl("")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploading}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 bg-muted/30"
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {isUploading ? "Enviando..." : "Clique para enviar uma imagem"}
                </span>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Carousel/Gallery Section - NEW */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Images className="h-5 w-5 text-primary" />
              Carrossel de Imagens
            </CardTitle>
            <CardDescription>
              Até {maxCarouselPhotos} fotos para exibir em seu mini-site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Layout Selector */}
            <div className="space-y-3">
              <Label>Formato de Exibição</Label>
              <LayoutSelector 
                value={carouselLayout} 
                onChange={setCarouselLayout} 
              />
            </div>

            {/* Photo Uploader - Component is self-contained */}
            <CarouselUploader />
          </CardContent>
        </Card>

        {/* Action Buttons Section */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Botões de Ação
            </CardTitle>
            <CardDescription>
              Até 4 botões para WhatsApp, Instagram, e outros links importantes. Arraste para reordenar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Reorder.Group 
              axis="y" 
              values={actionButtons} 
              onReorder={setActionButtons}
              className="space-y-3"
            >
              {actionButtons.map((button, index) => (
                <ReorderableButtonItem
                  key={button.id}
                  button={button}
                  index={index}
                  onUpdate={updateButton}
                  onRemove={removeButton}
                />
              ))}
            </Reorder.Group>

            {actionButtons.length < 4 && (
              <Button
                variant="outline"
                onClick={addButton}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Adicionar Botão
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Section */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              Portfólio
            </CardTitle>
            <CardDescription>
              Suas histórias publicadas serão exibidas automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                As histórias que você publicar aparecerão automaticamente no seu mini-site.
              </p>
              <Button variant="outline" onClick={() => navigate("/admin/stories")} className="gap-2">
                <Layout className="h-4 w-4" />
                Gerenciar Histórias
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Seção "Sobre"
            </CardTitle>
            <CardDescription>
              Apresente-se aos seus clientes com foto, vídeo e texto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-3">
              <Label>Sua Foto</Label>
              <input
                ref={aboutPhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handleAboutPhotoUpload}
                className="hidden"
              />
              
              <div className="flex items-start gap-4">
                {aboutPhotoUrl ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted">
                    <img src={aboutPhotoUrl} alt="Foto pessoal" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setAboutPhotoUrl("")}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => aboutPhotoInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 bg-muted/30"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Upload
                    </span>
                  </button>
                )}
                <p className="text-sm text-muted-foreground flex-1 pt-2">
                  Uma foto sua para a seção "Sobre". Recomendado: foto quadrada ou retrato.
                </p>
              </div>
            </div>

            {/* Video URL */}
            <div className="space-y-3">
              <Label>Vídeo de Apresentação (opcional)</Label>
              <Input
                value={aboutVideoUrl}
                onChange={(e) => setAboutVideoUrl(e.target.value)}
                placeholder="Cole a URL do seu vídeo (YouTube, Vimeo, etc)"
              />
              <p className="text-xs text-muted-foreground">
                Se preenchido, o vídeo será exibido no lugar da foto até o visitante clicar para assistir.
              </p>
            </div>

            {/* About Text */}
            <div className="space-y-3">
              <Label>Texto de Apresentação</Label>
              <Textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Olá! Sou a Ana, fotógrafa há 10 anos especializada em capturar momentos únicos..."
                rows={6}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {aboutText.length}/2000 caracteres
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Save Button (Mobile) */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-40">
          <Button 
            variant="gradient" 
            onClick={handleSave} 
            disabled={updateProfile.isPending}
            className="w-full gap-2"
          >
            <Save className="h-4 w-4" />
            {updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="hidden xl:block w-[380px] flex-shrink-0 border-l border-border bg-muted/30 p-4 sticky top-0 h-screen overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              Preview em tempo real
            </div>
          </div>
          <div className="h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border shadow-xl">
            <MinisitePreview
              businessName={profile?.business_name || "Seu Estúdio"}
              niche={profile?.niche}
              bio={profile?.bio}
              avatarUrl={minisiteAvatarUrl || profile?.avatar_url}
              coverUrl={coverUrl}
              actionButtons={actionButtons}
              aboutPhotoUrl={aboutPhotoUrl}
              aboutVideoUrl={aboutVideoUrl}
              aboutText={aboutText}
              whatsappNumber={profile?.whatsapp_number}
              slug={slug}
              headline={headline}
              subheadline={subheadline}
              carouselPhotos={carouselPhotos}
              carouselLayout={carouselLayout}
              theme={theme}
            />
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature={upgradeFeature}
        requiredPlan="pro"
      />
    </div>
  );
}
