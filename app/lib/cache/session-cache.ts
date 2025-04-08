import { loggerService } from '../logger';

export class SessionCache<T> {
  private cache: Map<string, T> = new Map();

  set(key: string, value: T): void {
    this.cache.set(key, value);
    
    loggerService.debug('Session cached', { 
      key,
      timestamp: new Date().toISOString()
    });
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key);
    
    if (!value) {
      return undefined;
    }

    loggerService.debug('Session cache hit', { key });
    return value;
  }

  delete(key: string): void {
    this.cache.delete(key);
    loggerService.debug('Session cache entry deleted', { key });
  }

  clear(): void {
    this.cache.clear();
    loggerService.debug('Session cache cleared');
  }

  /**
   * Delete cache entries by shop domain with optional pattern matching
   */
  deleteByShopDomain(shopDomain: string, exactMatch = true): number {
    let deletedCount = 0;
    
    if (exactMatch) {
      // Exact match deletion
      if (this.cache.delete(shopDomain)) {
        deletedCount++;
      }
    } else {
      // Pattern match deletion (e.g., subdomains)
      const pattern = new RegExp(`.*${shopDomain}.*`);
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
          deletedCount++;
        }
      }
    }

    loggerService.debug('Session cache entries deleted by shop domain', {
      shopDomain,
      exactMatch,
      deletedCount
    });
    
    return deletedCount;
  }
} 