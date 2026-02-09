import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MessageCircle } from "lucide-react";

interface ChatSettingsCardProps {
  showStoryCarousel: boolean;
  showCategoryChips: boolean;
  onStoryCarouselChange: (value: boolean) => void;
  onCategoryChipsChange: (value: boolean) => void;
}

export function ChatSettingsCard({
  showStoryCarousel,
  showCategoryChips,
  onStoryCarouselChange,
  onCategoryChipsChange,
}: ChatSettingsCardProps) {
  return (
    <Card className="bento-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Config. do Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Stories</p>
            <p className="text-xs text-muted-foreground">Carrossel no chat</p>
          </div>
          <Switch
            checked={showStoryCarousel}
            onCheckedChange={onStoryCarouselChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Categorias</p>
            <p className="text-xs text-muted-foreground">Chips de filtro</p>
          </div>
          <Switch
            checked={showCategoryChips}
            onCheckedChange={onCategoryChipsChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
