import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PwaInstallButton } from "@/components/pwa/PwaInstallButton";
import ligaLogoWhite from "@/assets/liga-logo-white.png";

export function SidebarFooter() {
  return (
    <div className="space-y-4">
      {/* Quick Actions Row */}
      <div className="flex gap-2">
        <PwaInstallButton />
        <Link to="/chat" className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Ver Chat
          </Button>
        </Link>
      </div>

      {/* Legal Links */}
      <div className="flex justify-center gap-3 text-[10px] text-muted-foreground">
        <Link to="/terms" className="hover:text-foreground transition-colors">
          Termos
        </Link>
        <span>•</span>
        <Link to="/privacy" className="hover:text-foreground transition-colors">
          Privacidade
        </Link>
      </div>

      {/* Powered by Liga da Fotografia */}
      <div className="pt-4 border-t border-luma-glass-border flex flex-col items-center gap-2">
        <p className="text-[10px] text-muted-foreground">Powered by</p>
        <img 
          src={ligaLogoWhite} 
          alt="Liga da Fotografia" 
          className="h-5 w-auto opacity-50"
        />
      </div>
    </div>
  );
}
