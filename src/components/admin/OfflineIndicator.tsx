import { WifiOff, RefreshCw, CloudOff, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Button } from "@/components/ui/button";

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, syncPendingChanges } = useOfflineSync();

  // Show nothing if online and no pending syncs
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        {!isOnline ? (
          // Offline state
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/90 text-destructive-foreground backdrop-blur-sm shadow-lg">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Modo offline</span>
            {pendingCount > 0 && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        ) : isSyncing ? (
          // Syncing state
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Sincronizando...</span>
          </div>
        ) : pendingCount > 0 ? (
          // Has pending syncs
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/90 text-warning-foreground backdrop-blur-sm shadow-lg">
            <CloudOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              {pendingCount} alteração{pendingCount > 1 ? "ões" : ""} pendente
              {pendingCount > 1 ? "s" : ""}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs hover:bg-white/20"
              onClick={syncPendingChanges}
            >
              Sincronizar
            </Button>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
