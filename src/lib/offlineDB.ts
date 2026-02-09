// IndexedDB wrapper for offline data caching

const DB_NAME = "luma-offline-db";
const DB_VERSION = 1;

export interface CachedData<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  profileId: string;
}

export interface PendingSync {
  id: string;
  table: string;
  operation: "insert" | "update" | "delete";
  data: Record<string, unknown>;
  createdAt: number;
}

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store for cached query results
      if (!db.objectStoreNames.contains("cache")) {
        const cacheStore = db.createObjectStore("cache", { keyPath: "key" });
        cacheStore.createIndex("profileId", "profileId", { unique: false });
        cacheStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      // Store for pending sync operations
      if (!db.objectStoreNames.contains("pendingSync")) {
        const syncStore = db.createObjectStore("pendingSync", { keyPath: "id" });
        syncStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

// Cache operations
export async function setCache<T>(key: string, data: T, profileId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache", "readwrite");
    const store = tx.objectStore("cache");
    
    const item: CachedData<T> = {
      key,
      data,
      timestamp: Date.now(),
      profileId,
    };
    
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getCache<T>(key: string): Promise<CachedData<T> | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache", "readonly");
    const store = tx.objectStore("cache");
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearCacheForProfile(profileId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache", "readwrite");
    const store = tx.objectStore("cache");
    const index = store.index("profileId");
    const request = index.openCursor(IDBKeyRange.only(profileId));
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Pending sync operations
export async function addPendingSync(
  table: string,
  operation: "insert" | "update" | "delete",
  data: Record<string, unknown>
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingSync", "readwrite");
    const store = tx.objectStore("pendingSync");
    
    const item: PendingSync = {
      id: crypto.randomUUID(),
      table,
      operation,
      data,
      createdAt: Date.now(),
    };
    
    const request = store.add(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingSyncs(): Promise<PendingSync[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingSync", "readonly");
    const store = tx.objectStore("pendingSync");
    const index = store.index("createdAt");
    const request = index.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingSync(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingSync", "readwrite");
    const store = tx.objectStore("pendingSync");
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllPendingSyncs(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingSync", "readwrite");
    const store = tx.objectStore("pendingSync");
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Check if there are pending syncs
export async function hasPendingSyncs(): Promise<boolean> {
  const syncs = await getPendingSyncs();
  return syncs.length > 0;
}
