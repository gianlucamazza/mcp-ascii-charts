import { ChartData, ChartResult } from '../types/index.js';
import { colorize } from '../utils/colors.js';
import { ASCII_CHARS, normalize, clamp, createGrid, gridToString, center, padLeft } from '../utils/ascii.js';

export function createLineChart(data: ChartData): ChartResult {
  const { data: values, labels, title, width = 60, height = 15, color = 'white' } = data;
  
  if (values.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  const chartWidth = width - 10; // Reserve space for y-axis labels
  const chartHeight = height - 2; // Reserve space for x-axis
  
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;
  
  // Create the chart grid
  const grid = createGrid(width, height);
  
  // Draw y-axis labels and grid lines
  for (let y = 0; y < chartHeight; y++) {
    const value = maxValue - (y / (chartHeight - 1)) * valueRange;
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
    
    // Draw horizontal grid lines (optional light lines)
    for (let x = 10; x < width; x++) {
      if (y === chartHeight - 1) {
        grid[y][x] = ASCII_CHARS.horizontal;
      } else if (y % 2 === 0) {
        grid[y][x] = '·'; // Light grid dots
      }
    }
  }
  
  // Draw x-axis labels
  if (labels && labels.length === values.length) {
    // const labelSpacing = Math.max(1, Math.floor(chartWidth / Math.min(labels.length, 8)));
    for (let i = 0; i < labels.length && i < 8; i++) {
      const x = 10 + Math.floor((i / (labels.length - 1)) * (chartWidth - 1));
      const label = labels[i].substring(0, 6); // Truncate long labels
      
      if (x + label.length <= width && height - 1 >= 0) {
        for (let j = 0; j < label.length && x + j < width; j++) {
          grid[height - 1][x + j] = label[j];
        }
      }
    }
  }
  
  // Plot the line
  const plotPoints: { x: number; y: number }[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const x = values.length === 1 ? 
      10 + Math.floor(chartWidth / 2) : 
      10 + Math.floor((i / (values.length - 1)) * (chartWidth - 1));
    const normalizedValue = valueRange === 0 ? 0.5 : normalize(values[i], minValue, maxValue);
    const y = Math.floor((1 - normalizedValue) * (chartHeight - 1));
    
    plotPoints.push({ x: clamp(x, 10, width - 1), y: clamp(y, 0, chartHeight - 1) });
  }
  
  // Draw line segments between points
  for (let i = 0; i < plotPoints.length; i++) {
    const point = plotPoints[i];
    
    // Draw the point
    if (point.x < width && point.y < chartHeight) {
      grid[point.y][point.x] = '●';
    }
    
    // Draw line to next point
    if (i < plotPoints.length - 1) {
      const nextPoint = plotPoints[i + 1];
      drawLine(grid, point.x, point.y, nextPoint.x, nextPoint.y, chartWidth, chartHeight);
    }
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
    // Draw line character based on direction
    if (x >= 10 && x < maxWidth + 10 && y >= 0 && y < maxHeight) {
      if (grid[y][x] === ' ' || grid[y][x] === '·') {
        if (dx > dy) {
          grid[y][x] = ASCII_CHARS.horizontal;
        } else if (dy > dx) {
          grid[y][x] = ASCII_CHARS.vertical;
        } else {
          grid[y][x] = x < x2 ? ASCII_CHARS.curveUpRight : ASCII_CHARS.curveUpLeft;
        }
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