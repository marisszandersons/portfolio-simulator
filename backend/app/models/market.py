from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class AssetPrice(BaseModel):
    date: date
    close: float
    adjusted_close: float
    volume: int

class AssetInfo(BaseModel):
    ticker: str
    name: Optional[str]
    currency: Optional[str]
    exchange: Optional[str]
    current_price: Optional[float]
    historical_data: Optional[List[AssetPrice]] = None
    annualized_return: Optional[float] = None
    annualized_volatility: Optional[float] = None

# NEW MODELS FOR CORRELATION ENGINE
class CorrelationRequest(BaseModel):
    tickers: List[str]
    period: Optional[str] = "5y"

class CorrelationResponse(BaseModel):
    tickers: List[str]
    correlation_matrix: List[List[float]]