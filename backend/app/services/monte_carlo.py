import numpy as np
from scipy.stats import skew, kurtosis
from app.models.simulation import SimulationRequest, SimulationResult, RiskMetrics

class MonteCarloEngine:
    @staticmethod
    def run_multivariate_simulation(request: SimulationRequest) -> SimulationResult:
        if request.random_seed is not None:
            np.random.seed(request.random_seed)

        months = request.time_horizon_years * 12
        num_assets = len(request.asset_weights)
        
        weights = np.array(request.asset_weights)
        returns = np.array(request.expected_annual_returns)
        vols = np.array(request.annual_volatilities)
        corr_matrix = np.array(request.correlation_matrix)

        # Portfolio analytical risk calculations
        port_return = np.dot(weights, returns)
        cov_matrix_annual = np.outer(vols, vols) * corr_matrix
        port_variance = np.dot(weights.T, np.dot(cov_matrix_annual, weights))
        port_volatility = np.sqrt(port_variance)
        
        # Sharpe Ratio (assuming risk-free rate roughly matches inflation)
        sharpe_ratio = (port_return - request.inflation_rate) / port_volatility if port_volatility > 0 else 0

        # Monthly variables for simulation
        monthly_returns = returns / 12
        monthly_vols = vols / np.sqrt(12)
        cov_matrix_monthly = np.outer(monthly_vols, monthly_vols) * corr_matrix
        L = np.linalg.cholesky(cov_matrix_monthly)
        
        portfolio_values = np.zeros((request.num_simulations, months + 1))
        portfolio_values[:, 0] = request.initial_investment
        
        for m in range(1, months + 1):
            Z = np.random.standard_normal((num_assets, request.num_simulations))
            correlated_shocks = L @ Z
            asset_monthly_returns = monthly_returns[:, None] + correlated_shocks
            port_monthly_returns = np.dot(weights, asset_monthly_returns)
            
            portfolio_values[:, m] = (
                portfolio_values[:, m - 1] * (1 + port_monthly_returns) + 
                request.monthly_contribution
            )
            portfolio_values[:, m] = np.maximum(portfolio_values[:, m], 0)

        # Maximum Drawdown calculation on the paths
        running_max = np.maximum.accumulate(portfolio_values, axis=1)
        drawdowns = (running_max - portfolio_values) / running_max
        max_drawdown = float(np.max(drawdowns)) # Worst peak-to-trough drop across all sims

        # Final adjustments
        final_values = portfolio_values[:, -1]
        inflation_discount = (1 + request.inflation_rate) ** request.time_horizon_years
        real_final_values = final_values / inflation_discount
        
        total_invested = request.initial_investment + (request.monthly_contribution * months)
        prob_profit = np.mean(real_final_values > total_invested)
        
        percentiles_to_calc = [1, 5, 10, 25, 50, 75, 90, 95, 99]
        calculated_percentiles = np.percentile(real_final_values, percentiles_to_calc)
        percentile_dict = {f"p_{p}": val for p, val in zip(percentiles_to_calc, calculated_percentiles)}
        
        # Value at Risk (VaR) and CVaR at 95% confidence based on final values relative to invested capital
        returns_simulated = (real_final_values - total_invested) / total_invested
        var_95 = float(np.percentile(returns_simulated, 5))
        cvar_95 = float(np.mean(returns_simulated[returns_simulated <= var_95]))
        
        sorted_indices = np.argsort(final_values)
        step = max(1, request.num_simulations // 100)
        representative_indices = sorted_indices[::step][:100]
        
        inflation_curve = np.array([(1 + request.inflation_rate)**(m/12) for m in range(months + 1)])
        adjusted_paths = portfolio_values[representative_indices] / inflation_curve
        
        mean_val = float(np.mean(real_final_values))
        std_val = float(np.std(real_final_values))
        skew_val = float(skew(real_final_values))
        kurt_val = float(kurtosis(real_final_values))

        risk_metrics = RiskMetrics(
            portfolio_volatility=float(port_volatility),
            sharpe_ratio=float(sharpe_ratio),
            max_drawdown=max_drawdown,
            value_at_risk_95=var_95,
            conditional_var_95=cvar_95
        )

        return SimulationResult(
            total_invested=float(total_invested),
            expected_final_value=mean_val,
            median_final_value=float(np.median(real_final_values)),
            min_final_value=float(np.min(real_final_values)),
            max_final_value=float(np.max(real_final_values)),
            probability_of_profit=float(prob_profit),
            percentiles=percentile_dict,
            representative_paths=adjusted_paths.tolist(),
            final_values=real_final_values.tolist(),
            mean=mean_val,
            std_dev=std_val,
            skewness=skew_val,
            kurtosis=kurt_val,
            risk_metrics=risk_metrics
        )