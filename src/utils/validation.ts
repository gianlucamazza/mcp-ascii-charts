import { ChartData, McpToolParams } from '../types/index.js';
import { isValidColor, getColorList } from './colors.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateChartData(params: McpToolParams): ChartData {
  if (!params.data || !Array.isArray(params.data)) {
    throw new ValidationError('Data must be an array of numbers');
  }

  if (params.data.length === 0) {
    throw new ValidationError('Data array cannot be empty');
  }

  if (!params.data.every(value => typeof value === 'number' && !isNaN(value))) {
    throw new ValidationError('All data values must be valid numbers');
  }

  if (params.labels && !Array.isArray(params.labels)) {
    throw new ValidationError('Labels must be an array of strings');
  }

  if (params.labels && params.labels.length !== params.data.length) {
    throw new ValidationError('Labels array must have the same length as data array');
  }

  if (params.width && (typeof params.width !== 'number' || params.width < 10 || params.width > 200)) {
    throw new ValidationError('Width must be a number between 10 and 200');
  }

  if (params.height && (typeof params.height !== 'number' || params.height < 5 || params.height > 50)) {
    throw new ValidationError('Height must be a number between 5 and 50');
  }

  if (params.color && typeof params.color !== 'string') {
    throw new ValidationError('Color must be a string');
  }

  if (params.color && !isValidColor(params.color)) {
    throw new ValidationError(`Invalid color. Available colors: ${getColorList().join(', ')}`);
  }

  if (params.title && typeof params.title !== 'string') {
    throw new ValidationError('Title must be a string');
  }

  return {
    data: params.data,
    labels: params.labels,
    title: params.title,
    width: params.width || 60,
    height: params.height || 15,
    color: params.color || 'white'
  };
}

export function validateNumericRange(value: number, min: number, max: number, name: string): void {
  if (value < min || value > max) {
    throw new ValidationError(`${name} must be between ${min} and ${max}`);
  }
}