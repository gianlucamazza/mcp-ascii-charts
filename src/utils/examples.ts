export const TOOL_EXAMPLES = {
  create_line_chart: {
    simple: {
      data: [10, 25, 30, 45, 60],
      title: "Sales Growth",
      width: 50,
      height: 12
    },
    withLabels: {
      data: [23, 45, 56, 78, 32, 45],
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      title: "Monthly Revenue",
      color: "green"
    },
    temporal: {
      data: [100, 120, 90, 140, 160, 180, 150, 200],
      labels: ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2", "Q3", "Q4"],
      title: "Quarterly Performance",
      width: 60,
      height: 15,
      color: "blue"
    }
  },
  
  create_bar_chart: {
    horizontal: {
      data: [85, 67, 54, 92],
      labels: ["Frontend", "Backend", "DevOps", "QA"],
      title: "Team Performance",
      orientation: "horizontal"
    },
    vertical: {
      data: [12, 19, 15, 25, 22, 18],
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      title: "Monthly Sales",
      orientation: "vertical",
      color: "cyan"
    },
    comparison: {
      data: [45, 55, 60, 40, 70],
      labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
      title: "Product Comparison",
      width: 70,
      height: 18
    }
  },
  
  create_scatter_plot: {
    correlation: {
      data: [1, 2, 3, 5, 8, 13, 21, 34],
      title: "Growth Pattern Analysis",
      width: 50,
      height: 12
    },
    distribution: {
      data: [12, 15, 18, 22, 19, 25, 30, 28, 35, 40],
      title: "Data Distribution",
      color: "magenta"
    },
    trend: {
      data: [100, 110, 105, 115, 120, 125, 130, 128, 135],
      title: "Trend Analysis",
      width: 60,
      height: 15
    }
  },
  
  create_histogram: {
    distribution: {
      data: [1, 2, 2, 3, 3, 3, 4, 4, 5, 6, 6, 7, 8, 9],
      title: "Value Distribution",
      bins: 5
    },
    performance: {
      data: [85, 87, 90, 92, 88, 91, 89, 93, 86, 94, 88, 90, 92],
      title: "Performance Scores",
      bins: 8,
      color: "yellow"
    },
    large_dataset: {
      data: Array.from({length: 100}, () => Math.random() * 100),
      title: "Random Data Distribution",
      bins: 12,
      width: 70,
      height: 20
    }
  },
  
  create_sparkline: {
    compact: {
      data: [1, 3, 2, 5, 4, 7, 6, 8],
      title: "Quick Trend"
    },
    metrics: {
      data: [23, 25, 22, 28, 30, 27, 31, 29, 33],
      title: "System Load",
      color: "red",
      width: 30
    },
    inline: {
      data: [100, 102, 98, 105, 110, 108, 112],
      width: 25
    }
  }
} as const;

export function getToolExamples(toolName: keyof typeof TOOL_EXAMPLES) {
  return TOOL_EXAMPLES[toolName];
}

export function getAllExamples() {
  return TOOL_EXAMPLES;
}