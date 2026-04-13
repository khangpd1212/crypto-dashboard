import { settingsStore, SettingsState } from './settingsStore';
import { makeAutoObservable } from 'mobx';

export interface Ticker {
  symbol: string;
  price: string;
  priceChangePercent: string;
  lastUpdate: number;
}

export class MarketState {
  tickers = new Map<string, Ticker>();
  favorites = new Set<string>();
  isConnected = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    const stored = localStorage.getItem('crypto-dashboard-favorites');
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
    localStorage.setItem('crypto-dashboard-favorites', JSON.stringify([...this.favorites]));
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

export class TokenState {
  selectedSymbol: string | null = null;
  searchQuery = '';
  isLoadingChart = false;
  isLoadingOrderBook = false;

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedSymbol(symbol: string | null) {
    this.selectedSymbol = symbol;
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  setLoadingChart(loading: boolean) {
    this.isLoadingChart = loading;
  }

  setLoadingOrderBook(loading: boolean) {
    this.isLoadingOrderBook = loading;
  }
}

export const marketStore = new MarketState();
export const tokenStore = new TokenState();
export { settingsStore };

export function getSettingsStore() {
  return settingsStore;
}