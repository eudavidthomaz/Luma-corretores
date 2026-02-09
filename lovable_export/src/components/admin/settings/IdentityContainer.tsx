import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, Phone, Building2, Bot, Calendar, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdentityContainerProps {
  // Luma Profile
  lumaAvatarUrl?: string;
  lumaStatus: string;
  lumaInitialMessage: string;
  isUploadingLumaAvatar: boolean;
  onLumaStatusChange: (status: string) => void;
  onLumaMessageChange: (message: string) => void;
  onLumaAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Studio Identity
  studioAvatarUrl?: string;
  businessName: string;
  niche: string;
  whatsappNumber: string;
  isUploadingStudioAvatar: boolean;
  onBusinessNameChange: (value: string) => void;
  onNicheChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onStudioAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Google Calendar
  isCalendarConnected: boolean;
  isCalendarLoading: boolean;
  onCalendarConnect: () => void;
  onCalendarDisconnect: () => void;
}

export function IdentityContainer({
  lumaAvatarUrl,
  lumaStatus,
  lumaInitialMessage,
  isUploadingLumaAvatar,
  onLumaStatusChange,
  onLumaMessageChange,
  onLumaAvatarChange,
  studioAvatarUrl,
  businessName,
  niche,
  whatsappNumber,
  isUploadingStudioAvatar,
  onBusinessNameChange,
  onNicheChange,
  onWhatsappChange,
  onStudioAvatarChange,
  isCalendarConnected,
  isCalendarLoading,
  onCalendarConnect,
  onCalendarDisconnect,
}: IdentityContainerProps) {
  const lumaFileInputRef = useRef<HTMLInputElement>(null);
  const studioFileInputRef = useRef<HTMLInputElement>(null);

  const isOnline = lumaStatus.toLowerCase().includes("online");

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-luma-glass-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary flex-shrink-0" />
          Identidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* === LUMA PROFILE SECTION === */}
        <div className="space-y-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Assistente Luma
          </Label>

          {/* Avatar with status ring */}
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div
                className={cn(
                  "absolute -inset-1 rounded-full",
                  isOnline
                    ? "ring-2 ring-green-500 ring-offset-2 ring-offset-background"
                    : "ring-2 ring-muted ring-offset-2 ring-offset-background"
                )}
              />
              <Avatar className="h-14 w-14 relative">
                <AvatarImage src={lumaAvatarUrl} />
                <AvatarFallback className="bg-gradient-primary text-lg font-bold">
                  L
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 rounded-full h-6 w-6"
                onClick={() => lumaFileInputRef.current?.click()}
                disabled={isUploadingLumaAvatar}
              >
                {isUploadingLumaAvatar ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </Button>
              <input
                ref={lumaFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onLumaAvatarChange}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <Input
                value={lumaStatus}
                onChange={(e) => onLumaStatusChange(e.target.value)}
                placeholder="Online"
                className="h-9 text-sm"
              />
              <span className="text-xs text-muted-foreground block">
                Status exibido no chat
              </span>
            </div>
          </div>

          {/* Initial message */}
          <div className="space-y-2">
            <Label className="text-xs">Mensagem de Boas-vindas</Label>
            <Textarea
              value={lumaInitialMessage}
              onChange={(e) => onLumaMessageChange(e.target.value)}
              placeholder="Olá! Sou a Luma ✨"
              className="min-h-[70px] text-sm resize-none whitespace-normal break-words"
            />
          </div>
        </div>

        <Separator className="bg-luma-glass-border" />

        {/* === STUDIO IDENTITY SECTION === */}
        <div className="space-y-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            Imobiliária / Escritório
          </Label>

          {/* Studio Avatar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={studioAvatarUrl} />
                <AvatarFallback className="bg-muted text-sm font-medium">
                  {businessName?.charAt(0) || "E"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 rounded-full h-5 w-5"
                onClick={() => studioFileInputRef.current?.click()}
                disabled={isUploadingStudioAvatar}
              >
                {isUploadingStudioAvatar ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ) : (
                  <Camera className="h-2.5 w-2.5" />
                )}
              </Button>
              <input
                ref={studioFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onStudioAvatarChange}
              />
            </div>
            <span className="text-xs text-muted-foreground">Logo / Foto</span>
          </div>

          {/* Studio Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome da Empresa</Label>
              <Input
                value={businessName}
                onChange={(e) => onBusinessNameChange(e.target.value)}
                placeholder="Sua imobiliária"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Especialidade</Label>
              <Input
                value={niche}
                onChange={(e) => onNicheChange(e.target.value)}
                placeholder="Ex: Alto Padrão, Lançamentos"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Phone className="h-3 w-3 flex-shrink-0" />
                WhatsApp
              </Label>
              <Input
                value={whatsappNumber}
                onChange={(e) => onWhatsappChange(e.target.value)}
                placeholder="+55 11 99999-9999"
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-luma-glass-border" />

        {/* === GOOGLE CALENDAR SECTION === */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            Integração
          </Label>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  isCalendarConnected ? "bg-green-500/20" : "bg-muted"
                )}
              >
                <Calendar className={cn(
                  "h-4 w-4",
                  isCalendarConnected ? "text-green-500" : "text-muted-foreground"
                )} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">Google Agenda</p>
                <p className="text-xs text-muted-foreground">
                  {isCalendarConnected ? "Sincronizado" : "Desconectado"}
                </p>
              </div>
            </div>

            {isCalendarConnected ? (
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-500 border-green-500/30 gap-1 flex-shrink-0"
              >
                <Check className="h-3 w-3" />
                Ativo
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onCalendarConnect}
                disabled={isCalendarLoading}
                className="gap-1.5 flex-shrink-0"
              >
                {isCalendarLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5" />
                )}
                Conectar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
