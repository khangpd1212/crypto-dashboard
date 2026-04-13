import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { Kline, OrderBook, Trade } from '@/types/binance';
import { fetchKlines, fetchOrderBook, fetchRecentTrades } from '@/services/binanceApi';

interface TokenDetailProps {
  symbol: string;
  onBack: () => void;
}

export default function TokenDetail({ symbol }: TokenDetailProps) {
  const { t } = useTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [klines, setKlines] = useState<Kline[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const baseSymbol = symbol.replace('USDT', '').toLowerCase();

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
        setOrderBook(orderBookData);
        setRecentTrades(tradesData);
      } catch (error) {
        console.error('Failed to load token data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol]);

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

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${baseSymbol}@kline_15m`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const k = data.k;

      candleSeries.update({
        time: (k.t / 1000) as Time,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
      });
    };
    wsRef.current = ws;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      chart.remove();
    };
  }, [klines.length, baseSymbol]);

  if (loading) {
    return (
      <div className="min-h-80 grid place-items-center rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-8 text-(--text-muted)">
        <div>{t('app.loading')}</div>
      </div>
    );
  }

  const lastPrice = klines[klines.length - 1]?.close || 0;
  const prevPrice = klines[klines.length - 2]?.close || lastPrice;
  const priceChange = ((lastPrice - prevPrice) / prevPrice) * 100;
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
            ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </section>

      <section className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6 min-h-110">
        <div ref={chartContainerRef} className="h-full rounded-3xl overflow-hidden" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6">
          <h3 className="text-lg font-semibold mb-4">{t('tokenDetail.orderBook')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-3 text-sm uppercase tracking-[0.12em] text-(--text-muted) font-semibold">
                {t('tokenDetail.bids')}
              </div>
              <div className="grid gap-2">
                {orderBook?.bids.slice(0, 10).map(([price, qty], i) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl bg-[rgba(15,23,42,0.04)] dark:bg-white/5 px-3 py-2 text-sm text-(--text-muted)">
                    <span className="text-(--success)">{parseFloat(price).toFixed(2)}</span>
                    <span>{parseFloat(qty).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 text-sm uppercase tracking-[0.12em] text-(--text-muted) font-semibold">
                {t('tokenDetail.asks')}
              </div>
              <div className="grid gap-2">
                {orderBook?.asks.slice(0, 10).map(([price, qty], i) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl bg-[rgba(15,23,42,0.04)] dark:bg-white/5 px-3 py-2 text-sm text-(--text-muted)">
                    <span className="text-(--danger)">{parseFloat(price).toFixed(2)}</span>
                    <span>{parseFloat(qty).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6">
          <h3 className="text-lg font-semibold mb-4">{t('tokenDetail.recentTrades')}</h3>
          <div className="grid gap-3">
            {recentTrades.slice(0, 20).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[rgba(15,23,42,0.04)] dark:bg-white/5 px-3 py-3 text-sm text-(--text-muted)">
                <span className={trade.isBuyerMaker ? 'text-(--danger)' : 'text-(--success)'}>
                  {parseFloat(trade.price).toFixed(2)}
                </span>
                <span>{parseFloat(trade.qty).toFixed(4)}</span>
                <span className="text-(--text-muted)">{new Date(trade.time).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
