import { makeAutoObservable } from "mobx";
import type { Ticker } from '@/types/binance';

export interface MarketState {
  tickers: Map<string, Ticker>;
  favorites: Set<string>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

class MarketStore {
  tickers = new Map<string, Ticker>();
  favorites = new Set<string>();
  isConnected = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    const stored = localStorage.getItem("crypto-dashboard-favorites");
    if (stored) {
      this.favorites = new Set(JSON.parse(stored));
    }
  }

  setTickers(tickers: Map<string, Ticker>) {
    this.tickers = tickers;
  }

  updateTicker(symbol: string, price: string, priceChangePercent: string) {
    this.tickers.set(symbol, {
      symbol,
      price,
      priceChangePercent,
      lastUpdate: Date.now(),
    });
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

  setConnected(connected: boolean) {
    this.isConnected = connected;
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
  isConnected: false,
  isLoading: false,
  error: null,
};