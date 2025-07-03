export interface ChartData {
  data: number[];
  labels?: string[];
  title?: string;
  width?: number;
  height?: number;
  color?: string;
}

export interface ChartOptions {
  width: number;
  height: number;
  color: string;
  showAxes: boolean;
  showGrid: boolean;
  precision: number;
}

export interface ChartResult {
  chart: string;
  title?: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface BarChartOptions extends ChartOptions {
  orientation: 'horizontal' | 'vertical';
  showValues: boolean;
  barWidth: number;
}

export interface LineChartOptions extends ChartOptions {
  interpolation: 'linear' | 'step';
  showPoints: boolean;
  smooth: boolean;
}

export interface ScatterPlotOptions extends ChartOptions {
  pointChar: string;
  showTrendLine: boolean;
}

export interface HistogramOptions extends ChartOptions {
  bins: number;
  showFrequency: boolean;
}

export interface SparklineOptions {
  width: number;
  showMinMax: boolean;
  fillChar: string;
}

export type ChartType = 'line' | 'bar' | 'scatter' | 'histogram' | 'sparkline';

export interface McpToolParams {
  data: number[];
  labels?: string[];
  title?: string;
  width?: number;
  height?: number;
  color?: string;
  orientation?: 'horizontal' | 'vertical';
  bins?: number;
  [key: string]: unknown;
}