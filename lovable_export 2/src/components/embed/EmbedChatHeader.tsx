import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, Minus } from "lucide-react";
import lumaLogoWhite from "@/assets/luma-logo-white.png";

interface EmbedChatHeaderProps {
  photographerName: string;
  avatarUrl?: string;
  status?: string;
  onClose?: () => void;
  onMinimize?: () => void;
}

export function EmbedChatHeader({
  photographerName,
  avatarUrl,
  status = "Online",
  onClose,
  onMinimize,
}: EmbedChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-primary/30">
            <AvatarImage src={avatarUrl} alt={photographerName} />
            <AvatarFallback className="bg-gradient-primary">
              <img src={lumaLogoWhite} alt="Luma" className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">
            {photographerName}
          </span>
          <span className="text-xs text-muted-foreground">{status}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMinimize}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
