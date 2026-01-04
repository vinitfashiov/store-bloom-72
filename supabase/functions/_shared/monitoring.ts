/**
 * Enterprise-level monitoring and logging for Edge Functions
 * Tracks performance, errors, and metrics
 */

interface LogContext {
  functionName: string;
  requestId?: string;
  tenantId?: string;
  userId?: string;
  [key: string]: any;
}

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  context?: LogContext;
}

class Monitor {
  private static instance: Monitor;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100;

  static getInstance(): Monitor {
    if (!Monitor.instance) {
      Monitor.instance = new Monitor();
    }
    return Monitor.instance;
  }

  /**
   * Log error with context
   */
  async logError(error: Error | unknown, context: LogContext): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const logEntry = {
      level: 'error',
      message: errorMessage,
      stack: errorStack,
      context,
      timestamp: new Date().toISOString(),
    };

    // Log to console (Supabase will capture this)
    console.error(JSON.stringify(logEntry));

    // Here you can send to external monitoring service (Sentry, DataDog, etc.)
    // await this.sendToMonitoringService(logEntry);
  }

  /**
   * Log info message
   */
  async logInfo(message: string, context?: LogContext): Promise<void> {
    const logEntry = {
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logEntry));
  }

  /**
   * Record performance metric
   */
  recordMetric(operation: string, duration: number, context?: LogContext): void {
    this.metrics.push({
      operation,
      duration,
      timestamp: Date.now(),
      context,
    });

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations
    if (duration > 1000) {
      this.logInfo(`Slow operation: ${operation} took ${duration}ms`, context);
    }
  }

  /**
   * Wrap async function with performance tracking
   */
  async trackPerformance<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, context);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Get metrics summary
   */
  getMetrics(): {
    operation: string;
    count: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
  }[] {
    const grouped = new Map<string, PerformanceMetric[]>();

    this.metrics.forEach(metric => {
      if (!grouped.has(metric.operation)) {
        grouped.set(metric.operation, []);
      }
      grouped.get(metric.operation)!.push(metric);
    });

    return Array.from(grouped.entries()).map(([operation, metrics]) => {
      const durations = metrics.map(m => m.duration);
      return {
        operation,
        count: metrics.length,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        maxDuration: Math.max(...durations),
        minDuration: Math.min(...durations),
      };
    });
  }
}

export const monitor = Monitor.getInstance();

/**
 * Helper to create request context
 */
export function createContext(functionName: string, req: Request): LogContext {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  return {
    functionName,
    requestId,
  };
}

