"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface DistributionChartProps {
  finalValues: number[];
  mean: number;
  stdDev: number;
  skewness: number;
  kurtosis: number;
}

export default function DistributionChart({ finalValues, mean, stdDev, skewness, kurtosis }: DistributionChartProps) {
  const plotData = useMemo(() => {
    if (!finalValues || finalValues.length === 0) return [];

    const curveX = [];
    const curveY = [];
    const minX = mean - 4 * stdDev;
    const maxX = mean + 4 * stdDev;
    const step = (maxX - minX) / 200;

    for (let x = minX; x <= maxX; x += step) {
      curveX.push(x);
      const exponent = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * exponent;
      curveY.push(y);
    }

    return [
      {
        x: finalValues,
        type: "histogram",
        name: "Actual Sim Distribution",
        histnorm: "probability density",
        marker: { color: "rgba(99, 102, 241, 0.4)" }, 
      },
      {
        x: curveX,
        y: curveY,
        type: "scatter",
        mode: "lines",
        name: "Theoretical Normal Curve",
        line: { color: "rgba(239, 68, 68, 1)", width: 2 }, 
      },
    ] as any[];
  }, [finalValues, mean, stdDev]);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Portfolio Outcome Distribution</h2>
        <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-md border">
          Skewness: <span className={Math.abs(skewness) > 0.5 ? "text-amber-600 font-bold" : ""}>{skewness.toFixed(2)}</span> | 
          Kurtosis: {kurtosis.toFixed(2)}
        </div>
      </div>
      
      {Math.abs(skewness) > 0.5 && (
        <p className="text-xs text-amber-600 mb-2">
          Note: High skewness detected. Actual returns are asymmetrical; the normal distribution is only an approximation.
        </p>
      )}

      <div className="h-[400px]">
        <Plot
          data={plotData}
          layout={{
            autosize: true,
            margin: { t: 10, l: 50, r: 10, b: 40 },
            xaxis: { title: "Final Portfolio Value ($)", tickformat: "$,.0f" },
            yaxis: { title: "Probability Density", showticklabels: false },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            showlegend: true,
            barmode: "overlay",
            shapes: [
              { type: 'line', x0: mean, x1: mean, y0: 0, y1: 1, yref: 'paper', line: { color: 'black', width: 2, dash: 'dot' } },
              { type: 'line', x0: mean - stdDev, x1: mean - stdDev, y0: 0, y1: 1, yref: 'paper', line: { color: 'gray', width: 1, dash: 'dash' } },
              { type: 'line', x0: mean + stdDev, x1: mean + stdDev, y0: 0, y1: 1, yref: 'paper', line: { color: 'gray', width: 1, dash: 'dash' } },
              { type: 'line', x0: mean - 2*stdDev, x1: mean - 2*stdDev, y0: 0, y1: 1, yref: 'paper', line: { color: 'lightgray', width: 1, dash: 'dash' } },
              { type: 'line', x0: mean + 2*stdDev, x1: mean + 2*stdDev, y0: 0, y1: 1, yref: 'paper', line: { color: 'lightgray', width: 1, dash: 'dash' } },
            ],
            annotations: [
              { x: mean, y: 1.05, yref: 'paper', text: 'μ', showarrow: false },
              { x: mean + stdDev, y: 1.05, yref: 'paper', text: '+1σ', showarrow: false, font: {color: 'gray', size: 10} },
              { x: mean - stdDev, y: 1.05, yref: 'paper', text: '-1σ', showarrow: false, font: {color: 'gray', size: 10} },
            ]
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}