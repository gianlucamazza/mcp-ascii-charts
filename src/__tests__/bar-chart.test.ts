import { createBarChart } from '../charts/bar-chart.js';
import { ChartData } from '../types/index.js';

describe('Bar Chart', () => {
  test('should create horizontal bar chart', () => {
    const data: ChartData = {
      data: [10, 20, 15, 25],
      labels: ['A', 'B', 'C', 'D'],
      title: 'Test Bar Chart',
      width: 50,
      height: 10,
      color: 'blue'
    };

    const result = createBarChart(data, { orientation: 'horizontal' });
    
    expect(result.chart).toBeDefined();
    expect(result.title).toBe('Test Bar Chart');
    expect(result.chart).toContain('█'); // Should contain bar blocks
    expect(result.chart).toContain('A'); // Should contain labels
  });

  test('should create vertical bar chart', () => {
    const data: ChartData = {
      data: [5, 15, 10, 20],
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      width: 40,
      height: 12
    };

    const result = createBarChart(data, { orientation: 'vertical' });
    
    expect(result.chart).toBeDefined();
    expect(result.chart).toContain('█'); // Should contain bar blocks
    expect(result.chart).toContain('Q1'); // Should contain labels
  });

  test('should handle single bar', () => {
    const data: ChartData = {
      data: [42],
      labels: ['Single'],
      width: 30,
      height: 8
    };

    const result = createBarChart(data);
    expect(result.chart).toBeDefined();
    expect(result.chart).toContain('Single');
  });

  test('should throw error for empty data', () => {
    const data: ChartData = {
      data: [],
      width: 30,
      height: 8
    };

    expect(() => createBarChart(data)).toThrow('Data array cannot be empty');
  });

  test('should handle negative values', () => {
    const data: ChartData = {
      data: [-10, 5, -5, 15],
      width: 40,
      height: 10
    };

    const result = createBarChart(data);
    expect(result.chart).toBeDefined();
  });

  test('should show values when requested', () => {
    const data: ChartData = {
      data: [10, 20, 30],
      width: 50,
      height: 8
    };

    const result = createBarChart(data, { showValues: true });
    expect(result.chart).toContain('10.0');
    expect(result.chart).toContain('20.0');
    expect(result.chart).toContain('30.0');
  });
});