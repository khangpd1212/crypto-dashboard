import { ExchangeInfo, Kline, OrderBook, Trade } from '../types/binance';

const REST_BASE = 'https://api.binance.com/api/v3';

export const fetchExchangeInfo = async (): Promise<ExchangeInfo> => {
  const response = await fetch(`${REST_BASE}/exchangeInfo`);
  const data = await response.json();
  
  const symbols = data.symbols
    .filter((s: any) => s.status === 'TRADING' && s.quoteAsset === 'USDT')
    .map((s: any) => ({
      symbol: s.symbol,
      status: s.status,
      baseAsset: s.baseAsset,
      quoteAsset: s.quoteAsset,
    }));
  
  return { symbols };
};

export const fetchKlines = async (
  symbol: string,
  interval: string = '15m',
  limit: number = 100
): Promise<Kline[]> => {
  const response = await fetch(
    `${REST_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );
  const data = await response.json();
  
  return data.map((k: any[]) => ({
    time: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
};

export const fetchOrderBook = async (symbol: string, limit: number = 20): Promise<OrderBook> => {
  const response = await fetch(
    `${REST_BASE}/depth?symbol=${symbol}&limit=${limit}`
  );
  return response.json();
};

export const fetchRecentTrades = async (
  symbol: string,
  limit: number = 50
): Promise<Trade[]> => {
  const response = await fetch(
    `${REST_BASE}/trades?symbol=${symbol}&limit=${limit}`
  );
  const data = await response.json();
  
  return data.map((t: any) => ({
    id: t.id,
    price: t.price,
    qty: t.qty,
    time: t.time,
    isBuyerMaker: t.isBuyerMaker,
  }));
};