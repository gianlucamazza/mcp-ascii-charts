# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Run the MCP server in development mode with hot reloading
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled server (builds automatically)

### Testing & Quality
- `npm test` - Run the full Jest test suite
- `npm test -- --coverage` - Run tests with coverage report
- `npm test -- src/__tests__/charts/bar-chart.test.ts` - Run a specific test file
- `npm run lint` - Run ESLint on TypeScript files
- `npm run typecheck` - Type check without emitting files
- `npm run health` - Test the health check endpoint

### Before Committing
Always run these commands to ensure code quality:
```bash
npm run lint
npm run typecheck
npm test
```

## Architecture Overview

This is a Model Context Protocol (MCP) server that generates ASCII charts for terminal environments. The codebase follows a modular architecture:

### Core Structure
- **Entry Point**: `src/index.ts` implements the MCP server using `@modelcontextprotocol/sdk`
- **Chart Generators**: Each chart type (line, bar, scatter, histogram, sparkline) has its own module in `src/charts/`
- **Shared Utilities**: Common functionality in `src/utils/` including ASCII rendering, validation, logging, and monitoring
- **Type Safety**: All types defined in `src/types/index.ts`

### Key Architectural Patterns

1. **Tool Registration**: The MCP server registers 5 tools (create_line_chart, create_bar_chart, etc.) that clients can invoke
2. **Request Flow**: Tool request → Validation → Progress reporting → Chart generation → ASCII rendering → Color application → Response
3. **Error Handling**: MCP-compliant error codes with user-friendly messages and error pattern tracking
4. **Monitoring**: Built-in request tracking, performance metrics, and health status reporting
5. **Grid-Based Rendering**: All charts use a common grid system with Unicode box-drawing characters

### Adding New Chart Types

To add a new chart type:
1. Create a new module in `src/charts/` following the existing pattern
2. Add the type definitions to `src/types/index.ts`
3. Register the tool in `src/index.ts` with proper validation
4. Add comprehensive tests in `src/__tests__/charts/`
5. Update the README.md with examples

### Important Considerations

- The project has zero production dependencies except `@modelcontextprotocol/sdk`
- All chart generation is pure ASCII with optional ANSI colors
- Progress reporting is built into the tool handler for better UX
- The server implements graceful shutdown and resource cleanup
- Logging is structured JSON with credential protection
- Timeout handling is configurable (default 30s per request)

## Integration with Claude Desktop

### Global Installation
```bash
npm run build
npm install -g .
```

### Claude Desktop Configuration
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "ascii-charts": {
      "command": "mcp-ascii-charts"
    }
  }
}
```

### Available Tools in Claude Desktop
- `create_line_chart` - Line graphs for temporal trends
- `create_bar_chart` - Horizontal and vertical bar charts  
- `create_scatter_plot` - Scatter plots for data correlation
- `create_histogram` - Distribution histograms
- `create_sparkline` - Inline mini-charts

### Testing Integration
After installation, restart Claude Desktop and test with:
```
Create a bar chart with data [10, 25, 35, 20] and labels ["Q1", "Q2", "Q3", "Q4"]
```