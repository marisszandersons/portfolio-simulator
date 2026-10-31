"use client";

import { useState } from "react";
import { runSimulation, getCorrelationMatrix, SimulationRequest } from "../lib/api";
import MonteCarloChart from "../components/MonteCarloChart";
import DistributionChart from "../components/DistributionChart";
import RiskDashboard from "../components/RiskDashboard";
import PortfolioBuilder, { AssetAllocation } from "../components/PortfolioBuilder";
import PercentileTable from "../components/PercentileTable";

export default function Home() {
  const [simulationData, setSimulationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRunSimulation = async (
    assets: AssetAllocation[], 
    initialInvestment: number, 
    monthlyContribution: number, 
    years: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const numAssets = assets.length;
      const tickers = assets.map(a => a.ticker.trim() || "UNKNOWN");

      setLoadingMessage("Analyzing 5-year historical correlations...");
      let correlationMatrix = [];
      try {
        const corrData = await getCorrelationMatrix(tickers);
        correlationMatrix = corrData.correlation_matrix;
      } catch (err) {
        console.warn("Failed to fetch real correlations, using defaults.");
        correlationMatrix = Array(numAssets).fill(0).map((_, i) => 
          Array(numAssets).fill(0).map((_, j) => (i === j ? 1.0 : 0.1))
        );
      }

      setLoadingMessage("Running 10,000 Monte Carlo simulations...");
      const requestBody: SimulationRequest = {
        initial_investment: initialInvestment,
        time_horizon_years: years,
        num_simulations: 10000,
        monthly_contribution: monthlyContribution,
        asset_weights: assets.map(a => (Number(a.weight) || 0) / 100),
        expected_annual_returns: assets.map(a => (Number(a.expectedReturn) || 0) / 100),
        annual_volatilities: assets.map(a => (Number(a.volatility) || 0) / 100),
        correlation_matrix: correlationMatrix,
        inflation_rate: 0.02,
        random_seed: 42
      };
      
      const data = await runSimulation(requestBody);
      setSimulationData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to run simulation. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto space-y-6 print:space-y-4">
        <header className="mb-8 print:mb-4">
          <h1 className="text-3xl font-bold text-slate-900">Advanced Portfolio Simulator</h1>
          <p className="text-slate-500 print:text-slate-800">Monte Carlo Analysis Engine</p>
        </header>

        {/* print:hidden ensures the inputs don't show up on the final PDF */}
        <div className="print:hidden">
          <PortfolioBuilder onRunSimulation={handleRunSimulation} isLoading={loading} />
        </div>

        {error && <div className="text-red-500 bg-red-50 p-4 rounded-md print:hidden">{error}</div>}

        {!simulationData && !loading && !error && (
          <div className="text-center text-slate-400 py-12 border-2 border-dashed border-slate-200 rounded-xl print:hidden">
            Configure your portfolio and click Run to see the analysis.
          </div>
        )}

        {loading && (
          <div className="flex flex-col justify-center items-center h-64 text-slate-500 font-medium space-y-4 print:hidden">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p>{loadingMessage}</p>
          </div>
        )}

        {simulationData && !loading && (
          <div className="space-y-6 animate-in fade-in duration-500 print:space-y-4">
            
            {/* The Export Button */}
            <div className="flex justify-end print:hidden">
              <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all shadow-md active:scale-95"
              >
                📄 Download PDF Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:shadow-none print:border-slate-300">
                <p className="text-sm text-slate-500">Total Invested</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${simulationData.total_invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:shadow-none print:border-slate-300">
                <p className="text-sm text-slate-500">Median Final Value</p>
                <p className="text-2xl font-bold text-slate-800">
                  ${simulationData.median_final_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:shadow-none print:border-slate-300">
                <p className="text-sm text-slate-500">Probability of Profit</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {(simulationData.probability_of_profit * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:shadow-none print:border-slate-300">
                <p className="text-sm text-slate-500">Worst Case (1st %)</p>
                <p className="text-2xl font-bold text-rose-600">
                  ${simulationData.percentiles.p_1.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <MonteCarloChart paths={simulationData.representative_paths} />
            
            <PercentileTable 
              percentiles={simulationData.percentiles} 
              totalInvested={simulationData.total_invested} 
            />

            <div className="print:break-before-page">
              <DistributionChart 
                finalValues={simulationData.final_values} 
                mean={simulationData.mean}
                stdDev={simulationData.std_dev}
                skewness={simulationData.skewness}
                kurtosis={simulationData.kurtosis}
              />
            </div>
            
            <RiskDashboard metrics={simulationData.risk_metrics} />
          </div>
        )}
      </div>
    </main>
  );
}