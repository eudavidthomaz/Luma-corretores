import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileEdit, Film, Palette, FolderOpen } from "lucide-react";

export type ItemCategory = "pre_production" | "production" | "post_production" | null;

interface ItemCategorySelectorProps {
  value: ItemCategory;
  onChange: (category: ItemCategory) => void;
}

const CATEGORIES = [
  { 
    value: "pre_production", 
    label: "Pré-Produção", 
    description: "Roteiro, Storyboard, Locação",
    icon: FileEdit,
    color: "text-blue-400"
  },
  { 
    value: "production", 
    label: "Produção", 
    description: "Diárias, Equipamento, Equipe",
    icon: Film,
    color: "text-amber-400"
  },
  { 
    value: "post_production", 
    label: "Pós-Produção", 
    description: "Edição, Color, Áudio, VFX",
    icon: Palette,
    color: "text-purple-400"
  },
];

export function ItemCategorySelector({ value, onChange }: ItemCategorySelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-muted-foreground text-sm">
        <FolderOpen className="h-3.5 w-3.5" />
        Categoria
      </Label>
      <Select 
        value={value || "none"} 
        onValueChange={(val) => onChange(val === "none" ? null : val as ItemCategory)}
      >
        <SelectTrigger className="glass border-luma-glass-border">
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span>Sem categoria</span>
            </div>
          </SelectItem>
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${category.color}`} />
                  <span>{category.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export function getCategoryLabel(category: string | null): string {
  switch (category) {
    case "pre_production": return "Pré-Produção";
    case "production": return "Produção";
    case "post_production": return "Pós-Produção";
    default: return "";
  }
}

export function getCategoryIcon(category: string | null) {
  switch (category) {
    case "pre_production": return FileEdit;
    case "production": return Film;
    case "post_production": return Palette;
    default: return FolderOpen;
  }
}

export function getCategoryColor(category: string | null): string {
  switch (category) {
    case "pre_production": return "text-blue-400";
    case "production": return "text-amber-400";
    case "post_production": return "text-purple-400";
    default: return "text-muted-foreground";
  }
}
