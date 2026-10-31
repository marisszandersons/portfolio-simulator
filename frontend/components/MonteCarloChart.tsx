"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

// Plotly needs to be dynamically imported in Next.js to avoid server-side rendering issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface MonteCarloChartProps {
  paths: number[][];
}

export default function MonteCarloChart({ paths }: MonteCarloChartProps) {
  const plotData = useMemo(() => {
    if (!paths || paths.length === 0) return [];

    const months = paths[0].length;
    const xValues = Array.from({ length: months }, (_, i) => i);

    return paths.map((path, index) => {
      const isMedian = index === Math.floor(paths.length / 2);
      
      return {
        x: xValues,
        y: path,
        type: "scatter",
        mode: "lines",
        line: {
          color: isMedian ? "rgba(255, 99, 132, 1)" : "rgba(75, 192, 192, 0.1)",
          width: isMedian ? 3 : 1,
        },
        name: isMedian ? "Median Path" : `Path ${index + 1}`,
        showlegend: isMedian,
        hoverinfo: "y",
      } as any;
    });
  }, [paths]);

  return (
    <div className="w-full h-[500px] bg-white rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">100 Simulated Portfolio Paths (Inflation Adjusted)</h2>
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          margin: { t: 10, l: 50, r: 10, b: 40 },
          xaxis: { title: "Months", showgrid: false },
          yaxis: { title: "Portfolio Value", tickformat: "$,.0f" },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          showlegend: true,
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}