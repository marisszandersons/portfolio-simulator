import yfinance as yf
import numpy as np
import pandas as pd
from app.models.market import AssetInfo, AssetPrice

class MarketDataService:
    @staticmethod
    def get_asset_info(ticker: str, include_history: bool = False, period: str = "5y") -> AssetInfo:
        try:
            asset = yf.Ticker(ticker)
            info = asset.info
            
            name = info.get("shortName", info.get("longName", ticker))
            currency = info.get("currency", "Unknown")
            exchange = info.get("exchange", "Unknown")
            
            current_price = info.get("regularMarketPrice", info.get("currentPrice"))
            
            if current_price is None:
                fast_history = asset.history(period="1d")
                if not fast_history.empty:
                    current_price = float(fast_history['Close'].iloc[-1])
                else:
                    current_price = 0.0

            historical_data = None
            ann_return = None
            ann_volatility = None
            
            if include_history:
                hist_df = asset.history(period=period)
                if not hist_df.empty:
                    closes = hist_df["Close"]
                    daily_returns = closes.pct_change().dropna()
                    
                    if not daily_returns.empty:
                        ann_volatility = float(daily_returns.std() * np.sqrt(252))
                        ann_return = float(daily_returns.mean() * 252)

                    historical_data = []
                    for date, row in hist_df.iterrows():
                        historical_data.append(
                            AssetPrice(
                                date=date.date(),
                                close=float(row["Close"]),
                                adjusted_close=float(row["Close"]), 
                                volume=int(row["Volume"])
                            )
                        )

            return AssetInfo(
                ticker=ticker.upper(),
                name=name,
                currency=currency,
                exchange=exchange,
                current_price=current_price,
                historical_data=historical_data,
                annualized_return=ann_return,
                annualized_volatility=ann_volatility
            )
        except Exception as e:
            raise ValueError(f"Failed to fetch data for {ticker}: {str(e)}")

    @staticmethod
    def get_correlation_matrix(tickers: list[str], period: str = "5y") -> list[list[float]]:
        if not tickers:
            return []
            
        closes = pd.DataFrame()
        
        # Download historical data for each ticker and align by date
        for ticker in tickers:
            clean_ticker = ticker.strip().upper()
            if not clean_ticker:
                closes[clean_ticker] = pd.Series(dtype=float)
                continue
            try:
                asset = yf.Ticker(clean_ticker)
                hist = asset.history(period=period)
                if not hist.empty:
                    closes[clean_ticker] = hist['Close']
                else:
                    closes[clean_ticker] = pd.Series(dtype=float)
            except Exception:
                closes[clean_ticker] = pd.Series(dtype=float)
                
        if closes.empty:
            return np.eye(len(tickers)).tolist()
            
        # Calculate daily returns
        returns = closes.pct_change().dropna(how='all')
        
        # Calculate Pearson correlation matrix
        corr_matrix = returns.corr()
        
        # Clean up the matrix: replace NaNs with 0 (no correlation) for missing data
        corr_matrix = corr_matrix.fillna(0)
        
        # Ensure the diagonal (an asset's correlation to itself) is always perfectly 1.0
        matrix_vals = corr_matrix.values
        np.fill_diagonal(matrix_vals, 1.0)
        
        return matrix_vals.tolist()