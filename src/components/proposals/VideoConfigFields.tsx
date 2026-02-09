import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { 
  RefreshCw, 
  Monitor, 
  Smartphone, 
  Square, 
  Clock,
  Film
} from "lucide-react";

interface VideoConfigFieldsProps {
  revisionLimit: number;
  onRevisionLimitChange: (value: number) => void;
  deliveryFormats: string[];
  onDeliveryFormatsChange: (formats: string[]) => void;
  estimatedDurationMin: number | null;
  onEstimatedDurationChange: (value: number | null) => void;
  projectFormat: string;
  onProjectFormatChange: (value: string) => void;
}

const DELIVERY_FORMAT_OPTIONS = [
  { value: "16:9", label: "16:9 Horizontal", description: "YouTube, TV, Web", icon: Monitor },
  { value: "9:16", label: "9:16 Vertical", description: "Reels, TikTok, Stories", icon: Smartphone },
  { value: "1:1", label: "1:1 Quadrado", description: "Feed Instagram", icon: Square },
  { value: "4:5", label: "4:5 Portrait", description: "Posts Instagram", icon: Smartphone },
];

export function VideoConfigFields({
  revisionLimit,
  onRevisionLimitChange,
  deliveryFormats,
  onDeliveryFormatsChange,
  estimatedDurationMin,
  onEstimatedDurationChange,
  projectFormat,
  onProjectFormatChange,
}: VideoConfigFieldsProps) {
  
  const toggleFormat = (format: string) => {
    if (deliveryFormats.includes(format)) {
      onDeliveryFormatsChange(deliveryFormats.filter(f => f !== format));
    } else {
      onDeliveryFormatsChange([...deliveryFormats, format]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Revision Limit */}
      <Card className="glass border-luma-glass-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-base font-medium">Rodadas de Revisão Inclusas</Label>
                <p className="text-sm text-muted-foreground">
                  Defina quantas alterações estão incluídas no valor
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={revisionLimit}
                  onChange={(e) => onRevisionLimitChange(parseInt(e.target.value) || 0)}
                  className="glass border-luma-glass-border w-24 text-center text-lg font-semibold"
                />
                <span className="text-muted-foreground">revisões</span>
              </div>
              <p className="text-xs text-amber-500">
                ⚠️ Rodadas extras serão cobradas à parte
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Formats */}
      <Card className="glass border-luma-glass-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-base font-medium">Formatos de Entrega</Label>
                <p className="text-sm text-muted-foreground">
                  Marque todos os formatos que serão entregues
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {DELIVERY_FORMAT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isChecked = deliveryFormats.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isChecked 
                          ? "border-primary bg-primary/10" 
                          : "border-luma-glass-border hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleFormat(option.value)}
                      />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duration and Format */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass border-luma-glass-border">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duração Estimada
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={estimatedDurationMin || ""}
                  onChange={(e) => onEstimatedDurationChange(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="0"
                  className="glass border-luma-glass-border w-20 text-center"
                />
                <span className="text-muted-foreground">minutos</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Duração aproximada do vídeo final
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-luma-glass-border">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Formato do Projeto
              </Label>
              <Input
                value={projectFormat}
                onChange={(e) => onProjectFormatChange(e.target.value)}
                placeholder="Ex: 4K Horizontal, Full HD"
                className="glass border-luma-glass-border"
              />
              <p className="text-xs text-muted-foreground">
                Resolução e formato técnico
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
