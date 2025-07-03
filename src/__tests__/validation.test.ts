import { validateChartData, ValidationError } from '../utils/validation.js';
import { McpToolParams } from '../types/index.js';

describe('Validation', () => {
  test('should validate correct data', () => {
    const params: McpToolParams = {
      data: [1, 2, 3, 4, 5],
      labels: ['A', 'B', 'C', 'D', 'E'],
      title: 'Test Chart',
      width: 60,
      height: 15,
      color: 'blue'
    };

    const result = validateChartData(params);
    expect(result.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.labels).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(result.title).toBe('Test Chart');
    expect(result.width).toBe(60);
    expect(result.height).toBe(15);
    expect(result.color).toBe('blue');
  });

  test('should apply defaults for optional parameters', () => {
    const params: McpToolParams = {
      data: [1, 2, 3]
    };

    const result = validateChartData(params);
    expect(result.width).toBe(60);
    expect(result.height).toBe(15);
    expect(result.color).toBe('white');
  });

  test('should throw error for missing data', () => {
    const params = {} as McpToolParams;

    expect(() => validateChartData(params)).toThrow(ValidationError);
    expect(() => validateChartData(params)).toThrow('Data must be an array of numbers');
  });

  test('should throw error for empty data array', () => {
    const params: McpToolParams = {
      data: []
    };

    expect(() => validateChartData(params)).toThrow(ValidationError);
    expect(() => validateChartData(params)).toThrow('Data array cannot be empty');
  });

  test('should throw error for invalid data values', () => {
    const params: McpToolParams = {
      data: [1, 2, 'invalid', 4] as unknown as number[]
    };

    expect(() => validateChartData(params)).toThrow(ValidationError);
    expect(() => validateChartData(params)).toThrow('All data values must be valid numbers');
  });

  test('should throw error for NaN values', () => {
    const params: McpToolParams = {
      data: [1, 2, NaN, 4]
    };

    expect(() => validateChartData(params)).toThrow(ValidationError);
    expect(() => validateChartData(params)).toThrow('All data values must be valid numbers');
  });

  test('should throw error for mismatched labels length', () => {
    const params: McpToolParams = {
      data: [1, 2, 3],
      labels: ['A', 'B'] // Wrong length
    };

    expect(() => validateChartData(params)).toThrow(ValidationError);
    expect(() => validateChartData(params)).toThrow('Labels array must have the same length as data array');
  });

  test('should throw error for invalid width', () => {
    const params: McpToolParams = {
      data: [1, 2, 3],
      width: 5 // Too small
    };

    expect(() => validateChartData(params)).toThrow(ValidationError);
    expect(() => validateChartData(params)).toThrow('Width must be a number between 10 and 200');
  });

  test('should throw error for invalid height', () => {
    const params: McpToolParams = {
      data: [1, 2, 3],
      height: 60 // Too large
    };

    expect(() => validateChartData(params)).toThrow(ValidationError);
    expect(() => validateChartData(params)).toThrow('Height must be a number between 5 and 50');
  });

  test('should throw error for invalid color', () => {
    const params: McpToolParams = {
      data: [1, 2, 3],
      color: 'invalidcolor'
    };

    expect(() => validateChartData(params)).toThrow(ValidationError);
    expect(() => validateChartData(params)).toThrow('Invalid color');
  });

  test('should accept valid colors', () => {
    const validColors = ['red', 'green', 'blue', 'yellow', 'magenta', 'cyan', 'white'];
    
    for (const color of validColors) {
      const params: McpToolParams = {
        data: [1, 2, 3],
        color
      };

      expect(() => validateChartData(params)).not.toThrow();
    }
  });
});