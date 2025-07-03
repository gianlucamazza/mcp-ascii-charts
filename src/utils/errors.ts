import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export interface ErrorCodeDocumentation {
  code: ErrorCode;
  description: string;
  when: string;
  userAction: string;
  examples: string[];
}

export const ERROR_DOCUMENTATION: Partial<Record<ErrorCode, ErrorCodeDocumentation>> = {
  [ErrorCode.InvalidRequest]: {
    code: ErrorCode.InvalidRequest,
    description: "The request is malformed or missing required fields",
    when: "MCP protocol violation or invalid JSON structure",
    userAction: "Check request format and ensure all required fields are present",
    examples: [
      "Missing 'method' field in request",
      "Invalid JSON structure",
      "Wrong request schema"
    ]
  },

  [ErrorCode.MethodNotFound]: {
    code: ErrorCode.MethodNotFound,
    description: "The requested tool or method is not available",
    when: "Calling a tool that doesn't exist",
    userAction: "Use list_tools to see available tools and check tool name spelling",
    examples: [
      "create_pie_chart (not implemented)",
      "generate_chart (wrong tool name)",
      "create_line_graph (should be create_line_chart)"
    ]
  },

  [ErrorCode.InvalidParams]: {
    code: ErrorCode.InvalidParams,
    description: "Tool parameters are invalid or fail validation",
    when: "Input data doesn't meet requirements",
    userAction: "Check parameter types, ranges, and required fields",
    examples: [
      "data: [] (empty array)",
      "width: 5 (below minimum of 10)",
      "color: 'purple' (invalid color name)",
      "data: ['a', 'b'] (strings instead of numbers)"
    ]
  },

  [ErrorCode.InternalError]: {
    code: ErrorCode.InternalError,
    description: "Unexpected server error during chart generation",
    when: "Runtime errors, memory issues, or system failures",
    userAction: "Try reducing data size or complexity, check server logs",
    examples: [
      "Out of memory with very large datasets",
      "System resource exhaustion",
      "Unexpected calculation errors"
    ]
  },

  [ErrorCode.ParseError]: {
    code: ErrorCode.ParseError,
    description: "Failed to parse request JSON",
    when: "Malformed JSON in request body",
    userAction: "Validate JSON syntax and structure",
    examples: [
      "Missing closing bracket",
      "Trailing comma in JSON",
      "Invalid escape sequences"
    ]
  }
};

export function getErrorDocumentation(errorCode: ErrorCode): ErrorCodeDocumentation | undefined {
  return ERROR_DOCUMENTATION[errorCode];
}

export function getAllErrorDocumentation(): ErrorCodeDocumentation[] {
  return Object.values(ERROR_DOCUMENTATION);
}

export function formatErrorForUser(errorCode: ErrorCode, originalMessage: string): string {
  const doc = getErrorDocumentation(errorCode);
  if (!doc) {
    return originalMessage;
  }
  return `${doc.description}\n\nDetails: ${originalMessage}\n\nSuggestion: ${doc.userAction}`;
}

// Common validation error messages
export const VALIDATION_ERRORS = {
  EMPTY_DATA: "Data array cannot be empty",
  INVALID_DATA_TYPE: "All data values must be valid numbers",
  MISMATCHED_LABELS: "Labels array must have the same length as data array",
  INVALID_WIDTH: "Width must be a number between 10 and 200",
  INVALID_HEIGHT: "Height must be a number between 5 and 50",
  INVALID_COLOR: "Color must be a valid ANSI color name",
  INVALID_ORIENTATION: "Orientation must be 'horizontal' or 'vertical'",
  INVALID_BINS: "Number of bins must be between 3 and 50",
  INVALID_TITLE: "Title must be a string",
  NAN_VALUES: "Data contains NaN values",
  INFINITE_VALUES: "Data contains infinite values"
} as const;

export type ValidationErrorKey = keyof typeof VALIDATION_ERRORS;