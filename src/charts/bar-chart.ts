import { ChartData, ChartResult } from '../types/index.js';
import { colorize } from '../utils/colors.js';
import { ASCII_CHARS, normalize, createGrid, gridToString, center, padRight } from '../utils/ascii.js';

export interface BarChartOptions {
  orientation?: 'horizontal' | 'vertical';
  showValues?: boolean;
}

export function createBarChart(data: ChartData, options: BarChartOptions = {}): ChartResult {
  const { data: values } = data;
  const { orientation = 'horizontal', showValues = true } = options;
  
  if (values.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (orientation === 'horizontal') {
    return createHorizontalBarChart(data, showValues);
  } else {
    return createVerticalBarChart(data, showValues);
  }
}

function createHorizontalBarChart(data: ChartData, showValues: boolean): ChartResult {
  const { data: values, labels, title, width = 60, height = 15, color = 'white' } = data;
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values, 0); // Include 0 for proper scaling
  const valueRange = maxValue - minValue;
  
  // Calculate label width
  const maxLabelLength = labels ? Math.max(...labels.map(l => l.length)) : 0;
  const labelWidth = Math.min(maxLabelLength, 15);
  
  // Calculate bar area
  const barAreaWidth = width - labelWidth - 15; // Reserve space for labels and values
  const barsHeight = Math.min(values.length, height - (title ? 1 : 0));
  
  let result = '';
  
  // Add title
  if (title) {
    result += center(title, width) + '\n';
  }
  
  // Create bars
  for (let i = 0; i < values.length && i < barsHeight; i++) {
    let line = '';
    
    // Add label
    const label = labels && labels[i] ? labels[i].substring(0, labelWidth) : `Item ${i + 1}`;
    line += padRight(label, labelWidth);
    
    // Calculate bar length
    const normalizedValue = valueRange === 0 ? 0.5 : normalize(values[i], minValue, maxValue);
    const barLength = Math.floor(normalizedValue * barAreaWidth);
    
    // Create bar
    const fullBlocks = Math.floor(barLength);
    const remainder = barLength - fullBlocks;
    
    line += ' ';
    line += ASCII_CHARS.fullBlock.repeat(fullBlocks);
    
    // Add partial block if needed
    if (remainder > 0.75) {
      line += ASCII_CHARS.darkShade;
    } else if (remainder > 0.5) {
      line += ASCII_CHARS.mediumShade;
    } else if (remainder > 0.25) {
      line += ASCII_CHARS.lightShade;
    }
    
    // Add value if requested
    if (showValues) {
      const valueStr = ` ${values[i].toFixed(1)}`;
      line += valueStr;
    }
    
    result += line + '\n';
  }
  
  // Apply coloring
  if (color !== 'white') {
    result = colorize(result, color);
  }
  
  return {
    chart: result.trimEnd(),
    title,
    dimensions: { width, height }
  };
}

function createVerticalBarChart(data: ChartData, showValues: boolean): ChartResult {
  const { data: values, labels, title, width = 60, height = 15, color = 'white' } = data;
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values, 0);
  const valueRange = maxValue - minValue;
  
  const chartHeight = height - 3 - (title ? 1 : 0); // Reserve space for x-axis and title
  const barWidth = Math.max(1, Math.floor((width - 2) / values.length));
  const totalBarsWidth = Math.min(values.length * barWidth, width - 2);
  
  // Create grid
  const grid = createGrid(width, height);
  const startY = title ? 1 : 0;
  
  // Draw bars
  for (let i = 0; i < values.length; i++) {
    const barStartX = 1 + Math.floor(i * totalBarsWidth / values.length);
    const normalizedValue = valueRange === 0 ? 0.5 : normalize(values[i], minValue, maxValue);
    const barHeight = Math.floor(normalizedValue * chartHeight);
    
    // Draw bar from bottom up
    for (let y = 0; y < barHeight; y++) {
      const gridY = startY + chartHeight - 1 - y;
      if (gridY >= 0 && gridY < height - 2) {
        for (let x = 0; x < barWidth && barStartX + x < width - 1; x++) {
          grid[gridY][barStartX + x] = ASCII_CHARS.fullBlock;
        }
      }
    }
    
    // Add value on top if requested and space allows
    if (showValues && barHeight < chartHeight - 1) {
      const valueStr = values[i].toFixed(1);
      const valueY = startY + chartHeight - barHeight - 1;
      if (valueY >= 0 && valueY < height - 2) {
        for (let j = 0; j < valueStr.length && barStartX + j < width; j++) {
          grid[valueY][barStartX + j] = valueStr[j];
        }
      }
    }
  }
  
  // Draw x-axis
  const axisY = height - 2;
  if (axisY >= 0) {
    for (let x = 0; x < width; x++) {
      grid[axisY][x] = ASCII_CHARS.horizontal;
    }
  }
  
  // Add labels
  if (labels) {
    for (let i = 0; i < Math.min(labels.length, values.length); i++) {
      const barStartX = 1 + Math.floor(i * totalBarsWidth / values.length);
      const label = labels[i].substring(0, barWidth);
      const labelY = height - 1;
      
      if (labelY >= 0) {
        for (let j = 0; j < label.length && barStartX + j < width; j++) {
          grid[labelY][barStartX + j] = label[j];
        }
      }
    }
  }
  
  let result = gridToString(grid);
  
  // Add title
  if (title) {
    const titleLine = center(title, width);
    result = titleLine + '\n' + result;
  }
  
  // Apply coloring
  if (color !== 'white') {
    result = colorize(result, color);
  }
  
  return {
    chart: result,
    title,
    dimensions: { width, height }
  };
}