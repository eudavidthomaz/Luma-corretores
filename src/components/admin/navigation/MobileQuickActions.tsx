import { Link } from "react-router-dom";
import { Users, Globe, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileQuickActionsProps {
  onNavigate: () => void;
  isRestricted?: boolean;
}

const quickActions = [
  { 
    to: "/admin/leads", 
    icon: Users, 
    label: "Leads", 
    color: "from-blue-500 to-cyan-600",
    requiresAccess: true,
  },
  { 
    to: "/admin/minisite", 
    icon: Globe, 
    label: "Mini-Site", 
    color: "from-amber-500 to-orange-600",
    requiresAccess: false,
  },
  { 
    to: "/admin/settings", 
    icon: Sparkles, 
    label: "Luma IA", 
    color: "from-violet-500 to-purple-600",
    requiresAccess: true,
  },
  { 
    to: "/chat", 
    icon: MessageSquare, 
    label: "Ver Chat", 
    color: "from-pink-500 to-rose-600",
    requiresAccess: true,
  },
];

export function MobileQuickActions({ onNavigate, isRestricted = false }: MobileQuickActionsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        Navegação Rápida
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((action) => {
          const isLocked = isRestricted && action.requiresAccess;
          const targetPath = isLocked ? "/admin/subscription" : action.to;
          
          return (
            <Link
              key={action.to}
              to={targetPath}
              onClick={onNavigate}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl glass border border-luma-glass-border",
                "hover:bg-white/5 transition-all active:scale-95",
                isLocked && "opacity-50"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-xl bg-gradient-to-br shadow-lg",
                action.color
              )}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-foreground text-center leading-tight">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
