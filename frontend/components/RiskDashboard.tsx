"use client";

interface RiskMetrics {
  portfolio_volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  value_at_risk_95: number;
  conditional_var_95: number;
}

export default function RiskDashboard({ metrics }: { metrics: RiskMetrics }) {
  if (!metrics) return null;

  return (
    <div className="w-full bg-slate-900 rounded-xl shadow-lg p-4 md:p-6 mt-6 text-white">
      <h2 className="text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
        ⚠️ Advanced Risk Analysis
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-slate-800 p-3 md:p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-help" title="How much the portfolio's value fluctuates (annualized standard deviation).">
          <p className="text-xs text-slate-400 mb-1">Volatility (σ)</p>
          <p className="text-lg md:text-xl font-bold text-blue-400">{(metrics.portfolio_volatility * 100).toFixed(2)}%</p>
        </div>
        
        <div className="bg-slate-800 p-3 md:p-4 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors cursor-help" title="Measures risk-adjusted return. A higher number is better (>1.0 is considered good).">
          <p className="text-xs text-slate-400 mb-1">Sharpe Ratio</p>
          <p className="text-lg md:text-xl font-bold text-emerald-400">{metrics.sharpe_ratio.toFixed(2)}</p>
        </div>
        
        <div className="bg-slate-800 p-3 md:p-4 rounded-lg border border-slate-700 hover:border-rose-500 transition-colors cursor-help" title="The maximum observed peak-to-trough drop in portfolio value during the simulation.">
          <p className="text-xs text-slate-400 mb-1">Max Drawdown</p>
          <p className="text-lg md:text-xl font-bold text-rose-400">{(metrics.max_drawdown * 100).toFixed(1)}%</p>
        </div>

        <div className="bg-slate-800 p-3 md:p-4 rounded-lg border border-slate-700 hover:border-orange-500 transition-colors cursor-help" title="Value at Risk: There is a 5% chance the portfolio loses at least this much over the time horizon.">
          <p className="text-xs text-slate-400 mb-1">VaR (95%)</p>
          <p className="text-lg md:text-xl font-bold text-orange-400">{(metrics.value_at_risk_95 * 100).toFixed(1)}%</p>
        </div>

        <div className="bg-slate-800 p-3 md:p-4 rounded-lg border border-slate-700 hover:border-red-500 transition-colors cursor-help" title="Conditional VaR: The expected average loss if the 95% VaR threshold is breached (the 'worst case' average).">
          <p className="text-xs text-slate-400 mb-1">CVaR (95%)</p>
          <p className="text-lg md:text-xl font-bold text-red-500">{(metrics.conditional_var_95 * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}