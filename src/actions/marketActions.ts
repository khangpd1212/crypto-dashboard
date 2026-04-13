import { Ticker } from '../types/binance';

export const setTickers = (tickers: Map<string, Ticker>) => ({
  type: 'SET_TICKERS' as const,
  tickers,
});

export const updatePrice = (symbol: string, price: string, priceChangePercent: string) => ({
  type: 'UPDATE_PRICE' as const,
  symbol,
  price,
  priceChangePercent,
});

export const setMarketConnected = (isConnected: boolean) => ({
  type: 'SET_MARKET_CONNECTED' as const,
  isConnected,
});

export const setMarketLoading = (isLoading: boolean) => ({
  type: 'SET_MARKET_LOADING' as const,
  isLoading,
});

export const setMarketError = (error: string | null) => ({
  type: 'SET_MARKET_ERROR' as const,
  error,
});

export const toggleFavorite = (symbol: string) => ({
  type: 'TOGGLE_FAVORITE' as const,
  symbol,
});