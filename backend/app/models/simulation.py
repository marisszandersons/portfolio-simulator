from pydantic import BaseModel, Field
from typing import List, Dict

class SimulationRequest(BaseModel):
    initial_investment: float = Field(..., gt=0)
    time_horizon_years: int = Field(..., gt=0, le=50)
    num_simulations: int = Field(10000, ge=1000, le=100000)
    monthly_contribution: float = Field(0, ge=0)
    asset_weights: List[float]
    expected_annual_returns: List[float]
    annual_volatilities: List[float]
    correlation_matrix: List[List[float]]
    inflation_rate: float = 0.02
    random_seed: int = None

class RiskMetrics(BaseModel):
    portfolio_volatility: float
    sharpe_ratio: float
    max_drawdown: float
    value_at_risk_95: float
    conditional_var_95: float

class SimulationResult(BaseModel):
    total_invested: float
    expected_final_value: float
    median_final_value: float
    min_final_value: float
    max_final_value: float
    probability_of_profit: float
    percentiles: Dict[str, float]
    representative_paths: List[List[float]] 
    final_values: List[float]
    mean: float
    std_dev: float
    skewness: float
    kurtosis: float
    risk_metrics: RiskMetrics