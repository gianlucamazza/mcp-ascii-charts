#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  InitializeRequestSchema,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { createLineChart } from './charts/line-chart.js';
import { createBarChart } from './charts/bar-chart.js';
import { createScatterPlot } from './charts/scatter-plot.js';
import { createHistogram } from './charts/histogram.js';
import { createSparkline } from './charts/sparkline.js';
import { validateChartData, ValidationError } from './utils/validation.js';
import { McpToolParams } from './types/index.js';
import { logger, withRequestTracking } from './utils/logger.js';
import { withTimeout, TIMEOUT_CONFIG } from './utils/timeout.js';
import { createChartProgressReporter } from './utils/progress.js';
import { monitoring, setupGracefulShutdown } from './utils/monitoring.js';
import { createTransport, getTransportFromEnv } from './utils/transport.js';
import { getToolExamples } from './utils/examples.js';
import { formatErrorForUser } from './utils/errors.js';

const server = new Server(
  {
    name: 'mcp-ascii-charts',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle initialization
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error('[DEBUG] Initialize request received:', request.params);
  return {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: "mcp-ascii-charts",
      version: "1.0.0",
    },
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[DEBUG] List tools request received');
  return {
    tools: [
      {
        name: 'create_line_chart',
        description: 'Generate ASCII line charts for temporal data visualization',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'number' },
              description: 'Array of numeric values to plot'
            },
            labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional labels for x-axis (must match data length)',
              optional: true
            },
            title: {
              type: 'string',
              description: 'Optional chart title',
              optional: true
            },
            width: {
              type: 'number',
              description: 'Chart width (10-200, default: 60)',
              minimum: 10,
              maximum: 200,
              optional: true
            },
            height: {
              type: 'number',
              description: 'Chart height (5-50, default: 15)',
              minimum: 5,
              maximum: 50,
              optional: true
            },
            color: {
              type: 'string',
              description: 'ANSI color name (red, green, blue, yellow, etc.)',
              optional: true
            }
          },
          required: ['data'],
          examples: getToolExamples('create_line_chart')
        }
      },
      {
        name: 'create_bar_chart',
        description: 'Create horizontal or vertical ASCII bar charts',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'number' },
              description: 'Array of numeric values to plot'
            },
            labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional labels for bars',
              optional: true
            },
            title: {
              type: 'string',
              description: 'Optional chart title',
              optional: true
            },
            width: {
              type: 'number',
              description: 'Chart width (10-200, default: 60)',
              optional: true
            },
            height: {
              type: 'number',
              description: 'Chart height (5-50, default: 15)',
              optional: true
            },
            color: {
              type: 'string',
              description: 'ANSI color name',
              optional: true
            },
            orientation: {
              type: 'string',
              enum: ['horizontal', 'vertical'],
              description: 'Bar orientation (default: horizontal)',
              optional: true
            }
          },
          required: ['data'],
          examples: getToolExamples('create_bar_chart')
        }
      },
      {
        name: 'create_scatter_plot',
        description: 'Generate ASCII scatter plots for correlation analysis',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'number' },
              description: 'Array of y-values (x-values will be indices)'
            },
            labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional point labels',
              optional: true
            },
            title: {
              type: 'string',
              description: 'Optional chart title',
              optional: true
            },
            width: {
              type: 'number',
              description: 'Chart width (10-200, default: 60)',
              optional: true
            },
            height: {
              type: 'number',
              description: 'Chart height (5-50, default: 15)',
              optional: true
            },
            color: {
              type: 'string',
              description: 'ANSI color name',
              optional: true
            }
          },
          required: ['data'],
          examples: getToolExamples('create_scatter_plot')
        }
      },
      {
        name: 'create_histogram',
        description: 'Create ASCII histograms for frequency distribution',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'number' },
              description: 'Array of numeric values for distribution'
            },
            title: {
              type: 'string',
              description: 'Optional chart title',
              optional: true
            },
            width: {
              type: 'number',
              description: 'Chart width (10-200, default: 60)',
              optional: true
            },
            height: {
              type: 'number',
              description: 'Chart height (5-50, default: 15)',
              optional: true
            },
            color: {
              type: 'string',
              description: 'ANSI color name',
              optional: true
            },
            bins: {
              type: 'number',
              description: 'Number of histogram bins (default: 10)',
              minimum: 3,
              maximum: 50,
              optional: true
            }
          },
          required: ['data'],
          examples: getToolExamples('create_histogram')
        }
      },
      {
        name: 'create_sparkline',
        description: 'Generate compact ASCII sparklines for inline charts',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'number' },
              description: 'Array of numeric values to plot'
            },
            title: {
              type: 'string',
              description: 'Optional sparkline title',
              optional: true
            },
            width: {
              type: 'number',
              description: 'Sparkline width (10-100, default: 40)',
              minimum: 10,
              maximum: 100,
              optional: true
            },
            color: {
              type: 'string',
              description: 'ANSI color name',
              optional: true
            }
          },
          required: ['data'],
          examples: getToolExamples('create_sparkline')
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const requestId = logger.generateRequestId();
  monitoring.trackRequest(requestId);
  
  try {
    const { name, arguments: args } = request.params;
    const params = args as McpToolParams;
    
    logger.logRequest(name, params);
    const startTime = performance.now();

    const result = await withTimeout(
      generateChart(name, params),
      {
        timeoutMs: TIMEOUT_CONFIG.CHART_GENERATION,
        operation: `generate_chart_${name}`
      }
    );
    
    const duration = performance.now() - startTime;
    logger.logResponse(name, true, duration);
    monitoring.untrackRequest(requestId);
    
    return result;
  } catch (error) {
    const duration = performance.now() - (performance.now() - 100); // Approximate
    logger.logResponse(request.params.name, false, duration);
    monitoring.recordError(error as Error, `tool_${request.params.name}`);
    monitoring.untrackRequest(requestId);
    
    if (error instanceof ValidationError) {
      const mcpError = new McpError(
        ErrorCode.InvalidParams,
        formatErrorForUser(ErrorCode.InvalidParams, error.message)
      );
      logger.error('Validation error', error, { requestId, tool: request.params.name });
      throw mcpError;
    }
    
    const mcpError = new McpError(
      ErrorCode.InternalError,
      formatErrorForUser(ErrorCode.InternalError, error instanceof Error ? error.message : String(error))
    );
    logger.error('Internal error', error as Error, { requestId, tool: request.params.name });
    throw mcpError;
  }
});

