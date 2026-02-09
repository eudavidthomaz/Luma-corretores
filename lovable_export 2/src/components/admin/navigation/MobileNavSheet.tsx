import { Link } from "react-router-dom";
import { Crown, CreditCard, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import { MobileProfileCard } from "./MobileProfileCard";
import { MobileQuickActions } from "./MobileQuickActions";
import { Tables } from "@/integrations/supabase/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Profile = Tables<"profiles">;

interface MobileNavSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  isRestricted: boolean;
  onSignOut: () => void;
}

export function MobileNavSheet({ 
  isOpen, 
  onClose,
  profile,
  isRestricted,
  onSignOut,
}: MobileNavSheetProps) {
  const handleClose = () => {
    onClose();
  };

  const handleSignOut = () => {
    onClose();
    onSignOut();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="bottom" 
        className="glass border-t border-luma-glass-border rounded-t-3xl max-h-[85vh] p-0"
      >
        <VisuallyHidden>
          <SheetTitle>Menu de Navegação</SheetTitle>
        </VisuallyHidden>
        
        {/* Drag Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="px-6 pb-8 space-y-6 overflow-y-auto max-h-[calc(85vh-24px)]">
          {/* Profile Card */}
          <MobileProfileCard 
            profile={profile} 
            isRestricted={isRestricted} 
          />

          {/* Quick Actions Grid */}
          <MobileQuickActions 
            onNavigate={handleClose} 
            isRestricted={isRestricted}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link to="/admin/subscription" className="flex-1" onClick={handleClose}>
              <Button 
                variant={isRestricted ? "gradient" : "outline"} 
                className="w-full gap-2"
              >
                {isRestricted ? (
                  <>
                    <Crown className="h-4 w-4" />
                    Fazer Upgrade
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Ver Assinatura
                  </>
                )}
              </Button>
            </Link>
            <PwaInstallButton />
          </div>

          {/* Sign Out */}
          <Button 
            variant="ghost" 
            className="w-full justify-center gap-2 text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </Button>

          {/* Legal Links */}
          <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2">
            <Link to="/terms" onClick={handleClose} className="hover:text-foreground transition-colors">
              Termos
            </Link>
            <span>•</span>
            <Link to="/privacy" onClick={handleClose} className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
