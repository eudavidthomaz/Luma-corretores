import { useEffect, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  getPendingSyncs,
  removePendingSync,
  PendingSync,
} from "@/lib/offlineDB";
import { useOnlineStatus } from "./useOnlineStatus";
import { toast } from "sonner";

export function useOfflineSync() {
  const { isOnline, wasOffline, clearWasOffline } = useOnlineStatus();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check pending count on mount
  useEffect(() => {
    const checkPending = async () => {
      const syncs = await getPendingSyncs();
      setPendingCount(syncs.length);
    };
    checkPending();
  }, []);

  const syncPendingChanges = useCallback(async () => {
    if (isSyncing) return;
    
    const syncs = await getPendingSyncs();
    if (syncs.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;

    for (const sync of syncs) {
      try {
        await processSyncItem(sync);
        await removePendingSync(sync.id);
        successCount++;
      } catch (error) {
        console.error("[OfflineSync] Failed to sync:", sync, error);
        failCount++;
      }
    }

    setIsSyncing(false);
    setPendingCount(failCount);

    if (successCount > 0) {
      toast.success(`${successCount} alteração(ões) sincronizada(s)`);
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
    }

    if (failCount > 0) {
      toast.error(`${failCount} alteração(ões) falhou ao sincronizar`);
    }
  }, [isSyncing, queryClient]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      clearWasOffline();
      syncPendingChanges();
    }
  }, [isOnline, wasOffline, clearWasOffline, syncPendingChanges]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncPendingChanges,
  };
}

async function processSyncItem(sync: PendingSync): Promise<void> {
  const { table, operation, data } = sync;

  // Type-safe table operations - cast to any for dynamic table access
  if (table === "leads") {
    switch (operation) {
      case "insert": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from("leads").insert(data as any);
        if (error) throw error;
        break;
      }
      case "update": {
        const { id, ...updates } = data;
        if (typeof id === "string") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await supabase
            .from("leads")
            .update(updates as any)
            .eq("id", id);
          if (error) throw error;
        }
        break;
      }
      case "delete": {
        if (typeof data.id === "string") {
          const { error } = await supabase
            .from("leads")
            .delete()
            .eq("id", data.id);
          if (error) throw error;
        }
        break;
      }
    }
  }
}
