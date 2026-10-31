"use client";

interface PercentileTableProps {
  percentiles: Record<string, number>;
  totalInvested: number;
}

export default function PercentileTable({ percentiles, totalInvested }: PercentileTableProps) {
  const rows = [
    { label: "Best Case (99th Percentile)", value: percentiles.p_99 },
    { label: "Great Case (90th Percentile)", value: percentiles.p_90 },
    { label: "Good Case (75th Percentile)", value: percentiles.p_75 },
    { label: "Median (50th Percentile)", value: percentiles.p_50 },
    { label: "Below Average (25th Percentile)", value: percentiles.p_25 },
    { label: "Bad Case (10th Percentile)", value: percentiles.p_10 },
    { label: "Worst Case (1st Percentile)", value: percentiles.p_1 },
  ];

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6 mt-6 border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Outcome Probabilities & Returns</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-sm">
              <th className="py-3 px-4 font-medium">Scenario</th>
              <th className="py-3 px-4 font-medium text-right">Final Value</th>
              <th className="py-3 px-4 font-medium text-right">Profit / Loss ($)</th>
              <th className="py-3 px-4 font-medium text-right">Return (%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const profit = row.value - totalInvested;
              const returnPct = (profit / totalInvested) * 100;
              const isProfit = profit >= 0;

              return (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-700">{row.label}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">
                    ${row.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isProfit ? '+' : '-'}${Math.abs(profit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isProfit ? '+' : ''}{returnPct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}