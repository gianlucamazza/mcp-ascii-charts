# mcp-ascii-charts

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

```bash
# Install the server
npm install -g mcp-ascii-charts

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
- **Colors**: ANSI color su
