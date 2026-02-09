import { useState } from "react";
import { Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { PwaInstallModal } from "./PwaInstallModal";

interface PwaInstallButtonProps {
  className?: string;
  variant?: "default" | "compact";
}

export function PwaInstallButton({ className, variant = "default" }: PwaInstallButtonProps) {
  const { isInstallable, isInstalled, isIOSSafari, install } = usePwaInstall();
  const [modalOpen, setModalOpen] = useState(false);

  // Don't render if PWA is not available
  if (!isInstallable && !isInstalled) {
    return null;
  }

  // Show installed state
  if (isInstalled) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground opacity-60",
        className
      )}>
        <Check className="h-4 w-4 text-green-500" />
        <span className="text-sm">App Instalado</span>
      </div>
    );
  }

  // Show install button
  return (
    <>
      <Button
        variant="outline"
        size={variant === "compact" ? "icon" : "default"}
        onClick={() => setModalOpen(true)}
        className={cn(
          "gap-2 border-primary/30 text-primary hover:bg-primary/10",
          variant === "default" && "w-full justify-start",
          variant === "compact" && "w-10 h-10",
          className
        )}
      >
        <div className="relative">
          <Smartphone className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        {variant === "default" && (
          <span className="text-sm font-medium">Instalar App</span>
        )}
      </Button>

      <PwaInstallModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isIOSSafari={isIOSSafari}
        onInstall={install}
      />
    </>
  );
}
