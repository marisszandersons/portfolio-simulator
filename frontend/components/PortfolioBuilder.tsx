"use client";

import { useState } from "react";

export interface AssetAllocation {
  ticker: string;
  weight: string;
  expectedReturn: string;
  volatility: string;
  isFetching?: boolean;
}

interface PortfolioBuilderProps {
  onRunSimulation: (
    assets: AssetAllocation[], 
    initialInvestment: number, 
    monthlyContribution: number, 
    years: number
  ) => void;
  isLoading: boolean;
}

export default function PortfolioBuilder({ onRunSimulation, isLoading }: PortfolioBuilderProps) {
  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [years, setYears] = useState("10");
  
  const [assets, setAssets] = useState<AssetAllocation[]>([
    { ticker: "VOO", weight: "60", expectedReturn: "8", volatility: "15" },
    { ticker: "BND", weight: "40", expectedReturn: "4", volatility: "5" },
  ]);

  const totalWeight = assets.reduce((sum, asset) => sum + (Number(asset.weight) || 0), 0);
  const isWeightValid = totalWeight === 100;

  const handleUpdateAsset = (index: number, field: keyof AssetAllocation, value: string) => {
    const newAssets = [...assets];
    newAssets[index] = { ...newAssets[index], [field]: value };
    setAssets(newAssets);
  };

  const handleFetchStats = async (index: number, ticker: string) => {
    if (!ticker) return;
    
    setAssets(prev => {
      const updated = [...prev];
      updated[index].isFetching = true;
      return updated;
    });

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/market/asset/${ticker}?include_history=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.annualized_return !== null && data.annualized_volatility !== null) {
          setAssets(prev => {
            const updated = [...prev];
            updated[index].expectedReturn = (data.annualized_return * 100).toFixed(2);
            updated[index].volatility = (data.annualized_volatility * 100).toFixed(2);
            updated[index].isFetching = false;
            return updated;
          });
          return;
        }
      }
    } catch (error) {
      console.error("Failed to fetch asset stats");
    }
    
    setAssets(prev => {
      const updated = [...prev];
      updated[index].isFetching = false;
      return updated;
    });
  };

  const handleAddAsset = () => {
    setAssets([...assets, { ticker: "", weight: "", expectedReturn: "", volatility: "" }]);
  };

  const handleRemoveAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const inputClass = "w-full p-2 border border-slate-300 rounded-md text-slate-900 bg-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 transition-all";

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8 border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Portfolio Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Initial Investment ($)</label>
          <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Monthly Contribution ($)</label>
          <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Time Horizon (Years)</label>
          <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-end">
        <h3 className="font-semibold text-slate-700">Asset Allocation</h3>
        <div className={`text-sm font-bold px-3 py-1 rounded-full ${isWeightValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          Total: {totalWeight}%
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {assets.map((asset, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
            <div className="w-full md:flex-1 relative">
              <label className="block md:hidden text-xs font-semibold text-slate-500 mb-1">Ticker</label>
              <input type="text" placeholder="Ticker (e.g. VOO)" value={asset.ticker} onChange={(e) => handleUpdateAsset(index, "ticker", e.target.value)} onBlur={(e) => handleFetchStats(index, e.target.value)} className={`${inputClass} uppercase font-bold`} />
              {asset.isFetching && <span className="absolute right-3 top-9 md:top-2 text-xs text-blue-500 animate-pulse">Loading...</span>}
            </div>
            
            <div className="w-full md:flex-1 flex gap-3">
              <div className="flex-1">
                <label className="block md:hidden text-xs font-semibold text-slate-500 mb-1">Weight (%)</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Weight" value={asset.weight} onChange={(e) => handleUpdateAsset(index, "weight", e.target.value)} className={inputClass} />
                  <span className="hidden md:inline text-slate-500 text-sm">%</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block md:hidden text-xs font-semibold text-slate-500 mb-1">Return (%)</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Return" value={asset.expectedReturn} onChange={(e) => handleUpdateAsset(index, "expectedReturn", e.target.value)} className={inputClass} />
                  <span className="hidden md:inline text-slate-500 text-sm">% Ret</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block md:hidden text-xs font-semibold text-slate-500 mb-1">Volatility (%)</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Vol" value={asset.volatility} onChange={(e) => handleUpdateAsset(index, "volatility", e.target.value)} className={inputClass} />
                  <span className="hidden md:inline text-slate-500 text-sm">% Vol</span>
                </div>
              </div>
            </div>
            
            <button onClick={() => handleRemoveAsset(index)} className="absolute top-2 right-2 md:relative md:top-0 md:right-0 text-rose-500 hover:bg-rose-50 p-2 rounded-md transition-colors font-bold">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <button onClick={handleAddAsset} className="w-full sm:w-auto text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-md transition-colors border border-blue-200 sm:border-transparent">
          + Add Asset
        </button>

        <button 
          onClick={() => onRunSimulation(assets, Number(initialInvestment) || 0, Number(monthlyContribution) || 0, Number(years) || 0)}
          disabled={!isWeightValid || isLoading}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-white transition-all ${!isWeightValid || isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'}`}
        >
          {isLoading ? "Running Engine..." : "Run Monte Carlo Simulation"}
        </button>
      </div>
      
      {!isWeightValid && (
        <p className="text-rose-500 text-sm text-center sm:text-right mt-3 font-medium">Allocations must equal exactly 100%.</p>
      )}
    </div>
  );
}