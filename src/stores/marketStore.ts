import { Ticker } from '../types/binance';

export interface MarketState {
  tickers: Map<string, Ticker>;
  favorites: Set<string>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export const initialMarketState: MarketState = {
  tickers: new Map(),
  favorites: new Set(),
  isConnected: false,
  isLoading: false,
  error: null,
};