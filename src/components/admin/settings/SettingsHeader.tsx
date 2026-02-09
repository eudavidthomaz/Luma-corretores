import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Crown, Loader2, Sparkles } from "lucide-react";

interface SettingsHeaderProps {
  planName: string;
  isSaving: boolean;
  onSave: () => void;
}

export function SettingsHeader({ planName, isSaving, onSave }: SettingsHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Luma</h1>
          <p className="text-sm text-muted-foreground">Configure sua assistente</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge className="bg-primary/20 text-primary border-primary/30">
          <Crown className="h-3 w-3 mr-1" />
          Plano {planName}
        </Badge>
        
        <Button variant="gradient" onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
