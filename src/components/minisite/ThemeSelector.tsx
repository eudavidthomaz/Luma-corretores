import { motion } from "framer-motion";
import { Moon, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MinisiteTheme } from "./MinisiteThemeProvider";

interface ThemeSelectorProps {
  value: MinisiteTheme;
  onChange: (value: MinisiteTheme) => void;
}

const themes = [
  {
    value: 'dark' as const,
    label: 'Dark Mode',
    description: 'Moderno e elegante',
    icon: Moon,
    preview: {
      bg: 'bg-[#0a0a0a]',
      accent: 'bg-primary',
    }
  },
  {
    value: 'editorial' as const,
    label: 'Luxury Editorial',
    description: 'Clássico e sofisticado',
    icon: Sparkles,
    preview: {
      bg: 'bg-[#f0ebe0]',
      accent: 'bg-[#c9a962]',
    }
  },
];

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Estilo Visual</Label>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <motion.button
            key={theme.value}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(theme.value)}
            className={cn(
              "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
              value === theme.value
                ? "border-primary bg-primary/10"
                : "border-border/50 bg-muted/30 hover:border-primary/50"
            )}
          >
            {/* Theme Preview */}
            <div className={cn(
              "w-full h-16 rounded-lg overflow-hidden relative",
              theme.preview.bg
            )}>
              {/* Mini preview elements */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2">
                <div className={cn(
                  "w-6 h-6 rounded-full",
                  theme.preview.accent
                )} />
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 space-y-1">
                <div className={cn(
                  "w-16 h-1.5 rounded",
                  theme.value === 'dark' ? 'bg-white/80' : 'bg-[#1a1815]/80'
                )} />
                <div className={cn(
                  "w-12 h-1 rounded mx-auto",
                  theme.value === 'dark' ? 'bg-white/40' : 'bg-[#1a1815]/40'
                )} />
              </div>
            </div>

            {/* Theme Icon & Label */}
            <div className="flex items-center gap-2">
              <theme.icon className={cn(
                "h-4 w-4",
                value === theme.value ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-left">
                <p className={cn(
                  "text-sm font-medium",
                  value === theme.value ? "text-primary" : "text-foreground"
                )}>
                  {theme.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {theme.description}
                </p>
              </div>
            </div>
            
            {/* Selection Indicator */}
            {value === theme.value && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
