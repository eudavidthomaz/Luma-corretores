import { motion } from "framer-motion";
import { Rows3, LayoutGrid } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LayoutSelectorProps {
  value: 'carousel' | 'pinterest';
  onChange: (value: 'carousel' | 'pinterest') => void;
}

const layouts = [
  {
    value: 'carousel' as const,
    label: 'Carrossel',
    description: 'Animação lateral automática',
    icon: Rows3,
  },
  {
    value: 'pinterest' as const,
    label: 'Pinterest',
    description: 'Grid masonry adaptativo',
    icon: LayoutGrid,
  },
];

export function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Estilo de Exibição</Label>
      <div className="grid grid-cols-2 gap-3">
        {layouts.map((layout) => (
          <motion.button
            key={layout.value}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(layout.value)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              value === layout.value
                ? "border-primary bg-primary/10"
                : "border-border/50 bg-muted/30 hover:border-primary/50"
            )}
          >
            <layout.icon className={cn(
              "h-6 w-6",
              value === layout.value ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="text-center">
              <p className={cn(
                "text-sm font-medium",
                value === layout.value ? "text-primary" : "text-foreground"
              )}>
                {layout.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {layout.description}
              </p>
            </div>
            
            {value === layout.value && (
              <motion.div
                layoutId="layout-indicator"
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
