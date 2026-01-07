// Simple in-memory cache for OpenAI responses
interface CacheEntry {
  response: any;
  timestamp: number;
  tokens: number;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 3600000; // 1 hour
  private readonly MAX_SIZE = 100;

  // Generate cache key from prompt and model
  private generateKey(prompt: string, model: string): string {
    const normalizedPrompt = prompt.toLowerCase().trim();
    return `${model}:${this.hashString(normalizedPrompt)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  get(prompt: string, model: string): any | null {
    const key = this.generateKey(prompt, model);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  set(prompt: string, model: string, response: any, tokens: number = 0): void {
    const key = this.generateKey(prompt, model);

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      tokens
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size,
      // TODO: Track hit rate in production
    };
  }
}

export const responseCache = new ResponseCache();