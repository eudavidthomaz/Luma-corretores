import { Camera, Clapperboard } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";

export type ProposalType = 'photo' | 'video';

interface ProposalTypeSelectorProps {
  value: ProposalType;
  onChange: (value: ProposalType) => void;
  disabled?: boolean;
}

export function ProposalTypeSelector({ 
  value, 
  onChange, 
  disabled = false 
}: ProposalTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">
        Tipo de Proposta
      </Label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(newValue) => {
          if (newValue) {
            onChange(newValue as ProposalType);
          }
        }}
        disabled={disabled}
        className="justify-start gap-2"
      >
        <ToggleGroupItem 
          value="photo" 
          className="flex items-center gap-2 px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          aria-label="Fotografia"
        >
          <Camera className="h-4 w-4" />
          <span>Fotografia</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="video" 
          className="flex items-center gap-2 px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          aria-label="Vídeo"
        >
          <Clapperboard className="h-4 w-4" />
          <span>Vídeo</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
