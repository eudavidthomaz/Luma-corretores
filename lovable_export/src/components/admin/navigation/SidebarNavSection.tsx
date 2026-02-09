import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavSectionProps {
  title?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function SidebarNavSection({ 
  title, 
  children, 
  collapsible = false,
  defaultOpen = true 
}: SidebarNavSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-1">
      {title && (
        <button 
          onClick={() => collapsible && setIsOpen(!isOpen)}
          disabled={!collapsible}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2",
            collapsible && "cursor-pointer hover:bg-luma-glass rounded-lg transition-colors"
          )}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {collapsible && (
            <ChevronDown className={cn(
              "h-3 w-3 text-muted-foreground transition-transform duration-200",
              !isOpen && "-rotate-90"
            )} />
          )}
        </button>
      )}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-0.5 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
