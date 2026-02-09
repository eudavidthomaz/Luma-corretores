import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarNavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number | string;
  badgeVariant?: "default" | "hot" | "new" | "pro" | "locked";
  isLocked?: boolean;
  isExternal?: boolean;
  end?: boolean;
}

export function SidebarNavItem({
  to,
  icon: Icon,
  label,
  badge,
  badgeVariant = "default",
  isLocked,
  isExternal,
  end,
}: SidebarNavItemProps) {
  const location = useLocation();
  const isActive = end 
    ? location.pathname === to 
    : location.pathname.startsWith(to);

  const badgeStyles = {
    default: "bg-muted text-muted-foreground",
    hot: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    new: "bg-green-500/20 text-green-400 border-green-500/30",
    pro: "bg-primary/20 text-primary border-primary/30",
    locked: "bg-destructive/20 text-destructive border-destructive/30",
  };

  return (
    <NavLink
      to={isLocked ? "/admin/subscription" : to}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        "hover:bg-luma-glass",
        isLocked && "opacity-50 cursor-not-allowed",
        isActive && !isLocked && "text-primary",
        !isActive && "text-muted-foreground hover:text-foreground"
      )}
    >
      {/* Active state glow background */}
      {isActive && !isLocked && (
        <motion.div
          layoutId="sidebar-active-glow"
          className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      {/* Left accent bar for active state */}
      {isActive && !isLocked && (
        <motion.div
          layoutId="sidebar-active-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-primary"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      {/* Icon */}
      <span className="relative z-10">
        {isLocked ? (
          <Lock className="h-5 w-5" />
        ) : (
          <Icon className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
          )} />
        )}
      </span>

      {/* Label */}
      <span className="relative z-10 flex-1">{label}</span>

      {/* Badge */}
      {badge !== undefined && badge !== null && badge !== 0 && (
        <Badge 
          variant="secondary" 
          className={cn(
            "relative z-10 h-5 min-w-5 px-1.5 text-[10px] font-medium justify-center",
            badgeStyles[badgeVariant]
          )}
        >
          {badge}
        </Badge>
      )}

      {/* Locked badge */}
      {isLocked && (
        <Badge 
          variant="secondary" 
          className={cn(
            "relative z-10 h-5 px-1.5 text-[10px] font-medium",
            badgeStyles.locked
          )}
        >
          <Lock className="h-2.5 w-2.5" />
        </Badge>
      )}

      {/* External indicator */}
      {isExternal && !isLocked && (
        <ExternalLink className="h-3 w-3 text-muted-foreground relative z-10" />
      )}
    </NavLink>
  );
}
