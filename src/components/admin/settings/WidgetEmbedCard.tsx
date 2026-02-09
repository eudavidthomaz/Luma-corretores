import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code, Copy, Check, Save, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PLATFORM_DOMAIN = "https://ligadafotografia.com";

interface WidgetEmbedCardProps {
  userId?: string;
  customDomain: string;
  onDomainChange: (domain: string) => void;
  onSaveDomain: (domain: string) => void;
}

export function WidgetEmbedCard({
  userId,
  customDomain,
  onDomainChange,
  onSaveDomain,
}: WidgetEmbedCardProps) {
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
    <Card className="bento-card border-violet-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Code className="h-4 w-4 text-violet-400" />
          Widget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Script with Copy button */}
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-1 right-1 h-7 text-xs gap-1"
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
          <pre className="bg-black/40 border border-violet-500/20 p-3 pr-20 rounded-lg text-xs font-mono overflow-x-auto text-muted-foreground">
            {widgetCode}
          </pre>
        </div>

        <p className="text-xs text-muted-foreground">
          Cole antes do <code className="bg-muted px-1 py-0.5 rounded">&lt;/body&gt;</code>
        </p>

        {/* Domain input */}
        <div className="space-y-2 pt-3 border-t border-luma-glass-border">
          <Label className="text-xs flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            Domínio do Site
          </Label>
          <div className="flex gap-2">
            <Input
              value={customDomain}
              onChange={(e) => onDomainChange(e.target.value)}
              placeholder="seusite.com.br"
              className="text-sm h-8"
            />
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onSaveDomain(customDomain)}
            >
              <Save className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Widget só funciona neste domínio
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
