import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './logger.js';

export type TransportType = 'stdio' | 'http';

export interface TransportConfig {
  type: TransportType;
  stdio?: {
    // No additional config needed for stdio
  };
  http?: {
    port: number;
    host: string;
    cors?: boolean;
    auth?: {
      type: 'bearer' | 'basic';
      token?: string;
      username?: string;
      password?: string;
    };
  };
}

export interface ServerTransport {
  connect(server: Server): Promise<void>;
  disconnect(): Promise<void>;
  getType(): TransportType;
}

export class StdioTransport implements ServerTransport {
  private transport?: StdioServerTransport;

  async connect(server: Server): Promise<void> {
    this.transport = new StdioServerTransport();
    await server.connect(this.transport);
    logger.info('Stdio transport connected');
  }

  async disconnect(): Promise<void> {
    // StdioServerTransport doesn't have explicit disconnect
    logger.info('Stdio transport disconnected');
  }

  getType(): TransportType {
    return 'stdio';
  }
}

export class HttpTransport implements ServerTransport {
  private config: TransportConfig['http'] & { port: number; host: string; cors: boolean };
  private server?: unknown; // HTTP server instance

  constructor(config: TransportConfig['http']) {
    this.config = {
      port: 3000,
      host: 'localhost',
      cors: true,
      ...config
    };
  }

  async connect(_server: Server): Promise<void> {
    // Note: HTTP transport would require additional implementation
    // This is a placeholder for future HTTP support
    logger.warn('HTTP transport not fully implemented yet', {
      port: this.config?.port,
      host: this.config?.host
    });
    
    throw new Error('HTTP transport not implemented. Use stdio transport for now.');
  }

  async disconnect(): Promise<void> {
    if (this.server) {
      // Close HTTP server
      logger.info('HTTP transport disconnected');
    }
  }

  getType(): TransportType {
    return 'http';
  }
}

export function createTransport(config: TransportConfig): ServerTransport {
  switch (config.type) {
    case 'stdio':
      return new StdioTransport();
    case 'http':
      return new HttpTransport(config.http);
    default:
      throw new Error(`Unsupported transport type: ${config.type}`);
  }
}

export function getTransportFromEnv(): TransportConfig {
  const transportType = (process.env.MCP_TRANSPORT_TYPE as TransportType) || 'stdio';
  
  switch (transportType) {
    case 'stdio':
      return { type: 'stdio' };
    case 'http':
      return {
        type: 'http',
        http: {
          port: parseInt(process.env.MCP_HTTP_PORT || '3000'),
          host: process.env.MCP_HTTP_HOST || 'localhost',
          cors: process.env.MCP_HTTP_CORS !== 'false',
          auth: process.env.MCP_HTTP_AUTH_TOKEN ? {
            type: 'bearer',
            token: process.env.MCP_HTTP_AUTH_TOKEN
          } : undefined
        }
      };
    default:
      logger.warn('Unknown transport type in environment, falling back to stdio', {
        provided: transportType
      });
      return { type: 'stdio' };
  }
}