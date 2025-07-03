import { ChartData, ChartResult } from '../types/index.js';
import { colorize } from '../utils/colors.js';
import { ASCII_CHARS, normalize, clamp, createGrid, gridToString, center, padLeft } from '../utils/ascii.js';

export interface ScatterPlotOptions {
  pointChar?: string;
  showTrendLine?: boolean;
}

export function createScatterPlot(data: ChartData, options: ScatterPlotOptions = {}): ChartResult {
  const { data: values, title, width = 60, height = 15, color = 'white' } = data;
  const { pointChar = ASCII_CHARS.point, showTrendLine = false } = options;
  
  if (values.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  const chartWidth = width - 10; // Reserve space for y-axis labels
  const chartHeight = height - 3; // Reserve space for x-axis and title
  
  // Create x-values (indices) and y-values (data)
  const xValues = values.map((_, i) => i);
  const yValues = values;
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  // const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  
  // Create the chart grid
  const grid = createGrid(width, height);
  
  // Draw y-axis labels and grid lines
  for (let y = 0; y < chartHeight; y++) {
    const value = maxY - (y / (chartHeight - 1)) * yRange;
    const label = value.toFixed(1);
    const labelStr = padLeft(label, 8);
    
    // Place y-axis label
    for (let i = 0; i < Math.min(labelStr.length, 8); i++) {
      if (8 - i < width) {
        grid[y][8 - i] = labelStr[i];
      }
    }
    
    // Draw y-axis line
    if (9 < width) {
      grid[y][9] = y === chartHeight - 1 ? ASCII_CHARS.bottomLeft : 
                   y === 0 ? ASCII_CHARS.topLeft : ASCII_CHARS.teeRight;
    }
    
    // Draw horizontal grid lines
    for (let x = 10; x < width; x++) {
      if (y === chartHeight - 1) {
        grid[y][x] = ASCII_CHARS.horizontal;
      } else if (y % 3 === 0) {
        grid[y][x] = '·'; // Light grid dots
      }
    }
  }
  
  // Draw x-axis labels
  const labelStep = Math.max(1, Math.floor(xValues.length / 8));
  for (let i = 0; i < xValues.length; i += labelStep) {
    const x = 10 + Math.floor(normalize(xValues[i], minX, maxX) * (chartWidth - 1));
    const label = xValues[i].toString();
    
    if (x + label.length <= width && height - 1 >= 0) {
      for (let j = 0; j < label.length && x + j < width; j++) {
        grid[height - 1][x + j] = label[j];
      }
    }
  }
  
  // Plot points
  const plotPoints: { x: number; y: number; originalX: number; originalY: number }[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const normalizedX = normalize(xValues[i], minX, maxX);
    const normalizedY = normalize(yValues[i], minY, maxY);
    
    const plotX = 10 + Math.floor(normalizedX * (chartWidth - 1));
    const plotY = Math.floor((1 - normalizedY) * (chartHeight - 1));
    
    const x = clamp(plotX, 10, width - 1);
    const y = clamp(plotY, 0, chartHeight - 1);
    
    plotPoints.push({ 
      x, 
      y, 
      originalX: xValues[i], 
      originalY: yValues[i] 
    });
    
    // Draw the point
    if (x < width && y < chartHeight) {
      grid[y][x] = pointChar;
    }
  }
  
  // Draw trend line if requested
  if (showTrendLine && values.length > 1) {
    const trendLine = calculateLinearRegression(plotPoints.map(p => p.originalX), plotPoints.map(p => p.originalY));
    drawTrendLine(grid, trendLine, minX, maxX, minY, maxY, chartWidth, chartHeight);
  }
  
  // Convert grid to string and apply coloring
  let chart = gridToString(grid);
  
  if (color !== 'white') {
    chart = colorize(chart, color);
  }
  
  // Add title if provided
  if (title) {
    const titleLine = center(title, width);
    chart = titleLine + '\n' + chart;
  }
  
  return {
    chart,
    title,
    dimensions: { width, height }
  };
}

interface LinearRegression {
  slope: number;
  intercept: number;
  rSquared: number;
}

function calculateLinearRegression(xValues: number[], yValues: number[]): LinearRegression {
  const n = xValues.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  // const sumYY = yValues.reduce((sum, y) => sum + y * y, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = yValues.reduce((sum, y, i) => {
    const predicted = slope * xValues[i] + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);
  
  return { slope, intercept, rSquared };
}

function drawTrendLine(
  grid: string[][],
  trendLine: LinearRegression,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  chartWidth: number,
  chartHeight: number
): void {
  const { slope, intercept } = trendLine;
  
  // Calculate start and end points of trend line
  const startY = slope * minX + intercept;
  const endY = slope * maxX + intercept;
  
  // Convert to grid coordinates
  const startGridX = 10;
  const endGridX = 10 + chartWidth - 1;
  
  const startGridY = Math.floor((1 - normalize(startY, minY, maxY)) * (chartHeight - 1));
  const endGridY = Math.floor((1 - normalize(endY, minY, maxY)) * (chartHeight - 1));
  
  // Draw line using Bresenham's algorithm
  drawLine(grid, startGridX, startGridY, endGridX, endGridY, chartWidth, chartHeight);
}

function drawLine(
  grid: string[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  maxWidth: number,
  maxHeight: number
): void {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  
  let x = x1;
  let y = y1;
  
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Draw line character (only if cell is empty or has grid dots)
    if (x >= 10 && x < maxWidth + 10 && y >= 0 && y < maxHeight) {
      if (grid[y][x] === ' ' || grid[y][x] === '·') {
        grid[y][x] = ASCII_CHARS.horizontal;
      }
    }
    
    if (x === x2 && y === y2) break;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}