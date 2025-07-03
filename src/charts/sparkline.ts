import { ChartData, ChartResult } from '../types/index.js';
import { colorize } from '../utils/colors.js';
import { ASCII_CHARS, normalize, center } from '../utils/ascii.js';

export interface SparklineOptions {
  showMinMax?: boolean;
  fillChar?: string;
}

export function createSparkline(data: ChartData, options: SparklineOptions = {}): ChartResult {
  const { data: values, title, width = 40, color = 'white' } = data;
  const { showMinMax = true, fillChar } = options;
  
  if (values.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  
  // Calculate sparkline width (reserve space for min/max if shown)
  const sparklineWidth = showMinMax ? width - 20 : width;
  
  let sparkline = '';
  
  // Generate sparkline using block characters
  if (fillChar) {
    // Use custom fill character
    for (let i = 0; i < Math.min(values.length, sparklineWidth); i++) {
      sparkline += fillChar;
    }
  } else {
    // Use gradient block characters
    const blocks = ASCII_CHARS.sparkBlocks;
    
    for (let i = 0; i < Math.min(values.length, sparklineWidth); i++) {
      const normalizedValue = valueRange === 0 ? 0.5 : normalize(values[i], minValue, maxValue);
      const blockIndex = Math.floor(normalizedValue * (blocks.length - 1));
      sparkline += blocks[blockIndex];
    }
  }
  
  // Add min/max values if requested
  if (showMinMax) {
    const minStr = minValue.toFixed(1);
    const maxStr = maxValue.toFixed(1);
    sparkline = `${minStr} ${sparkline} ${maxStr}`;
  }
  
  // Apply coloring
  if (color !== 'white') {
    sparkline = colorize(sparkline, color);
  }
  
  // Add title if provided
  let result = sparkline;
  if (title) {
    const titleLine = center(title, sparkline.length);
    result = titleLine + '\n' + sparkline;
  }
  
  return {
    chart: result,
    title,
    dimensions: { 
      width: sparkline.length, 
      height: title ? 2 : 1 
    }
  };
}

export function createMultiSparkline(datasets: ChartData[], options: SparklineOptions = {}): ChartResult {
  // const { showMinMax = true } = options;
  
  if (datasets.length === 0) {
    throw new Error('At least one dataset is required');
  }

  const maxWidth = Math.max(...datasets.map(d => d.width || 40));
  let result = '';
  
  for (let i = 0; i < datasets.length; i++) {
    const dataset = datasets[i];
    const sparklineResult = createSparkline(dataset, options);
    
    const label = dataset.title || `Series ${i + 1}`;
    const labeledLine = `${label.padEnd(15)} ${sparklineResult.chart}`;
    
    result += labeledLine;
    if (i < datasets.length - 1) {
      result += '\n';
    }
  }
  
  return {
    chart: result,
    dimensions: { 
      width: maxWidth + 15, 
      height: datasets.length 
    }
  };
}

export function createTrendSparkline(data: ChartData): ChartResult {
  const { data: values, title, width = 40, color = 'white' } = data;
  
  if (values.length < 2) {
    throw new Error('At least 2 values required for trend sparkline');
  }

  let sparkline = '';
  const trendChars = ['↓', '→', '↑'];
  
  for (let i = 1; i < Math.min(values.length, width); i++) {
    const current = values[i];
    const previous = values[i - 1];
    
    if (current > previous * 1.05) { // 5% threshold for up trend
      sparkline += trendChars[2]; // ↑
    } else if (current < previous * 0.95) { // 5% threshold for down trend
      sparkline += trendChars[0]; // ↓
    } else {
      sparkline += trendChars[1]; // →
    }
  }
  
  // Calculate overall trend
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const overallTrend = lastValue > firstValue ? '📈' : lastValue < firstValue ? '📉' : '➡️';
  
  sparkline += ` ${overallTrend}`;
  
  // Apply coloring
  if (color !== 'white') {
    sparkline = colorize(sparkline, color);
  }
  
  // Add title if provided
  let result = sparkline;
  if (title) {
    const titleLine = center(title, sparkline.length);
    result = titleLine + '\n' + sparkline;
  }
  
  return {
    chart: result,
    title,
    dimensions: { 
      width: sparkline.length, 
      height: title ? 2 : 1 
    }
  };
}