async function generateChart(name: string, params: McpToolParams) {
  const progress = createChartProgressReporter(name.replace('create_', ''), params.data?.length || 0);
  
  try {
    progress.nextStep('Validating input data');
    const chartData = await withTimeout(
      Promise.resolve(validateChartData(params)),
      {
        timeoutMs: TIMEOUT_CONFIG.VALIDATION,
        operation: 'validate_chart_data'
      }
    );
    
    progress.nextStep('Processing chart data');
    let result;
    
    switch (name) {
      case 'create_line_chart': {
        progress.nextStep('Generating line chart');
        result = await withRequestTracking(
          () => Promise.resolve(createLineChart(chartData)),
          'create_line_chart'
        )();
        break;
      }

      case 'create_bar_chart': {
        progress.nextStep('Generating bar chart');
        const orientation = params.orientation || 'horizontal';
        result = await withRequestTracking(
          () => Promise.resolve(createBarChart(chartData, { orientation })),
          'create_bar_chart'
        )();
        break;
      }

      case 'create_scatter_plot': {
        progress.nextStep('Generating scatter plot');
        result = await withRequestTracking(
          () => Promise.resolve(createScatterPlot(chartData)),
          'create_scatter_plot'
        )();
        break;
      }

      case 'create_histogram': {
        progress.nextStep('Generating histogram');
        const bins = params.bins || 10;
        result = await withRequestTracking(
          () => Promise.resolve(createHistogram(chartData, { bins })),
          'create_histogram'
        )();
        break;
      }

      case 'create_sparkline': {
        progress.nextStep('Generating sparkline');
        result = await withRequestTracking(
          () => Promise.resolve(createSparkline(chartData)),
          'create_sparkline'
        )();
        break;
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          formatErrorForUser(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
        );
    }
    
    progress.nextStep('Applying formatting and colors');
    progress.complete('Chart generation completed successfully');
    
    return {
      content: [
        {
          type: 'text',
          text: result.chart
        }
      ]
    };
  } catch (error) {
    progress.fail(error as Error);
    throw error;
  }
}

async function main() {
  try {
    // Setup monitoring and graceful shutdown
    setupGracefulShutdown();
    
    // Log server startup
    logger.info('MCP ASCII Charts server starting', {
      version: '1.0.0',
      node: process.version,
      platform: process.platform
    });
    
    // Get transport configuration
    const transportConfig = getTransportFromEnv();
    logger.info('Transport configuration loaded', { type: transportConfig.type });
    
    // Create and connect transport
    console.error('[DEBUG] Creating transport with config:', transportConfig);
    const transport = createTransport(transportConfig);
    console.error('[DEBUG] Connecting transport to server...');
    await transport.connect(server);
    console.error('[DEBUG] Transport connected, server ready');
    
    // Log successful startup
    logger.info('MCP ASCII Charts server running', {
      transport: transport.getType(),
      capabilities: ['tools'],
      toolCount: 5
    });
    
    // Start health monitoring
    setInterval(() => {
      monitoring.logHealthStatus();
    }, 60000); // Every minute
    
    // Cleanup old monitoring data
    setInterval(() => {
      monitoring.cleanup();
    }, 3600000); // Every hour
    
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

// Add error handlers for uncaught exceptions and promise rejections
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('[FATAL] Server failed to start:', error);
  process.exit(1);
});