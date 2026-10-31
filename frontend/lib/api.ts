const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export interface SimulationRequest {
  initial_investment: number;
  time_horizon_years: number;
  num_simulations: number;
  monthly_contribution: number;
  asset_weights: number[];
  expected_annual_returns: number[];
  annual_volatilities: number[];
  correlation_matrix: number[][];
  inflation_rate: number;
  random_seed?: number;
}

export const runSimulation = async (data: SimulationRequest) => {
  const response = await fetch(`${API_BASE_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Simulation failed");
  return response.json();
};

export const getCorrelationMatrix = async (tickers: string[]) => {
  const response = await fetch(`${API_BASE_URL}/market/correlation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tickers, period: "5y" }),
  });
  if (!response.ok) throw new Error("Failed to fetch correlation matrix");
  return response.json();
};