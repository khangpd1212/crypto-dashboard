import { marketStore } from "@/stores/marketStore";
import { Ticker, MiniTicker } from "@/types/binance";

export const setMarketLoadingMutator = (isLoading: boolean) => {
  marketStore.setLoading(isLoading);
};

export const setMarketErrorMutator = (error: string | null) => {
  marketStore.setError(error);
};

export const setTickersMutator = (tickers: Ticker[]) => {
  const tickerMap = new Map<string, Ticker>();
  for (const t of tickers) {
    tickerMap.set(t.symbol, t);
  }
  marketStore.setTickers(tickerMap);
  marketStore.setLoading(false);
};

export const toggleFavoriteMutator = (symbol: string) => {
  marketStore.toggleFavorite(symbol);
};

export const processMiniTickerMutator = (items: MiniTicker[]) => {
  for (const ticker of items) {
    const symbol = ticker.s;
    const priceChange = (
      ((parseFloat(ticker.c) - parseFloat(ticker.o)) / parseFloat(ticker.o)) *
      100
    ).toFixed(2);
    marketStore.updateTicker(symbol, ticker.c, priceChange);
  }
};
