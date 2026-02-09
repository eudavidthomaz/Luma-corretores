import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Link2, ExternalLink, Palette, Music } from "lucide-react";
import { getEmbedUrl, getVideoProvider, getVideoThumbnailUrl } from "@/lib/videoUtils";

export interface ReferenceLink {
  url: string;
  title: string;
  description?: string;
}

export interface SoundtrackLink {
  url: string;
  title: string;
  artist?: string;
}

interface ReferencesEditorProps {
  referenceLinks: ReferenceLink[];
  onReferenceLinksChange: (links: ReferenceLink[]) => void;
  soundtrackLinks: SoundtrackLink[];
  onSoundtrackLinksChange: (links: SoundtrackLink[]) => void;
}

export function ReferencesEditor({
  referenceLinks,
  onReferenceLinksChange,
  soundtrackLinks,
  onSoundtrackLinksChange,
}: ReferencesEditorProps) {
  
  // Reference Links
  const addReferenceLink = () => {
    onReferenceLinksChange([...referenceLinks, { url: "", title: "", description: "" }]);
  };
  
  const updateReferenceLink = (index: number, updates: Partial<ReferenceLink>) => {
    const updated = referenceLinks.map((link, i) =>
      i === index ? { ...link, ...updates } : link
    );
    onReferenceLinksChange(updated);
  };
  
  const removeReferenceLink = (index: number) => {
    onReferenceLinksChange(referenceLinks.filter((_, i) => i !== index));
  };
  
  // Soundtrack Links
  const addSoundtrackLink = () => {
    onSoundtrackLinksChange([...soundtrackLinks, { url: "", title: "", artist: "" }]);
  };
  
  const updateSoundtrackLink = (index: number, updates: Partial<SoundtrackLink>) => {
    const updated = soundtrackLinks.map((link, i) =>
      i === index ? { ...link, ...updates } : link
    );
    onSoundtrackLinksChange(updated);
  };
  
  const removeSoundtrackLink = (index: number) => {
    onSoundtrackLinksChange(soundtrackLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Reference Links / Moodboard */}
      <Card className="glass border-luma-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5" />
            Moodboard / Referências
          </CardTitle>
          <CardDescription>
            Adicione vídeos de referência para alinhar o estilo visual com o cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {referenceLinks.map((link, index) => {
            const thumbnail = getVideoThumbnailUrl(link.url);
            const provider = getVideoProvider(link.url);
            
            return (
              <div key={index} className="p-4 rounded-xl border border-luma-glass-border bg-card/50 space-y-3">
                <div className="flex items-start gap-3">
                  {/* Thumbnail Preview */}
                  {thumbnail && (
                    <div className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
                      <img 
                        src={thumbnail} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={link.url}
                        onChange={(e) => updateReferenceLink(index, { url: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="glass border-luma-glass-border flex-1"
                      />
                      {link.url && (
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeReferenceLink(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        value={link.title}
                        onChange={(e) => updateReferenceLink(index, { title: e.target.value })}
                        placeholder="Título (ex: Comercial Nike 2024)"
                        className="glass border-luma-glass-border"
                      />
                      <Input
                        value={link.description || ""}
                        onChange={(e) => updateReferenceLink(index, { description: e.target.value })}
                        placeholder="Nota (ex: Estilo de edição rápida)"
                        className="glass border-luma-glass-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-dashed border-2 hover:bg-primary/5 hover:border-primary/50"
            onClick={addReferenceLink}
          >
            <Plus className="h-4 w-4" />
            Adicionar Referência
          </Button>
        </CardContent>
      </Card>

      {/* Soundtrack Links */}
      <Card className="glass border-luma-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Music className="h-5 w-5" />
            Trilhas Sonoras Sugeridas
          </CardTitle>
          <CardDescription>
            Adicione músicas para o cliente aprovar a vibe do projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {soundtrackLinks.map((link, index) => (
            <div key={index} className="p-4 rounded-xl border border-luma-glass-border bg-card/50 space-y-3">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={link.url}
                  onChange={(e) => updateSoundtrackLink(index, { url: e.target.value })}
                  placeholder="https://open.spotify.com/track/... ou YouTube"
                  className="glass border-luma-glass-border flex-1"
                />
                {link.url && (
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeSoundtrackLink(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={link.title}
                  onChange={(e) => updateSoundtrackLink(index, { title: e.target.value })}
                  placeholder="Título da música"
                  className="glass border-luma-glass-border"
                />
                <Input
                  value={link.artist || ""}
                  onChange={(e) => updateSoundtrackLink(index, { artist: e.target.value })}
                  placeholder="Artista"
                  className="glass border-luma-glass-border"
                />
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-dashed border-2 hover:bg-primary/5 hover:border-primary/50"
            onClick={addSoundtrackLink}
          >
            <Plus className="h-4 w-4" />
            Adicionar Trilha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
