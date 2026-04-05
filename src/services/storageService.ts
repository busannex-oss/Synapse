
import { openDB, IDBPDatabase } from 'idb';

/**
 * Neural IndexedDB Storage Service
 * Provides expanded, persistent storage for PWA environments.
 * IndexedDB typically allows for hundreds of MBs or even GBs of storage,
 * depending on the device's available disk space.
 */
class StorageService {
  private dbName = 'synapse_neural_vault_v1';
  private dbPromise: Promise<IDBPDatabase> | null = null;

  constructor() {
    this.initDB();
  }

  private initDB() {
    if (typeof window === 'undefined') return;

    this.dbPromise = openDB(this.dbName, 1, {
      upgrade(db) {
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('leads')) {
          db.createObjectStore('leads', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('memories')) {
          db.createObjectStore('memories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('agents')) {
          db.createObjectStore('agents', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
      },
    });
  }

  /**
   * Save an item to a specific store
   */
  async save(storeName: string, data: any) {
    const db = await this.dbPromise;
    if (!db) return;
    
    if (Array.isArray(data)) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      
      // For large datasets like logs or memories, we might want to only put new items
      // but the current architecture passes the whole array.
      // To optimize, we'll use a more efficient batch put.
      for (const item of data) {
        await store.put(item);
      }
      await tx.done;
    } else {
      await db.put(storeName, data, storeName === 'meta' ? 'current' : undefined);
    }
  }

  /**
   * Load all items from a store
   */
  async loadAll(storeName: string): Promise<any[]> {
    const db = await this.dbPromise;
    if (!db) return [];
    return db.getAll(storeName);
  }

  /**
   * Load a single item from a store
   */
  async load(storeName: string, key: string = 'current'): Promise<any> {
    const db = await this.dbPromise;
    if (!db) return null;
    return db.get(storeName, key);
  }

  /**
   * Clear a store
   */
  async clear(storeName: string) {
    const db = await this.dbPromise;
    if (!db) return;
    await db.clear(storeName);
  }

  /**
   * Check storage estimate
   */
  async getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percent: ((estimate.usage || 0) / (estimate.quota || 1)) * 100
      };
    }
    return null;
  }
}

export const storageService = new StorageService();
