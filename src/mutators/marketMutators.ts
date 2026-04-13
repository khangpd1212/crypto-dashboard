import { getMarketStore } from '../stores';
import { Ticker, MiniTicker } from '../types/binance';

export const setTickersMutator = (tickers: Map<string, Ticker>) => {
  const state = getMarketStore().get();
  state.tickers = tickers;
};

export const updatePriceMutator = (symbol: string, price: string, priceChangePercent: string) => {
  const state = getMarketStore().get();
  const existing = state.tickers.get(symbol);
  
  if (existing) {
    state.tickers.set(symbol, {
      ...existing,
      price,
      priceChangePercent,
      lastUpdate: Date.now(),
    });
  } else {
    state.tickers.set(symbol, {
      symbol,
      price,
      priceChangePercent,
      lastUpdate: Date.now(),
    });
  }
};

export const setMarketConnectedMutator = (isConnected: boolean) => {
  const state = getMarketStore().get();
  state.isConnected = isConnected;
};

export const setMarketLoadingMutator = (isLoading: boolean) => {
  const state = getMarketStore().get();
  state.isLoading = isLoading;
};

export const setMarketErrorMutator = (error: string | null) => {
  const state = getMarketStore().get();
  state.error = error;
};

export const toggleFavoriteMutator = (symbol: string) => {
  const state = getMarketStore().get();
  const favorites = new Set(state.favorites);
  
  if (favorites.has(symbol)) {
    favorites.delete(symbol);
  } else {
    favorites.add(symbol);
  }
  
  state.favorites = favorites;
};

export const processMiniTickerMutator = (data: MiniTicker) => {
  const state = getMarketStore().get();
  const symbol = data.s;
  const priceChange = ((parseFloat(data.c) - parseFloat(data.o)) / parseFloat(data.o) * 100).toFixed(2);
  
  state.tickers.set(symbol, {
    symbol,
    price: data.c,
    priceChangePercent: priceChange,
    lastUpdate: data.E,
  });
};