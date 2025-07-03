import { logger } from './logger.js';

export interface ProgressUpdate {
  operation: string;
  progress: number; // 0-100
  message?: string;
  details?: Record<string, unknown>;
}

export class ProgressReporter {
  private operation: string;
  private startTime: number;
  private lastReportTime: number;
  private minReportInterval: number;

  constructor(operation: string, minReportIntervalMs: number = 100) {
    this.operation = operation;
    this.startTime = Date.now();
    this.lastReportTime = this.startTime;
    this.minReportInterval = minReportIntervalMs;
    
    logger.info('Progress tracking started', { 
      operation, 
      startTime: this.startTime 
    });
  }

  report(progress: number, message?: string, details?: Record<string, unknown>): void {
    const now = Date.now();
    
    // Throttle progress reports to avoid spam
    if (now - this.lastReportTime < this.minReportInterval && progress < 100) {
      return;
    }

    this.lastReportTime = now;
    const elapsed = now - this.startTime;
    
    const update: ProgressUpdate = {
      operation: this.operation,
      progress: Math.min(Math.max(progress, 0), 100),
      message,
      details: {
        ...details,
        elapsed,
        estimatedTotal: progress > 0 ? (elapsed / progress) * 100 : undefined
      }
    };

    logger.info('Progress update', { 
      operation: this.operation,
      progress: update.progress,
      message: update.message,
      elapsed: update.details?.elapsed,
      estimatedTotal: update.details?.estimatedTotal
    });
  }

  complete(message?: string): void {
    const elapsed = Date.now() - this.startTime;
    this.report(100, message || 'Operation completed');
    
    logger.info('Progress tracking completed', {
      operation: this.operation,
      totalElapsed: elapsed
    });
  }

  fail(error: Error): void {
    const elapsed = Date.now() - this.startTime;
    
    logger.error('Progress tracking failed', error, {
      operation: this.operation,
      totalElapsed: elapsed
    });
  }
}

// Helper for operations with known steps
export class StepProgressReporter extends ProgressReporter {
  private totalSteps: number;
  private currentStep: number;

  constructor(operation: string, totalSteps: number) {
    super(operation);
    this.totalSteps = totalSteps;
    this.currentStep = 0;
  }

  nextStep(stepName?: string): void {
    this.currentStep++;
    const progress = (this.currentStep / this.totalSteps) * 100;
    this.report(progress, stepName, { 
      step: this.currentStep, 
      totalSteps: this.totalSteps 
    });
  }

  setStep(step: number, stepName?: string): void {
    this.currentStep = step;
    const progress = (this.currentStep / this.totalSteps) * 100;
    this.report(progress, stepName, { 
      step: this.currentStep, 
      totalSteps: this.totalSteps 
    });
  }
}

// Utility for tracking chart generation progress
export function createChartProgressReporter(chartType: string, dataSize: number): StepProgressReporter {
  const steps = [
    'Validating input data',
    'Processing data values', 
    'Calculating chart dimensions',
    'Generating ASCII grid',
    'Rendering chart elements',
    'Applying colors and formatting'
  ];
  
  const reporter = new StepProgressReporter(`generate_${chartType}_chart`, steps.length);
  
  logger.info('Chart generation started', {
    chartType,
    dataSize,
    estimatedSteps: steps.length
  });
  
  return reporter;
}