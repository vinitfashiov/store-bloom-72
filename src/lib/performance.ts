/**
 * Enterprise Performance Monitoring Utilities
 * For tracking and optimizing application performance
 */

// Performance metrics collector
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private readonly maxSamples = 100;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Record a timing metric
  recordTiming(name: string, duration: number): void {
    const samples = this.metrics.get(name) || [];
    samples.push(duration);
    
    // Keep only the last N samples
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
    
    this.metrics.set(name, samples);
  }

  // Get average timing for a metric
  getAverage(name: string): number {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) return 0;
    return samples.reduce((a, b) => a + b, 0) / samples.length;
  }

  // Get P95 timing for a metric
  getP95(name: string): number {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) return 0;
    
    const sorted = [...samples].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index] || sorted[sorted.length - 1];
  }

  // Get all metrics summary
  getSummary(): Record<string, { avg: number; p95: number; samples: number }> {
    const summary: Record<string, { avg: number; p95: number; samples: number }> = {};
    
    this.metrics.forEach((samples, name) => {
      summary[name] = {
        avg: this.getAverage(name),
        p95: this.getP95(name),
        samples: samples.length
      };
    });
    
    return summary;
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
  }
}

// Timing decorator/wrapper
export function withTiming<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    PerformanceMonitor.getInstance().recordTiming(name, duration);
    
    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`Slow operation [${name}]: ${duration.toFixed(2)}ms`);
    }
  });
}

// Hook for component render timing
export function useRenderTiming(componentName: string): void {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    
    // Use queueMicrotask to measure after render
    queueMicrotask(() => {
      const duration = performance.now() - start;
      if (duration > 100) {
        console.warn(`Slow render [${componentName}]: ${duration.toFixed(2)}ms`);
      }
    });
  }
}

// Image lazy loading with intersection observer
export function createImageLazyLoader(options: IntersectionObserverInit = {}) {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0,
    ...options
  };

  return new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, defaultOptions);
}

// Request batching utility
export class RequestBatcher<T, R> {
  private pending: Array<{ item: T; resolve: (r: R) => void; reject: (e: Error) => void }> = [];
  private timeout: NodeJS.Timeout | null = null;
  
  constructor(
    private batchFn: (items: T[]) => Promise<R[]>,
    private maxBatchSize = 50,
    private maxWaitMs = 10
  ) {}

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.pending.push({ item, resolve, reject });
      
      if (this.pending.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.maxWaitMs);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    if (this.pending.length === 0) return;
    
    const batch = this.pending.splice(0, this.maxBatchSize);
    const items = batch.map(b => b.item);
    
    try {
      const results = await this.batchFn(items);
      batch.forEach((b, i) => b.resolve(results[i]));
    } catch (error) {
      batch.forEach(b => b.reject(error as Error));
    }
  }
}

// Memory-efficient cache with LRU eviction
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  
  constructor(private maxSize: number) {}

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
