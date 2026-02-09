import { motion } from "framer-motion";
import { ChevronDown, MessageCircle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ligaLogoWhite from "@/assets/liga-logo-white.png";
import ligaLogoDark from "@/assets/liga-logo-gold.png";
import { CarouselPhoto } from "@/hooks/useMinisiteCarousel";
import { MinisiteTheme } from "@/components/minisite/MinisiteThemeProvider";
import { cn } from "@/lib/utils";

interface ActionButton {
  id?: string;
  label: string;
  url: string;
  icon: string;
  isPrimary: boolean;
}

interface MinisitePreviewProps {
  businessName: string;
  niche?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  actionButtons: ActionButton[];
  aboutPhotoUrl?: string | null;
  aboutVideoUrl?: string | null;
  aboutText?: string | null;
  whatsappNumber?: string | null;
  slug?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  carouselPhotos?: CarouselPhoto[];
  carouselLayout?: "carousel" | "pinterest";
  theme?: MinisiteTheme;
}

export function MinisitePreview({
  businessName,
  niche,
  bio,
  avatarUrl,
  coverUrl,
  actionButtons,
  aboutPhotoUrl,
  aboutVideoUrl,
  aboutText,
  whatsappNumber,
  slug,
  headline,
  subheadline,
  carouselPhotos = [],
  carouselLayout = "carousel",
  theme = "dark",
}: MinisitePreviewProps) {
  const primaryButtons = actionButtons.filter(b => b.isPrimary && b.label.trim());
  const secondaryButtons = actionButtons.filter(b => !b.isPrimary && b.label.trim());
  
  const isEditorial = theme === "editorial";
  const ligaLogo = isEditorial ? ligaLogoDark : ligaLogoWhite;

  // Conditional classes based on theme
  const overlayClasses = isEditorial
    ? "bg-gradient-to-b from-black/50 via-black/30 to-[hsl(40_33%_94%)]"
    : "bg-gradient-to-b from-black/60 via-black/40 to-background";
  
  const fallbackBgClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)/20] via-background to-[hsl(37_52%_41%)/20]"
    : "bg-gradient-to-br from-primary/20 via-background to-secondary/20";
  
  const avatarGlowClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)] via-[hsl(43_60%_71%)/50] to-[hsl(37_52%_41%)]"
    : "bg-gradient-to-br from-primary via-primary/50 to-secondary";
  
  const avatarFallbackClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)] text-white"
    : "bg-gradient-to-br from-primary to-secondary text-primary-foreground";
  
  const badgeClasses = isEditorial
    ? "bg-[hsl(43_50%_57%)/15] text-[hsl(37_52%_41%)] border-[hsl(43_50%_57%)/30]"
    : "bg-primary/10 text-primary border-primary/20";
  
  const primaryBtnClasses = isEditorial
    ? "bg-gradient-to-r from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)]"
    : "bg-gradient-to-r from-primary to-primary/80";
  
  const underlineClasses = isEditorial
    ? "bg-gradient-to-r from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)]"
    : "bg-gradient-to-r from-primary to-secondary";
  
  const sectionBgClasses = isEditorial
    ? "bg-[hsl(35_30%_92%)/30]"
    : "bg-muted/30";
  
  const ctaBtnClasses = isEditorial
    ? "bg-gradient-to-r from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)]"
    : "bg-gradient-to-r from-primary to-primary/80";

  return (
    <div className={cn(
      "h-full overflow-auto rounded-xl border border-border/50 shadow-2xl bg-background",
      isEditorial && "minisite-editorial-theme"
    )}>
      {/* URL Preview Bar */}
      <div className="sticky top-0 z-20 bg-muted/80 backdrop-blur-sm border-b border-border/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 bg-background/60 rounded-md px-2 py-1 text-[10px] text-muted-foreground truncate">
            /p/{slug || "seu-slug"}
          </div>
        </div>
      </div>

      {/* Mobile Frame */}
      <div className="relative min-h-full">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden">
          {/* Background */}
          {coverUrl ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${coverUrl})` }}
              />
              <div className={`absolute inset-0 ${overlayClasses}`} />
            </>
          ) : (
            <div className={`absolute inset-0 ${fallbackBgClasses}`} />
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 py-8 max-w-sm mx-auto">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className={`absolute -inset-2 rounded-full blur-lg opacity-60 ${avatarGlowClasses}`} />
              <Avatar className="relative h-20 w-20 border-2 border-background">
                <AvatarImage src={avatarUrl || undefined} className="object-cover" />
                <AvatarFallback className={`text-2xl font-bold ${avatarFallbackClasses}`}>
                  {businessName?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Custom Headline or Business Name */}
            <h1 className={cn(
              "text-xl font-bold text-foreground mb-2",
              isEditorial && "font-editorial"
            )}>
              {headline || businessName || "Seu Estúdio"}
            </h1>

            {/* Custom Subheadline */}
            {subheadline && (
              <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mb-3">
                {subheadline}
              </p>
            )}

            {/* Niche (if no custom subheadline) */}
            {!subheadline && niche && (
              <Badge variant="secondary" className={`mb-3 text-xs ${badgeClasses}`}>
                {niche}
              </Badge>
            )}

            {/* Bio */}
            {bio && !subheadline && (
              <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mb-4">
                {bio}
              </p>
            )}

            {/* Action Buttons Preview */}
            {(primaryButtons.length > 0 || secondaryButtons.length > 0) && (
              <div className="w-full max-w-xs space-y-2">
                {primaryButtons.map((button, i) => (
                  <div
                    key={button.id || i}
                    className={`w-full h-10 text-white rounded-lg flex items-center justify-center text-sm font-medium gap-2 ${primaryBtnClasses}`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {button.label}
                  </div>
                ))}
                {secondaryButtons.length > 0 && (
                  <div className={`grid gap-2 ${secondaryButtons.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {secondaryButtons.map((button, i) => (
                      <div
                        key={button.id || i}
                        className="h-9 border border-border/50 bg-background/50 rounded-lg flex items-center justify-center text-xs font-medium gap-1"
                      >
                        {button.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-muted-foreground">
            <span className="text-[8px] uppercase tracking-widest">Explorar</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </div>
        </section>

        {/* Carousel Section Preview */}
        {carouselPhotos.length > 0 && (
          <section className="py-6 overflow-hidden">
            {carouselLayout === "carousel" ? (
              <div className="flex gap-2 animate-scroll">
                {carouselPhotos.slice(0, 5).map((photo, i) => (
                  <div
                    key={photo.id || i}
                    className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={photo.thumbnail_url || photo.file_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 grid grid-cols-3 gap-1">
                {carouselPhotos.slice(0, 6).map((photo, i) => (
                  <div
                    key={photo.id || i}
                    className={`rounded-lg overflow-hidden bg-muted ${i % 3 === 1 ? 'row-span-2' : ''}`}
                    style={{ aspectRatio: i % 3 === 1 ? '3/5' : '1/1' }}
                  >
                    <img
                      src={photo.thumbnail_url || photo.file_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Portfolio Section Preview */}
        <section className="py-8 px-4">
          <div className="text-center mb-6">
            <h2 className={cn(
              "text-lg font-bold text-foreground mb-1",
              isEditorial && "font-editorial"
            )}>Portfólio</h2>
            <div className={`w-12 h-0.5 rounded-full mx-auto ${underlineClasses}`} />
          </div>
          
          {/* Placeholder Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted/50 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">Galeria {i}</span>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        {(aboutPhotoUrl || aboutVideoUrl || aboutText) && (
          <section className={`py-8 px-4 ${sectionBgClasses}`}>
            <div className="text-center mb-6">
              <h2 className={cn(
                "text-lg font-bold text-foreground mb-1",
                isEditorial && "font-editorial"
              )}>Sobre</h2>
              <div className={`w-12 h-0.5 rounded-full mx-auto ${underlineClasses}`} />
            </div>

            <div className={`grid gap-4 ${(aboutPhotoUrl || aboutVideoUrl) && aboutText ? 'md:grid-cols-2' : ''}`}>
              {(aboutPhotoUrl || aboutVideoUrl) && (
                <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                  {aboutPhotoUrl ? (
                    <img src={aboutPhotoUrl} alt="Sobre" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-xs">Vídeo</span>
                    </div>
                  )}
                </div>
              )}
              {aboutText && (
                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-6">
                  {aboutText}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Contact Section - All users have full access */}
        <section className="py-8 px-4">
          <div className="text-center">
            <h2 className={cn(
              "text-lg font-bold text-foreground mb-2",
              isEditorial && "font-editorial"
            )}>Vamos Conversar?</h2>
            <p className="text-muted-foreground text-xs mb-4">
              Estou à disposição para tirar suas dúvidas.
            </p>
            
            <div className="space-y-2 max-w-xs mx-auto">
              <div className={`h-10 text-white rounded-xl flex items-center justify-center text-sm font-medium gap-2 ${ctaBtnClasses}`}>
                <Sparkles className="h-4 w-4" />
                Falar com a Luma
              </div>
              {whatsappNumber && (
                <div className="h-9 border border-green-500/30 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center text-xs font-medium gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Direto
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-4 px-4 border-t border-border/50">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 opacity-50">
              <span className="text-[8px] text-muted-foreground">Powered by</span>
              <img src={ligaLogo} alt="Liga" className="h-3" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
