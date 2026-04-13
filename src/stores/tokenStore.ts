import { makeAutoObservable } from "mobx";
import type { Kline, OrderBook, Trade } from '@/types/binance';

export interface TokenState {
  selectedSymbol: string | null;
  searchQuery: string;
  klines: Kline[];
  orderBook: OrderBook | null;
  recentTrades: Trade[];
  isLoadingChart: boolean;
  isLoadingOrderBook: boolean;
}

class TokenStore {
  selectedSymbol: string | null = null;
  searchQuery = "";
  klines: Kline[] = [];
  orderBook: OrderBook | null = null;
  recentTrades: Trade[] = [];
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

  setKlines(klines: Kline[]) {
    this.klines = klines;
  }

  setOrderBook(orderBook: OrderBook) {
    this.orderBook = orderBook;
  }

  setRecentTrades(trades: Trade[]) {
    this.recentTrades = trades;
  }

  setLoadingChart(loading: boolean) {
    this.isLoadingChart = loading;
  }

  setLoadingOrderBook(loading: boolean) {
    this.isLoadingOrderBook = loading;
  }
}

export const tokenStore = new TokenStore();

export const initialTokenState: TokenState = {
  selectedSymbol: null,
  searchQuery: '',
  klines: [],
  orderBook: null,
  recentTrades: [],
  isLoadingChart: false,
  isLoadingOrderBook: false,
};
