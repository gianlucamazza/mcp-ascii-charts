import { ChartData, ChartResult } from '../types/index.js';
import { colorize } from '../utils/colors.js';
import { ASCII_CHARS, normalize, createGrid, gridToString, center, padLeft } from '../utils/ascii.js';

export interface HistogramOptions {
  bins?: number;
  showFrequency?: boolean;
}

interface HistogramBin {
  min: number;
  max: number;
  count: number;
  frequency: number;
}

export function createHistogram(data: ChartData, options: HistogramOptions = {}): ChartResult {
  const { data: values, title, width = 60, height = 15, color = 'white' } = data;
  const { bins = 10, showFrequency = true } = options;
  
  if (values.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  // Calculate histogram bins
  const histogramBins = calculateHistogramBins(values, bins);
  const maxCount = Math.max(...histogramBins.map(bin => bin.count));
  
  const chartWidth = width - 12; // Reserve space for y-axis labels
  const chartHeight = height - 3; // Reserve space for x-axis and title
  
  // Create the chart grid
  const grid = createGrid(width, height);
  
  // Draw y-axis labels (counts or frequencies)
  for (let y = 0; y < chartHeight; y++) {
    const value = maxCount - (y / (chartHeight - 1)) * maxCount;
    const label = showFrequency ? 
      ((value / values.length) * 100).toFixed(1) + '%' :
      Math.round(value).toString();
    const labelStr = padLeft(label, 10);
    
    // Place y-axis label
    for (let i = 0; i < Math.min(labelStr.length, 10); i++) {
      if (10 - i < width) {
        grid[y][10 - i] = labelStr[i];
      }
    }
    
    // Draw y-axis line
    if (11 < width) {
      grid[y][11] = y === chartHeight - 1 ? ASCII_CHARS.bottomLeft : 
                    y === 0 ? ASCII_CHARS.topLeft : ASCII_CHARS.teeRight;
    }
    
    // Draw horizontal grid lines
    for (let x = 12; x < width; x++) {
      if (y === chartHeight - 1) {
        grid[y][x] = ASCII_CHARS.horizontal;
      } else if (y % 2 === 0) {
        grid[y][x] = '·'; // Light grid dots
      }
    }
  }
  
  // Draw histogram bars
  const barWidth = Math.max(1, Math.floor(chartWidth / histogramBins.length));
  
  for (let i = 0; i < histogramBins.length; i++) {
    const bin = histogramBins[i];
    const barStartX = 12 + Math.floor(i * chartWidth / histogramBins.length);
    const normalizedCount = maxCount === 0 ? 0 : normalize(bin.count, 0, maxCount);
    const barHeight = Math.floor(normalizedCount * chartHeight);
    
    // Draw bar from bottom up
    for (let y = 0; y < barHeight; y++) {
      const gridY = chartHeight - 1 - y;
      if (gridY >= 0 && gridY < chartHeight) {
        for (let x = 0; x < barWidth && barStartX + x < width; x++) {
          grid[gridY][barStartX + x] = ASCII_CHARS.fullBlock;
        }
      }
    }
    
    // Add count/frequency on top of bar if space allows
    if (barHeight < chartHeight - 1) {
      const valueStr = showFrequency ? 
        ((bin.count / values.length) * 100).toFixed(0) :
        bin.count.toString();
      const valueY = chartHeight - barHeight - 1;
      
      if (valueY >= 0 && valueY < chartHeight) {
        for (let j = 0; j < valueStr.length && barStartX + j < width; j++) {
          grid[valueY][barStartX + j] = valueStr[j];
        }
      }
    }
  }
  
  // Draw x-axis labels (bin ranges)
  for (let i = 0; i < Math.min(histogramBins.length, 6); i++) { // Limit labels to avoid crowding
    const bin = histogramBins[i];
    const barStartX = 12 + Math.floor(i * chartWidth / histogramBins.length);
    const labelY = height - 1;
    
    // Create range label
    const rangeLabel = `${bin.min.toFixed(1)}-${bin.max.toFixed(1)}`;
    const label = rangeLabel.substring(0, Math.min(rangeLabel.length, barWidth + 2));
    
    if (labelY >= 0) {
      for (let j = 0; j < label.length && barStartX + j < width; j++) {
        grid[labelY][barStartX + j] = label[j];
      }
    }
  }
  
  // Convert grid to string and apply coloring
  let chart = gridToString(grid);
  
  if (color !== 'white') {
    chart = colorize(chart, color);
  }
  
  // Add title and statistics
  let result = '';
  if (title) {
    result += center(title, width) + '\n';
  }
  
  result += chart;
  
  // Add summary statistics
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = sortedValues.length % 2 === 0 ?
    (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2 :
    sortedValues[Math.floor(sortedValues.length / 2)];
  
  const statsLine = `n=${values.length}, μ=${mean.toFixed(2)}, median=${median.toFixed(2)}`;
  result += '\n' + center(statsLine, width);
  
  return {
    chart: result,
    title,
    dimensions: { width, height: height + 1 } // Account for stats line
  };
}

function calculateHistogramBins(values: number[], numBins: number): HistogramBin[] {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  const binWidth = range / numBins;
  
  const bins: HistogramBin[] = [];
  
  // Create bins
  for (let i = 0; i < numBins; i++) {
    const min = minValue + i * binWidth;
    const max = i === numBins - 1 ? maxValue : minValue + (i + 1) * binWidth;
    
    bins.push({
      min,
      max,
      count: 0,
      frequency: 0
    });
  }
  
  // Count values in each bin
  for (const value of values) {
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      if (value >= bin.min && (value <= bin.max || (i === bins.length - 1 && value === bin.max))) {
        bin.count++;
        break;
      }
    }
  }
  
  // Calculate frequencies
  for (const bin of bins) {
    bin.frequency = bin.count / values.length;
  }
  
  return bins;
}