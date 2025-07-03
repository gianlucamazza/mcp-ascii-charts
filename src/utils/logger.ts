import { randomUUID } from 'crypto';

export interface LogContext {
  requestId?: string;
  toolName?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: LogContext;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  private static instance: Logger;
  private context: LogContext = {};

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  generateRequestId(): string {
    const requestId = randomUUID();
    this.setContext({ requestId });
    return requestId;
  }

  private log(level: LogEntry['level'], message: string, context?: LogContext, error?: Error, duration?: number): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      ...(duration && { duration }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };

    // Write to stderr to avoid mixing with MCP protocol on stdout
    console.error(JSON.stringify(entry));
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  logRequest(toolName: string, params: unknown): void {
    this.info('Tool request received', {
      toolName,
      paramsSize: JSON.stringify(params).length,
      hasData: !!(params && typeof params === 'object' && 'data' in params)
    });
  }

  logResponse(toolName: string, success: boolean, duration: number): void {
    this.info('Tool request completed', {
      toolName,
      success,
      duration
    });
  }

  logPerformance(operation: string, duration: number, context?: LogContext): void {
    this.info('Performance metric', {
      operation,
      duration,
      ...context
    });
  }
}

export const logger = Logger.getInstance();

// Performance timing utility
export class PerformanceTimer {
  private startTime: number;
  private operation: string;
  private context?: LogContext;

  constructor(operation: string, context?: LogContext) {
    this.operation = operation;
    this.context = context;
    this.startTime = performance.now();
    logger.debug(`Started: ${operation}`, context);
  }

  end(): number {
    const duration = performance.now() - this.startTime;
    logger.logPerformance(this.operation, duration, this.context);
    return duration;
  }
}

// Request tracking middleware
export function withRequestTracking<T extends unknown[], R>(
  fn: (...args: T) => R | Promise<R>,
  operationName: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const requestId = logger.generateRequestId();
    const timer = new PerformanceTimer(operationName, { requestId });
    
    try {
      logger.debug(`Executing ${operationName}`, { requestId, argsCount: args.length });
      const result = await Promise.resolve(fn(...args));
      const duration = timer.end();
      logger.info(`Completed ${operationName}`, { requestId, duration, success: true });
      return result;
    } catch (error) {
      const duration = timer.end();
      logger.error(`Failed ${operationName}`, error as Error, { requestId, duration, success: false });
      throw error;
    } finally {
      logger.clearContext();
    }
  };
}