export const ANSI_COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m'
} as const;

export type ColorName = keyof typeof ANSI_COLORS;

export function colorize(text: string, color: string = 'white'): string {
  const colorCode = ANSI_COLORS[color as ColorName] || ANSI_COLORS.white;
  return `${colorCode}${text}${ANSI_COLORS.reset}`;
}

export function isValidColor(color: string): boolean {
  return color in ANSI_COLORS;
}

export function getColorList(): string[] {
  return Object.keys(ANSI_COLORS).filter(key => key !== 'reset');
}