import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, FolderOpen, FileText, Menu, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavBarProps {
  onMoreClick: () => void;
  isMoreOpen: boolean;
  isRestricted: boolean;
  showNotificationDot?: boolean;
}

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Home", end: true },
  { to: "/admin/stories", icon: BookOpen, label: "Stories" },
  { to: "/admin/gallery", icon: FolderOpen, label: "Galerias" },
  { to: "/admin/proposals", icon: FileText, label: "Propostas" },
];

export function MobileNavBar({ 
  onMoreClick, 
  isMoreOpen, 
  isRestricted,
  showNotificationDot = false,
}: MobileNavBarProps) {
  const location = useLocation();
  
  // Calculate active index for the indicator
  const activeIndex = navItems.findIndex(item => 
    item.end 
      ? location.pathname === item.to 
      : location.pathname.startsWith(item.to)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Glass background */}
      <div className="glass border-t border-luma-glass-border backdrop-blur-xl">
        <div className="relative flex items-center justify-around py-2 px-1 safe-area-inset-bottom">
          {/* Animated indicator line */}
          {activeIndex >= 0 && (
            <motion.div
              className="absolute bottom-1 h-0.5 w-10 bg-primary rounded-full"
              initial={false}
              animate={{
                left: `calc(${(activeIndex + 0.5) * (100 / 5)}% - 20px)`,
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}

          {navItems.map((item) => {
            const isActive = item.end 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to);
            
            const isLocked = isRestricted;

            return (
              <NavLink
                key={item.to}
                to={isLocked ? "/admin/subscription" : item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all min-w-[60px]",
                  isLocked && "opacity-50",
                  isActive && !isLocked ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isLocked ? (
                  <Lock className="h-5 w-5" />
                ) : (
                  <item.icon className={cn(
                    "h-5 w-5 transition-all",
                    isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
                  )} />
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}

          {/* More Button */}
          <button
            onClick={onMoreClick}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all min-w-[60px]",
              isMoreOpen ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <Menu className={cn(
                "h-5 w-5 transition-all",
                isMoreOpen && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
              )} />
              {/* Notification dot */}
              {showNotificationDot && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
