import { useEffect, useCallback } from "react";

export function useAppBadge() {
  const isSupported = "setAppBadge" in navigator;

  const setBadge = useCallback(async (count: number) => {
    if (!isSupported) return;

    try {
      if (count > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (navigator as any).setAppBadge(count);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (navigator as any).clearAppBadge();
      }
    } catch (error) {
      // Badge API may fail silently on some browsers
      console.debug("[AppBadge] Failed to set badge:", error);
    }
  }, [isSupported]);

  const clearBadge = useCallback(async () => {
    if (!isSupported) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (navigator as any).clearAppBadge();
    } catch (error) {
      console.debug("[AppBadge] Failed to clear badge:", error);
    }
  }, [isSupported]);

  return {
    isSupported,
    setBadge,
    clearBadge,
  };
}

// Hook that automatically syncs badge with unread leads count
export function useLeadsBadge(unreadCount: number) {
  const { setBadge } = useAppBadge();

  useEffect(() => {
    setBadge(unreadCount);
  }, [unreadCount, setBadge]);
}
