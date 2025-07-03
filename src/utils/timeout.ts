import { logger } from './logger.js';

export class TimeoutError extends Error {
  constructor(operation: string, timeoutMs: number) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

export interface TimeoutOptions {
  timeoutMs: number;
  operation: string;
  signal?: AbortSignal;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  options: TimeoutOptions
): Promise<T> {
  const { timeoutMs, operation, signal } = options;
  
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const error = new TimeoutError(operation, timeoutMs);
      logger.error('Operation timeout', error, { operation, timeoutMs });
      reject(error);
    }, timeoutMs);

    // Handle external abort signal
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error(`Operation '${operation}' was aborted`));
      });
    }

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export function createTimeoutWrapper<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  defaultTimeoutMs: number,
  operationName: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    return withTimeout(fn(...args), {
      timeoutMs: defaultTimeoutMs,
      operation: operationName
    });
  };
}

// Configuration for different operations
export const TIMEOUT_CONFIG = {
  CHART_GENERATION: 30000, // 30 seconds for chart generation
  VALIDATION: 5000,        // 5 seconds for validation
  FILE_OPERATIONS: 10000,  // 10 seconds for file operations
  NETWORK_REQUESTS: 15000  // 15 seconds for network requests
} as const;

export type TimeoutConfigKey = keyof typeof TIMEOUT_CONFIG;