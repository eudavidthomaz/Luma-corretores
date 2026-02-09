import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Code, Copy, Check, Save, Globe, LayoutTemplate, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PLATFORM_DOMAIN = "https://ligadafotografia.com";

interface TechnicalContainerProps {
  userId?: string;
  customDomain: string;
  showStoryCarousel: boolean;
  showCategoryChips: boolean;
  onDomainChange: (domain: string) => void;
  onSaveDomain: (domain: string) => void;
  onStoryCarouselChange: (value: boolean) => void;
  onCategoryChipsChange: (value: boolean) => void;
}

export function TechnicalContainer({
  userId,
  customDomain,
  showStoryCarousel,
  showCategoryChips,
  onDomainChange,
  onSaveDomain,
  onStoryCarouselChange,
  onCategoryChipsChange,
}: TechnicalContainerProps) {
  const [copied, setCopied] = useState(false);

  const widgetCode = userId
    ? `<script src="${PLATFORM_DOMAIN}/widget.js" data-user="${userId}"></script>`
    : null;

  const handleCopy = () => {
    if (!widgetCode) return;
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    toast({ title: "Código copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!userId) return null;

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-luma-glass-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Code className="h-4 w-4 text-violet-400 flex-shrink-0" />
          Instalação & Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* === WIDGET EMBED SECTION === */}
        <div className="space-y-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Widget do Site
          </Label>

          {/* Script with Copy button */}
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-7 text-xs gap-1 z-10 flex-shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copiar
                </>
              )}
            </Button>
            <pre className="bg-black/50 border border-luma-glass-border p-3 pt-10 rounded-lg text-xs font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {widgetCode}
            </pre>
          </div>

          <p className="text-xs text-muted-foreground">
            Cole antes do{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-foreground">
              &lt;/body&gt;
            </code>
          </p>

          {/* Domain input */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5">
              <Globe className="h-3 w-3 flex-shrink-0" />
              Domínio do Site
            </Label>
            <div className="flex gap-2">
              <Input
                value={customDomain}
                onChange={(e) => onDomainChange(e.target.value)}
                placeholder="seusite.com.br"
                className="text-sm h-9 flex-1 min-w-0"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 flex-shrink-0"
                onClick={() => onSaveDomain(customDomain)}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Widget só funciona neste domínio
            </p>
          </div>
        </div>

        <Separator className="bg-luma-glass-border" />

        {/* === CHAT SETTINGS SECTION === */}
        <div className="space-y-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
            Interface do Chat
          </Label>

          <div className="space-y-3">
            {/* Story Carousel Toggle */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <LayoutTemplate className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Carrossel de Histórias</p>
                  <p className="text-xs text-muted-foreground">Exibir no chat</p>
                </div>
              </div>
              <Switch
                checked={showStoryCarousel}
                onCheckedChange={onStoryCarouselChange}
                className="flex-shrink-0"
              />
            </div>

            {/* Category Chips Toggle */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Chips de Categorias</p>
                  <p className="text-xs text-muted-foreground">Botões rápidos</p>
                </div>
              </div>
              <Switch
                checked={showCategoryChips}
                onCheckedChange={onCategoryChipsChange}
                className="flex-shrink-0"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
