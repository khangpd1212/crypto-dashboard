import { makeAutoObservable } from "mobx";
import type { Ticker } from '@/types/binance';

export interface MarketState {
  tickers: Map<string, Ticker>;
  favorites: Set<string>;
  isLoading: boolean;
  error: string | null;
}

class MarketStore {
  tickers = new Map<string, Ticker>();
  favorites = new Set<string>();
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    const stored = localStorage.getItem("crypto-dashboard-favorites");
    if (stored) {
      this.favorites = new Set(JSON.parse(stored));
    }
  }

  setTickers(tickerMap: Map<string, Ticker>) {
    this.tickers = tickerMap;
  }

  updateTicker(symbol: string, price: string, priceChangePercent: string) {
    const existing = this.tickers.get(symbol);
    if (existing) {
      this.tickers.set(symbol, {
        ...existing,
        price,
        priceChangePercent,
        lastUpdate: Date.now(),
      });
    }
  }

  toggleFavorite(symbol: string) {
    if (this.favorites.has(symbol)) {
      this.favorites.delete(symbol);
    } else {
      this.favorites.add(symbol);
    }
    localStorage.setItem(
      "crypto-dashboard-favorites",
      JSON.stringify([...this.favorites]),
    );
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }
}

export const marketStore = new MarketStore();

export const initialMarketState: MarketState = {
  tickers: new Map(),
  favorites: new Set(),
  isLoading: false,
  error: null,
};