from fastapi import APIRouter, HTTPException, Query
from app.services.market_data import MarketDataService
from app.models.market import AssetInfo, CorrelationRequest, CorrelationResponse
from app.models.simulation import SimulationRequest, SimulationResult
from app.services.monte_carlo import MonteCarloEngine

router = APIRouter()

@router.get("/market/asset/{ticker}", response_model=AssetInfo)
def get_asset(
    ticker: str, 
    include_history: bool = Query(False, description="Include historical daily prices"),
    period: str = Query("5y", description="Historical period")
):
    try:
        return MarketDataService.get_asset_info(ticker, include_history, period)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/market/correlation", response_model=CorrelationResponse)
def get_correlation(request: CorrelationRequest):
    try:
        matrix = MarketDataService.get_correlation_matrix(request.tickers, request.period)
        return CorrelationResponse(tickers=request.tickers, correlation_matrix=matrix)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/simulate", response_model=SimulationResult)
def run_simulation(request: SimulationRequest):
    try:
        num_assets = len(request.asset_weights)
        if len(request.expected_annual_returns) != num_assets or len(request.annual_volatilities) != num_assets:
            raise ValueError("Mismatched portfolio dimensions.")
        
        if not (0.99 <= sum(request.asset_weights) <= 1.01):
            raise ValueError("Portfolio weights must sum to exactly 1.0 (100%).")
            
        return MonteCarloEngine.run_multivariate_simulation(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))