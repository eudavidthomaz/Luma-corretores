import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ActionButtons, ActionButton } from "./ActionButtons";
import { MinisiteTheme } from "@/components/minisite/MinisiteThemeProvider";
import { cn } from "@/lib/utils";
interface HeroSectionProps {
  businessName: string;
  niche?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  actionButtons?: ActionButton[];
  onScrollDown?: () => void;
  headline?: string | null;
  subheadline?: string | null;
  theme?: MinisiteTheme;
}

export function HeroSection({
  businessName,
  niche,
  bio,
  avatarUrl,
  coverUrl,
  actionButtons = [],
  onScrollDown,
  headline,
  subheadline,
  theme = 'dark',
}: HeroSectionProps) {
  const displayTitle = headline || businessName;
  const displaySubtitle = subheadline || bio;
  const showNicheBadge = !subheadline && niche;
  
  const isEditorial = theme === 'editorial';

  // Conditional classes based on theme
  const overlayClasses = isEditorial
    ? "bg-gradient-to-b from-black/50 via-black/30 to-[hsl(40_33%_94%)]"
    : "bg-gradient-to-b from-black/60 via-black/40 to-background";
  
  const fallbackBgClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)/20] via-background to-[hsl(37_52%_41%)/20]"
    : "bg-gradient-to-br from-primary/20 via-background to-secondary/20";
  
  const glowOuterClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)] via-[hsl(43_60%_71%)/50] to-[hsl(37_52%_41%)] blur-xl opacity-50"
    : "bg-gradient-to-br from-primary via-primary/50 to-secondary blur-xl opacity-60 animate-pulse";
  
  const glowRingClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)]"
    : "bg-gradient-to-br from-primary to-secondary";
  
  const avatarFallbackClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)] text-white"
    : "bg-gradient-to-br from-primary to-secondary text-primary-foreground";
  
  const badgeClasses = isEditorial
    ? "bg-[hsl(43_50%_57%)/15] text-[hsl(37_52%_41%)] border-[hsl(43_50%_57%)/30] backdrop-blur-sm"
    : "bg-primary/10 text-primary border-primary/20 backdrop-blur-sm";

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Cover Image */}
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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6 py-12 max-w-2xl mx-auto"
      >
        {/* Avatar with Glow */}
        <div className="relative mb-6">
          <div className={`absolute -inset-3 rounded-full ${glowOuterClasses}`} />
          <div className={`absolute -inset-1 rounded-full ${glowRingClasses}`} />
          <Avatar className="relative h-32 w-32 md:h-40 md:w-40 border-4 border-background">
            <AvatarImage src={avatarUrl || undefined} className="object-cover" />
            <AvatarFallback className={`text-4xl md:text-5xl font-bold ${avatarFallbackClasses}`}>
              {businessName?.charAt(0) || "S"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Title (Custom Headline or Business Name) */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={cn(
            "text-3xl md:text-5xl font-bold text-foreground mb-3 tracking-tight",
            isEditorial && "font-editorial"
          )}
        >
          {displayTitle}
        </motion.h1>

        {/* Niche Badge - Only if no custom subheadline */}
        {showNicheBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Badge 
              variant="secondary" 
              className={`mb-4 px-4 py-1.5 text-sm ${badgeClasses}`}
            >
              {niche}
            </Badge>
          </motion.div>
        )}

        {/* Subtitle (Custom Subheadline or Bio) */}
        {displaySubtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mb-8"
          >
            {displaySubtitle}
          </motion.p>
        )}

        {/* Action Buttons */}
        {actionButtons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-full max-w-sm"
          >
            <ActionButtons buttons={actionButtons} theme={theme} />
          </motion.div>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      {onScrollDown && (
        <motion.button
          onClick={onScrollDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Explorar</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.button>
      )}
    </section>
  );
}
