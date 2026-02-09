import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface LumaProfileCardProps {
  lumaAvatarUrl?: string;
  lumaStatus: string;
  lumaInitialMessage: string;
  isUploadingAvatar: boolean;
  onStatusChange: (status: string) => void;
  onMessageChange: (message: string) => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LumaProfileCard({
  lumaAvatarUrl,
  lumaStatus,
  lumaInitialMessage,
  isUploadingAvatar,
  onStatusChange,
  onMessageChange,
  onAvatarChange,
}: LumaProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const isOnline = lumaStatus.toLowerCase().includes("online");

  return (
    <Card className="bento-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Perfil da Assistente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar with status ring */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={cn(
                "absolute -inset-1 rounded-full",
                isOnline
                  ? "ring-2 ring-green-500 ring-offset-2 ring-offset-background"
                  : "ring-2 ring-muted ring-offset-2 ring-offset-background"
              )}
            />
            <Avatar className="h-16 w-16 relative">
              <AvatarImage src={lumaAvatarUrl} />
              <AvatarFallback className="bg-gradient-primary text-lg font-bold">
                L
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon-sm"
              variant="gradient"
              className="absolute -bottom-1 -right-1 rounded-full h-6 w-6"
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Input
              value={lumaStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              placeholder="Online"
              className="h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground">
              Status exibido no chat
            </span>
          </div>
        </div>

        {/* Initial message */}
        <div className="space-y-2">
          <Label className="text-xs">Mensagem de Boas-vindas</Label>
          <Textarea
            value={lumaInitialMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Olá! Sou a Luma ✨"
            className="min-h-[60px] text-sm resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
