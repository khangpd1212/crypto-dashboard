import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { Kline, OrderBook, Trade } from '@/types/binance';
import { fetchKlines, fetchOrderBook, fetchRecentTrades } from '@/services/binanceApi';
import { tokenWS } from '@/services/binanceWebSocket';
import OrderBookSection from './components/OrderBookSection';
import RecentTradesSection from './components/RecentTradesSection';

const MAX_TRADES = 50;

export default function TokenDetail() {
  const { symbol: symbolParam } = useParams<{ symbol: string }>();
  const { t } = useTranslation();
  const symbol = symbolParam || '';
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  
  const [klines, setKlines] = useState<Kline[]>([]);
  const [livePrice, setLivePrice] = useState<number>(0);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const pendingOrderBook = useRef<OrderBook | null>(null);
  const pendingTrades = useRef<Trade[]>([]);
  const throttleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recentTradesRef = useRef<Trade[]>([]);

  const baseSymbol = symbol.replace('USDT', '').toLowerCase();
  const wsSymbol = symbol.toLowerCase();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [klinesData, orderBookData, tradesData] = await Promise.all([
          fetchKlines(symbol, '15m', 100),
          fetchOrderBook(symbol),
          fetchRecentTrades(symbol),
        ]);

        setKlines(klinesData);
        setLivePrice(klinesData[klinesData.length - 1]?.close || 0);
        setOrderBook(orderBookData);
        setRecentTrades(tradesData.slice(0, MAX_TRADES));
        recentTradesRef.current = tradesData.slice(0, MAX_TRADES);
      } catch (error) {
        console.error('Failed to load token data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      // Don't disconnect - let Dashboard continue using the WebSocket
    };
  }, [symbol]);

  const handleTokenMessage = useCallback((data: any, stream: string) => {
    if (stream === `${wsSymbol}@miniTicker`) {
      if (data.c) {
        setLivePrice(parseFloat(data.c));
      }
    } else if (stream === `${wsSymbol}@kline_15m`) {
      const k = data.k;
      setLivePrice(parseFloat(k.c));
      if (candleSeriesRef.current) {
        candleSeriesRef.current.update({
          time: (k.t / 1000) as Time,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
        });
      }
    } else if (stream === `${wsSymbol}@depth20@100ms`) {
      if (data.lastUpdateId) {
        pendingOrderBook.current = {
          lastUpdateId: data.lastUpdateId,
          bids: data.bids,
          asks: data.asks,
        };
      }
    } else if (stream === `${wsSymbol}@trade`) {
      const newTrade = {
        id: data.t,
        price: data.p,
        qty: data.q,
        time: data.T,
        isBuyerMaker: data.m,
      };
      pendingTrades.current = [newTrade, ...pendingTrades.current].slice(0, MAX_TRADES);
    }
  }, [wsSymbol]);

  const scheduleUpdate = useCallback(() => {
    if (!throttleTimeout.current) {
      throttleTimeout.current = setTimeout(() => {
        if (pendingOrderBook.current) {
          setOrderBook(pendingOrderBook.current);
        }
        if (pendingTrades.current.length > 0) {
          const existingTrades = recentTradesRef.current;
          const newTrades = pendingTrades.current;
          const combined = [...newTrades, ...existingTrades];
          const uniqueIds = new Set<number>();
          const deduped = combined.filter(t => {
            if (uniqueIds.has(t.id)) return false;
            uniqueIds.add(t.id);
            return true;
          });
          setRecentTrades(deduped.slice(0, MAX_TRADES));
          recentTradesRef.current = deduped.slice(0, MAX_TRADES);
          pendingTrades.current = [];
        }
        pendingOrderBook.current = null;
        throttleTimeout.current = null;
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || klines.length === 0) return;

    const isDarkMode = document.documentElement.classList.contains('dark');
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: isDarkMode ? '#08101f' : '#ffffff' },
        textColor: isDarkMode ? '#b8c2d5' : '#111827',
      },
      grid: {
        vertLines: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.08)' },
        horzLines: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.08)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 420,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#7dd3fc',
      downColor: '#f97316',
      borderUpColor: '#7dd3fc',
      borderDownColor: '#f97316',
      wickUpColor: '#7dd3fc',
      wickDownColor: '#f97316',
    });

    const chartData: CandlestickData[] = klines.map((k) => ({
      time: (k.time / 1000) as Time,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }));

    candleSeries.setData(chartData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleTokenMsg = (data: any, stream: string) => {
      if (stream === `${wsSymbol}@miniTicker`) {
        if (data.c) {
          setLivePrice(parseFloat(data.c));
        }
      } else if (stream === `${wsSymbol}@kline_15m`) {
        const k = data.k;
        setLivePrice(parseFloat(k.c));
        if (candleSeriesRef.current) {
          candleSeriesRef.current.update({
            time: (k.t / 1000) as Time,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
          });
        }
      } else if (stream === `${wsSymbol}@depth20@100ms`) {
        if (data.lastUpdateId) {
          pendingOrderBook.current = {
            lastUpdateId: data.lastUpdateId,
            bids: data.bids,
            asks: data.asks,
          };
        }
      } else if (stream === `${wsSymbol}@trade`) {
        const newTrade = {
          id: data.t,
          price: data.p,
          qty: data.q,
          time: data.T,
          isBuyerMaker: data.m,
        };
        pendingTrades.current = [newTrade, ...pendingTrades.current].slice(0, MAX_TRADES);
      }
    };

    tokenWS.connectToToken(wsSymbol, handleTokenMsg);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const updateInterval = setInterval(() => {
      if (pendingOrderBook.current || pendingTrades.current.length > 0) {
        scheduleUpdate();
      }
    }, 1000);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(updateInterval);
      tokenWS.disconnect();
      chart.remove();
    };
  }, [klines.length, wsSymbol, handleTokenMessage, scheduleUpdate]);

  if (loading) {
    return (
      <div className="min-h-80 grid place-items-center rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-8 text-(--text-muted)">
        <div>{t('app.loading')}</div>
      </div>
    );
  }

  const prevPrice = klines[klines.length - 2]?.close || livePrice;
  const priceChange = ((livePrice - prevPrice) / prevPrice) * 100;
  const formattedChange = priceChange.toFixed(2);
  const isPositive = priceChange >= 0;

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <span className="block text-sm uppercase tracking-[0.16em] text-(--text-muted) mb-2">
              {t('tokenDetail.overview')}
            </span>
            <h2 className="text-2xl font-semibold">{baseSymbol.toUpperCase()} / USDT</h2>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${
            isPositive
              ? 'bg-[rgba(82,227,255,0.14)] text-(--success)'
              : 'bg-[rgba(255,111,111,0.12)] text-(--danger)'
          }`}>
            {isPositive ? '+' : ''}{formattedChange}%
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-3 text-(--text-muted)">
          <span>{t('tokenDetail.currentPrice')}</span>
          <strong className="text-4xl font-semibold text-(--text-strong)">
            ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </section>

      <section className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6 min-h-110">
        <div ref={chartContainerRef} className="h-full rounded-3xl overflow-hidden" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <OrderBookSection orderBook={orderBook} />
        <RecentTradesSection trades={recentTrades} maxRows={MAX_TRADES} />
      </div>
    </div>
  );
}