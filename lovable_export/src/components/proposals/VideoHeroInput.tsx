import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Video, AlertCircle, CheckCircle2 } from "lucide-react";
import { getEmbedUrl, getVideoProvider, isValidVideoUrl } from "@/lib/videoUtils";

interface VideoHeroInputProps {
  value: string;
  onChange: (url: string) => void;
}

export function VideoHeroInput({ value, onChange }: VideoHeroInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const embedUrl = getEmbedUrl(value);
  const provider = getVideoProvider(value);
  const isValid = isValidVideoUrl(value);
  
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };
  
  const getProviderLabel = () => {
    switch (provider) {
      case 'youtube': return 'YouTube';
      case 'vimeo': return 'Vimeo';
      case 'wistia': return 'Wistia';
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Vídeo de Capa (Showreel)
        </Label>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
            className="glass border-luma-glass-border pr-24"
          />
          {inputValue && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    {getProviderLabel()}
                  </Badge>
                </>
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Cole o link do YouTube, Vimeo ou Wistia. O vídeo será exibido na capa da proposta.
        </p>
      </div>
      
      {/* Video Preview */}
      {embedUrl && (
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Preview</Label>
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-luma-glass-border bg-black/20">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video Preview"
            />
          </div>
        </div>
      )}
      
      {inputValue && !isValid && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>URL não reconhecida. Use links do YouTube, Vimeo ou Wistia.</span>
        </div>
      )}
    </div>
  );
}
