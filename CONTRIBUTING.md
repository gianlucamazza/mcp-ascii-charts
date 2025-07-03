# Contributing to MCP ASCII Charts

Thank you for your interest in contributing to MCP ASCII Charts! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mcp-ascii-charts.git
   cd mcp-ascii-charts
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Workflow

### Running the Project

```bash
# Development mode with auto-reload
npm run dev

# Build the project
npm run build

# Run tests
npm run test

# Run linting
npm run lint:all

# Type checking
npm run typecheck
```

### Project Structure

```
src/
├── charts/          # Chart generation modules
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── __tests__/       # Test files
└── index.ts         # Main MCP server entry point
```

## 📝 Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Code Style

- Follow the existing ESLint configuration
- Use 2 spaces for indentation
- Maximum line length: 120 characters
- Use trailing commas in multiline structures

### Testing

- Write tests for all new functionality
- Maintain or improve test coverage
- Use descriptive test names
- Test both success and error cases

Example test structure:
```typescript
describe('Chart Generation', () => {
  test('should create line chart with valid data', () => {
    // Test implementation
  });

  test('should throw error for invalid data', () => {
    // Error testing
  });
});
```

## 🎯 Adding New Chart Types

When adding a new chart type:

1. Create a new file in `src/charts/`
2. Implement the chart generation function
3. Add TypeScript types to `src/types/`
4. Register the tool in `src/index.ts`
5. Add comprehensive tests
6. Update documentation and examples

### Chart Function Template

```typescript
import { ChartData, ChartResult } from '../types/index.js';

export function createNewChart(data: ChartData): ChartResult {
  // Validate input
  if (data.data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  // Generate chart
  const chart = generateAsciiChart(data);

  return {
    chart,
    title: data.title,
    dimensions: { width: data.width || 60, height: data.height || 15 }
  };
}
```

## 🧪 Testing Guidelines

### Test Categories

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test chart generation end-to-end
3. **Validation Tests**: Test input validation

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📚 Documentation

### README Updates

When adding features, update:
- Feature list
- Usage examples
- API documentation
- Installation instructions

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter descriptions and return types
- Provide usage examples in comments

## 🔍 Pull Request Process

1. **Create Feature Branch**: Use descriptive branch names
   ```bash
   git checkout -b feature/add-pie-charts
   git checkout -b fix/histogram-overflow
   git checkout -b docs/update-examples
   ```

2. **Make Changes**: Follow coding standards and test thoroughly

3. **Commit Messages**: Use conventional commit format
   ```bash
   feat: add pie chart support
   fix: resolve histogram overflow issue
   docs: update API examples
   test: add scatter plot test cases
   ```

4. **Test Everything**:
   ```bash
   npm run test
   npm run lint:all
   npm run build
   ```

5. **Submit PR**: Include description, testing notes, and examples

### PR Requirements

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Examples provided for new features

## 🐛 Bug Reports

When reporting bugs:

1. Use the bug report template
2. Provide minimal reproduction case
3. Include environment details
4. Add relevant logs (sanitized)

## 💡 Feature Requests

For new features:

1. Use the feature request template
2. Describe the use case clearly
3. Provide mockups or examples
4. Consider implementation complexity

## 🚦 Release Process

Releases follow semantic versioning:

- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

## 📞 Getting Help

- Open an issue for questions
- Check existing issues and PRs
- Review the documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- CHANGELOG.md
- GitHub contributors list
- Special mentions for significant contributions

Thank you for contributing to MCP ASCII Charts! 🎉