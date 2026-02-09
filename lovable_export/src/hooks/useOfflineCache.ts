import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setCache, getCache, CachedData } from "@/lib/offlineDB";
import { useOnlineStatus } from "./useOnlineStatus";

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export function useOfflineCache() {
  const { isOnline } = useOnlineStatus();
  const queryClient = useQueryClient();

  // Save data to IndexedDB cache
  const cacheData = useCallback(
    async <T>(key: string, data: T, profileId: string) => {
      try {
        await setCache(key, data, profileId);
      } catch (error) {
        console.error("[OfflineCache] Failed to cache data:", error);
      }
    },
    []
  );

  // Get data from IndexedDB cache
  const getCachedData = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      const cached = await getCache<T>(key);
      if (!cached) return null;

      // Check if cache is still valid
      const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
      if (isExpired && isOnline) {
        return null; // Let fresh data be fetched
      }

      return cached.data;
    } catch (error) {
      console.error("[OfflineCache] Failed to get cached data:", error);
      return null;
    }
  }, [isOnline]);

  // Wrapper for queries that caches automatically
  const withOfflineCache = useCallback(
    <T>(
      queryKey: string[],
      profileId: string,
      fetchFn: () => Promise<T>
    ): (() => Promise<T>) => {
      return async () => {
        const cacheKey = queryKey.join(":");

        // If offline, try to return cached data
        if (!isOnline) {
          const cached = await getCachedData<T>(cacheKey);
          if (cached !== null) {
            return cached;
          }
          throw new Error("Sem conexão e dados não disponíveis offline");
        }

        // Online: fetch fresh data and cache it
        try {
          const data = await fetchFn();
          await cacheData(cacheKey, data, profileId);
          return data;
        } catch (error) {
          // If fetch fails, try cache as fallback
          const cached = await getCachedData<T>(cacheKey);
          if (cached !== null) {
            return cached;
          }
          throw error;
        }
      };
    },
    [isOnline, cacheData, getCachedData]
  );

  // Pre-populate cache with current query data
  const populateCacheFromQueries = useCallback(
    async (profileId: string) => {
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.getAll();

      for (const query of queries) {
        if (query.state.data && query.queryKey) {
          const key = (query.queryKey as string[]).join(":");
          await cacheData(key, query.state.data, profileId);
        }
      }
    },
    [queryClient, cacheData]
  );

  return {
    isOnline,
    cacheData,
    getCachedData,
    withOfflineCache,
    populateCacheFromQueries,
  };
}
