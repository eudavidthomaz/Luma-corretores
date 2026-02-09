import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SystemInstructionsCardProps {
  aiContext: string;
  bio: string;
  onAiContextChange: (value: string) => void;
  onBioChange: (value: string) => void;
}

export function SystemInstructionsCard({
  aiContext,
  bio,
  onAiContextChange,
  onBioChange,
}: SystemInstructionsCardProps) {
  return (
    <Card className="bento-card border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span className="text-lg">🧠</span> Cérebro da Luma
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            IA
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code editor style textarea */}
        <div className="relative">
          <Textarea
            value={aiContext}
            onChange={(e) => onAiContextChange(e.target.value)}
            placeholder={`Exemplos de instruções:

• Sou fotógrafo de casamentos em São Paulo
• Não trabalho aos domingos
• Meu estilo é documental e espontâneo
• Preços começam em R$ 3.000 para ensaios
• Sempre pergunte a data e local primeiro`}
            className={cn(
              "min-h-[240px] resize-y",
              "font-mono text-sm",
              "bg-black/40 border-secondary/30",
              "focus:ring-secondary/50 focus:border-secondary/50",
              "placeholder:text-muted-foreground/50"
            )}
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-secondary/20 text-secondary text-xs">
              Markdown
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Quanto mais específico, melhor a Luma vai representar você.
        </p>

        {/* Bio as additional context */}
        <div className="space-y-2 pt-4 border-t border-luma-glass-border">
          <Label className="text-xs flex items-center gap-2">
            Bio do Estúdio
            <span className="text-muted-foreground">(visível para a IA)</span>
          </Label>
          <Textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="Conte sobre seu trabalho..."
            className="min-h-[80px] text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
