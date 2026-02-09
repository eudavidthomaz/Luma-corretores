import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import lumaLogoWhite from "@/assets/luma-logo-white.png";
import { hasPublicProfile } from "@/lib/planLimits";

interface ChatHeaderProps {
  photographerName: string;
  specialty: string;
  avatarUrl?: string;
  status?: string;
  slug?: string;
  plan?: string;
}

export function ChatHeader({ photographerName, specialty, avatarUrl, status = "Online", slug, plan }: ChatHeaderProps) {
  const navigate = useNavigate();
  const isOnline = status.toLowerCase() === "online";
  const showProfileButton = hasPublicProfile(plan) && slug;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-luma-glass-border">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <motion.div 
          className="status-ring p-0.5 rounded-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-gradient-primary p-1.5">
              <img src={lumaLogoWhite} alt="Luma" className="h-full w-full object-contain" />
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-sm font-semibold text-foreground truncate"
          >
            {photographerName}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mt-0.5"
          >
            <span 
              className={`w-2 h-2 rounded-full ${
                isOnline 
                  ? "bg-green-500 animate-pulse" 
                  : "bg-yellow-500"
              }`} 
            />
            <span className="text-xs text-muted-foreground">
              Luma {status === "Online" ? "está online" : status.toLowerCase()}
            </span>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          {showProfileButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/p/${slug}`)}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <User className="h-3.5 w-3.5" />
                Ver Perfil
              </Button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <Badge 
              variant="secondary" 
              className="bg-secondary/20 text-secondary border-secondary/30 text-xs hover:bg-secondary/30 transition-colors duration-200"
            >
              {specialty}
            </Badge>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
