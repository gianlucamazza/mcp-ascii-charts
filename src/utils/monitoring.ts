import { logger } from './logger.js';

export interface ErrorPattern {
  errorType: string;
  count: number;
  lastOccurrence: string;
  contexts: string[];
}

export interface ResourceMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
  activeRequests: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  metrics: ResourceMetrics;
  errors: ErrorPattern[];
  lastUpdated: string;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private activeRequests: Set<string> = new Set();
  private startTime: number = Date.now();
  private cpuUsageStart: NodeJS.CpuUsage = process.cpuUsage();

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  trackRequest(requestId: string): void {
    this.activeRequests.add(requestId);
    logger.debug('Request tracked', { requestId, activeCount: this.activeRequests.size });
  }

  untrackRequest(requestId: string): void {
    this.activeRequests.delete(requestId);
    logger.debug('Request untracked', { requestId, activeCount: this.activeRequests.size });
  }

  recordError(error: Error, context: string = 'unknown'): void {
    const errorType = error.constructor.name;
    const existing = this.errorPatterns.get(errorType);
    
    if (existing) {
      existing.count++;
      existing.lastOccurrence = new Date().toISOString();
      existing.contexts.push(context);
      // Keep only last 10 contexts
      if (existing.contexts.length > 10) {
        existing.contexts = existing.contexts.slice(-10);
      }
    } else {
      this.errorPatterns.set(errorType, {
        errorType,
        count: 1,
        lastOccurrence: new Date().toISOString(),
        contexts: [context]
      });
    }

    logger.warn('Error pattern recorded', {
      errorType,
      context,
      totalOccurrences: this.errorPatterns.get(errorType)?.count,
      message: error.message
    });
  }

  getResourceMetrics(): ResourceMetrics {
    return {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(this.cpuUsageStart),
      uptime: Date.now() - this.startTime,
      activeRequests: this.activeRequests.size
    };
  }

  getHealthStatus(): HealthStatus {
    const metrics = this.getResourceMetrics();
    const errors = Array.from(this.errorPatterns.values());
    
    // Health checks
    const checks = {
      memoryHealthy: metrics.memoryUsage.heapUsed < metrics.memoryUsage.heapTotal * 0.9,
      activeRequestsHealthy: metrics.activeRequests < 100,
      errorRateHealthy: this.getRecentErrorRate() < 0.1,
      uptimeHealthy: metrics.uptime > 0
    };

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.values(checks).length;
    
    let status: HealthStatus['status'];
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.7) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      metrics,
      errors,
      lastUpdated: new Date().toISOString()
    };
  }

  private getRecentErrorRate(): number {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    let recentErrors = 0;
    for (const pattern of this.errorPatterns.values()) {
      const errorTime = new Date(pattern.lastOccurrence).getTime();
      if (errorTime >= oneHourAgo) {
        recentErrors += pattern.count;
      }
    }
    
    return recentErrors / Math.max(this.activeRequests.size, 1);
  }

  cleanup(): void {
    // Clear old error patterns (older than 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    for (const [errorType, pattern] of this.errorPatterns.entries()) {
      const errorTime = new Date(pattern.lastOccurrence).getTime();
      if (errorTime < oneDayAgo) {
        this.errorPatterns.delete(errorType);
        logger.debug('Old error pattern cleaned up', { errorType });
      }
    }

    // Log cleanup metrics
    logger.info('Monitoring cleanup completed', {
      remainingErrorPatterns: this.errorPatterns.size,
      activeRequests: this.activeRequests.size
    });
  }

  logHealthStatus(): void {
    const health = this.getHealthStatus();
    logger.info('Health status check', {
      status: health.status,
      checks: health.checks,
      memoryUsageMB: Math.round(health.metrics.memoryUsage.heapUsed / 1024 / 1024),
      activeRequests: health.metrics.activeRequests,
      errorPatternCount: health.errors.length,
      uptimeMs: health.metrics.uptime
    });
  }
}

export const monitoring = MonitoringService.getInstance();

// Resource cleanup utilities
export class ResourceManager {
  private resources: Map<string, () => void> = new Map();

  register(resourceId: string, cleanup: () => void): void {
    this.resources.set(resourceId, cleanup);
    logger.debug('Resource registered', { resourceId });
  }

  unregister(resourceId: string): void {
    const cleanup = this.resources.get(resourceId);
    if (cleanup) {
      try {
        cleanup();
        this.resources.delete(resourceId);
        logger.debug('Resource cleaned up', { resourceId });
      } catch (error) {
        logger.error('Resource cleanup failed', error as Error, { resourceId });
        monitoring.recordError(error as Error, `resource_cleanup_${resourceId}`);
      }
    }
  }

  cleanupAll(): void {
    const resourceIds = Array.from(this.resources.keys());
    for (const resourceId of resourceIds) {
      this.unregister(resourceId);
    }
    logger.info('All resources cleaned up', { cleanedCount: resourceIds.length });
  }
}

export const resourceManager = new ResourceManager();

// Process signal handlers for graceful shutdown
export function setupGracefulShutdown(): void {
  const gracefulShutdown = (signal: string) => {
    logger.info('Graceful shutdown initiated', { signal });
    
    // Log final health status
    monitoring.logHealthStatus();
    
    // Cleanup all resources
    resourceManager.cleanupAll();
    monitoring.cleanup();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Log uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    monitoring.recordError(error, 'uncaught_exception');
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled promise rejection', error, { promise: String(promise) });
    monitoring.recordError(error, 'unhandled_rejection');
  });
}