import { motion } from "framer-motion";
import { 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Mail, 
  Phone, 
  ExternalLink, 
  Calendar, 
  Tag, 
  MapPin,
  Youtube,
  Twitter,
  Linkedin,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MinisiteTheme } from "@/components/minisite/MinisiteThemeProvider";

export interface ActionButton {
  label: string;
  url: string;
  icon: string;
  isPrimary?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  email: Mail,
  phone: Phone,
  link: ExternalLink,
  calendar: Calendar,
  tag: Tag,
  map: MapPin,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  globe: Globe,
};

interface ActionButtonsProps {
  buttons: ActionButton[];
  variant?: "default" | "compact";
  theme?: MinisiteTheme;
}

export function ActionButtons({ buttons, variant = "default", theme = 'dark' }: ActionButtonsProps) {
  if (buttons.length === 0) return null;

  const isEditorial = theme === 'editorial';

  const handleClick = (url: string) => {
    if (url.includes("wa.me") || url.includes("whatsapp")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (url.startsWith("mailto:") || url.startsWith("tel:")) {
      window.location.href = url;
    } else if (url.startsWith("#")) {
      const element = document.querySelector(url);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const primaryButtons = buttons.filter(b => b.isPrimary);
  const secondaryButtons = buttons.filter(b => !b.isPrimary);

  // Conditional classes based on theme
  const primaryBtnClasses = isEditorial
    ? "bg-gradient-to-r from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)] hover:from-[hsl(43_50%_52%)] hover:to-[hsl(37_52%_36%)] shadow-lg shadow-[hsl(43_50%_57%)/30]"
    : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30";

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Primary Buttons */}
      {primaryButtons.map((button, index) => {
        const IconComponent = iconMap[button.icon] || ExternalLink;
        return (
          <motion.div
            key={`primary-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={() => handleClick(button.url)}
              className={`w-full h-12 text-white rounded-xl text-base font-semibold gap-3 ${primaryBtnClasses}`}
            >
              <IconComponent className="h-5 w-5" />
              {button.label}
            </Button>
          </motion.div>
        );
      })}

      {/* Secondary Buttons Grid */}
      {secondaryButtons.length > 0 && (
        <div className={`grid gap-2 ${secondaryButtons.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {secondaryButtons.map((button, index) => {
            const IconComponent = iconMap[button.icon] || ExternalLink;
            return (
              <motion.div
                key={`secondary-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (primaryButtons.length + index) * 0.1 }}
              >
                <Button
                  onClick={() => handleClick(button.url)}
                  variant="outline"
                  className="w-full h-11 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50 rounded-xl text-sm font-medium gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {button.label}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
