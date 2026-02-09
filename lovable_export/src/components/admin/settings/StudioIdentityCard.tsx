import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Phone, Building2 } from "lucide-react";

interface StudioIdentityCardProps {
  avatarUrl?: string;
  businessName: string;
  niche: string;
  whatsappNumber: string;
  isUploadingAvatar: boolean;
  onBusinessNameChange: (value: string) => void;
  onNicheChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StudioIdentityCard({
  avatarUrl,
  businessName,
  niche,
  whatsappNumber,
  isUploadingAvatar,
  onBusinessNameChange,
  onNicheChange,
  onWhatsappChange,
  onAvatarChange,
}: StudioIdentityCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  return (
    <Card className="bento-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Identidade do Estúdio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-gradient-primary text-lg font-bold">
                {businessName?.charAt(0) || "L"}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon-sm"
              variant="gradient"
              className="absolute -bottom-1 -right-1 rounded-full h-5 w-5"
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              ) : (
                <Camera className="h-2.5 w-2.5" />
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
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Foto do estúdio</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do Estúdio</Label>
            <Input
              value={businessName}
              onChange={(e) => onBusinessNameChange(e.target.value)}
              placeholder="Seu estúdio"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Especialidade</Label>
            <Input
              value={niche}
              onChange={(e) => onNicheChange(e.target.value)}
              placeholder="Ex: Fotografia de Casamento"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
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
      </CardContent>
    </Card>
  );
}
