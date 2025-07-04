# mcp-ascii-charts

[![npm version](https://badge.fury.io/js/mcp-ascii-charts.svg)](https://www.npmjs.com/package/mcp-ascii-charts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/gianlucamazza/mcp-ascii-charts/actions/workflows/ci.yml/badge.svg)](https://github.com/gianlucamazza/mcp-ascii-charts/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/mcp-ascii-charts.svg)](https://www.npmjs.com/package/mcp-ascii-charts)
[![GitHub stars](https://img.shields.io/github/stars/gianlucamazza/mcp-ascii-charts.svg?style=social)](https://github.com/gianlucamazza/mcp-ascii-charts)

A Model Context Protocol server for generating ASCII charts directly in your terminal.

## 🎯 Features

- **Pure ASCII charts** - Lightweight visualizations for terminal environments
- **MCP integration** - Compatible with Claude, Cursor, and other MCP clients
- **No GUI dependencies** - Perfect for servers and SSH environments
- **Highly customizable** - Configurable dimensions, colors, and styles

## 📊 Supported chart types

- **Line Chart** - Line graphs for temporal trends
- **Bar Chart** - Horizontal and vertical bar charts
- **Scatter Plot** - Scatter plots for data correlation
- **Histogram** - Distribution histograms
- **Sparkline** - Inline mini-charts

## 🚀 Quick installation

Available on [npm](https://www.npmjs.com/package/mcp-ascii-charts)

```bash
# Install from npm
npm install -g mcp-ascii-charts

# Or install from GitHub
npm install -g git+https://github.com/gianlucamazza/mcp-ascii-charts.git

# Add to your MCP configuration
{
  "mcpServers": {
    "ascii-charts": {
      "command": "mcp-ascii-charts"
    }
  }
}
```

## 💡 Usage examples

### Line chart

```text
Monthly Sales (2024)
     100 ┤                                        ╭╮    
      90 ┤                                      ╭─╯╰╮   
      80 ┤                                    ╭─╯   ╰╮  
      70 ┤                                  ╭─╯      │  
      60 ┤                               ╭──╯        ╰╮ 
      50 ┤                            ╭──╯            │ 
      40 ┤                         ╭──╯               ╰─
      30 ┤                      ╭──╯                   
      20 ┤                   ╭──╯                      
      10 ┤                ╭──╯                         
       0 ┼────────────────╯                            
         Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
```

### Bar chart

```text
Team Performance
Frontend  ████████████████████████████ 85%
Backend   ██████████████████████ 67%
DevOps    ████████████████ 54%
QA        ██████████████████████████████████ 92%
```

## 🛠️ MCP tools

| Function | Description |
|----------|-------------|
| `create_line_chart` | Generate line charts for temporal data |
| `create_bar_chart` | Create horizontal/vertical bar charts |
| `create_scatter_plot` | Visualize correlations between variables |
| `create_histogram` | Show frequency distributions |
| `create_sparkline` | Mini-charts for compact dashboards |

## 📋 Parameters

```javascript
{
  "data": [10, 25, 30, 45, 60],
  "labels": ["Q1", "Q2", "Q3", "Q4", "Q5"],
  "title": "Quarterly Growth",
  "width": 60,
  "height": 15,
  "color": "blue"
}
```

## 🎨 Customization

- **Dimensions**: Configure width and height
- **Colors**: ANSI color support (12 colors available)
- **Flexible data input**: Arrays with optional labels
- **Unicode rendering**: Box-drawing characters for smooth visuals

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/gianlucamazza/mcp-ascii-charts.git
cd mcp-ascii-charts

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📚 Documentation

- [Contributing Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [API Reference](https://github.com/gianlucamazza/mcp-ascii-charts/wiki)

## 🐛 Issues & Support

- [Report Issues](https://github.com/gianlucamazza/mcp-ascii-charts/issues)
- [Feature Requests](https://github.com/gianlucamazza/mcp-ascii-charts/issues/new?template=feature_request.md)
- [Bug Reports](https://github.com/gianlucamazza/mcp-ascii-charts/issues/new?template=bug_report.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull
requests, report issues, and contribute to the project.

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=gianlucamazza/mcp-ascii-charts&type=Date)](https://star-history.com/#gianlucamazza/mcp-ascii-charts&Date)
