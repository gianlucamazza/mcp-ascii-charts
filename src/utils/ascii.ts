export const ASCII_CHARS = {
  horizontal: '─',
  vertical: '│',
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  cross: '┼',
  teeUp: '┴',
  teeDown: '┬',
  teeLeft: '┤',
  teeRight: '├',
  
  // Line chart characters
  lineHorizontal: '─',
  lineVertical: '│',
  lineUpRight: '└',
  lineUpLeft: '┘',
  lineDownRight: '┌',
  lineDownLeft: '┐',
  lineCross: '┼',
  
  // Box drawing for smooth curves
  curveUpRight: '╰',
  curveUpLeft: '╯',
  curveDownRight: '╭',
  curveDownLeft: '╮',
  
  // Bar chart characters
  fullBlock: '█',
  leftHalfBlock: '▌',
  rightHalfBlock: '▐',
  lightShade: '░',
  mediumShade: '▒',
  darkShade: '▓',
  
  // Scatter plot
  point: '●',
  smallPoint: '·',
  
  // Sparkline
  sparkBlocks: ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
} as const;

export function padLeft(text: string, width: number, char: string = ' '): string {
  return text.padStart(width, char);
}

export function padRight(text: string, width: number, char: string = ' '): string {
  return text.padEnd(width, char);
}

export function center(text: string, width: number, char: string = ' '): string {
  const totalPadding = width - text.length;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;
  return char.repeat(leftPadding) + text + char.repeat(rightPadding);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

export function formatNumber(value: number, precision: number = 2): string {
  return value.toFixed(precision);
}

export function createGrid(width: number, height: number): string[][] {
  return Array(height).fill(null).map(() => Array(width).fill(' '));
}

export function gridToString(grid: string[][]): string {
  return grid.map(row => row.join('')).join('\n');
}