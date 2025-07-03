import { createLineChart } from '../charts/line-chart.js';
import { ChartData } from '../types/index.js';

describe('Line Chart', () => {
  test('should create basic line chart', () => {
    const data: ChartData = {
      data: [10, 20, 15, 25, 30],
      title: 'Test Line Chart',
      width: 40,
      height: 10,
      color: 'white'
    };

    const result = createLineChart(data);
    
    expect(result.chart).toBeDefined();
    expect(result.title).toBe('Test Line Chart');
    expect(result.dimensions.width).toBe(40);
    expect(result.dimensions.height).toBe(10);
    expect(result.chart).toContain('●'); // Should contain data points
  });

  test('should handle single data point', () => {
    const data: ChartData = {
      data: [42],
      width: 30,
      height: 8
    };

    const result = createLineChart(data);
    expect(result.chart).toBeDefined();
    expect(result.chart).toContain('●');
  });

  test('should handle labels', () => {
    const data: ChartData = {
      data: [1, 2, 3, 4, 5],
      labels: ['A', 'B', 'C', 'D', 'E'],
      width: 50,
      height: 12
    };

    const result = createLineChart(data);
    expect(result.chart).toBeDefined();
    expect(result.chart).toContain('A');
    expect(result.chart).toContain('E');
  });

  test('should throw error for empty data', () => {
    const data: ChartData = {
      data: [],
      width: 30,
      height: 8
    };

    expect(() => createLineChart(data)).toThrow('Data array cannot be empty');
  });

  test('should handle flat data (all same values)', () => {
    const data: ChartData = {
      data: [5, 5, 5, 5, 5],
      width: 30,
      height: 8
    };

    const result = createLineChart(data);
    expect(result.chart).toBeDefined();
    expect(result.chart).toContain('●');
  });
});