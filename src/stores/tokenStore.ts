import { Kline, OrderBook, Trade } from '../types/binance';

export interface TokenState {
  selectedSymbol: string | null;
  searchQuery: string;
  klines: Kline[];
  orderBook: OrderBook | null;
  recentTrades: Trade[];
  isLoadingChart: boolean;
  isLoadingOrderBook: boolean;
}

export const initialTokenState: TokenState = {
  selectedSymbol: null,
  searchQuery: '',
  klines: [],
  orderBook: null,
  recentTrades: [],
  isLoadingChart: false,
  isLoadingOrderBook: false,
};