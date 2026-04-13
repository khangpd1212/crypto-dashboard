import { marketStore } from "@/stores/marketStore";
import { MiniTicker, Ticker } from "@/types/binance";

export const setTickersMutator = (tickers: Map<string, Ticker>) => {
  marketStore.setTickers(tickers);
};

export const updatePriceMutator = (symbol: string, price: string, priceChangePercent: string) => {
  marketStore.updateTicker(symbol, price, priceChangePercent);
};

export const setMarketConnectedMutator = (isConnected: boolean) => {
  marketStore.setConnected(isConnected);
};

export const setMarketLoadingMutator = (isLoading: boolean) => {
  marketStore.setLoading(isLoading);
};

export const setMarketErrorMutator = (error: string | null) => {
  marketStore.setError(error);
};

export const toggleFavoriteMutator = (symbol: string) => {
  marketStore.toggleFavorite(symbol);
};

export const processMiniTickerMutator = (data: MiniTicker) => {
  const symbol = data.s;
  const priceChange = ((parseFloat(data.c) - parseFloat(data.o)) / parseFloat(data.o) * 100).toFixed(2);
  
  marketStore.updateTicker(symbol, data.c, priceChange);
};