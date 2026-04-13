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

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#08101f' },
        textColor: '#b8c2d5',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
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
      <div className="loading-panel">
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
    <div className="token-detail-shell">
      <section className="panel glass-panel token-summary">
        <div className="token-header">
          <div>
            <span className="subtitle">{t('tokenDetail.overview') || 'Asset details'}</span>
            <h2>{baseSymbol.toUpperCase()} / USDT</h2>
          </div>
          <div className={`token-badge ${isPositive ? 'up' : 'down'}`}>
            {isPositive ? '+' : ''}{formattedChange}%
          </div>
        </div>

        <div className="token-price">
          <span>Current price</span>
          <strong>${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
      </section>

      <section className="panel glass-panel token-chart-panel">
        <div ref={chartContainerRef} className="chart-canvas" />
      </section>

      <div className="token-grid">
        <section className="panel glass-panel token-card">
          <h3>{t('tokenDetail.orderBook')}</h3>
          <div className="order-grid">
            <div>
              <div className="order-title">{t('tokenDetail.bids')}</div>
              <div className="order-list">
                {orderBook?.bids.slice(0, 10).map(([price, qty], i) => (
                  <div key={i} className="order-row">
                    <span className="text-accent">{parseFloat(price).toFixed(2)}</span>
                    <span>{parseFloat(qty).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="order-title">{t('tokenDetail.asks')}</div>
              <div className="order-list">
                {orderBook?.asks.slice(0, 10).map(([price, qty], i) => (
                  <div key={i} className="order-row">
                    <span className="text-danger">{parseFloat(price).toFixed(2)}</span>
                    <span>{parseFloat(qty).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel glass-panel token-card">
          <h3>{t('tokenDetail.recentTrades')}</h3>
          <div className="trade-list">
            {recentTrades.slice(0, 20).map((trade) => (
              <div key={trade.id} className="trade-row">
                <span className={trade.isBuyerMaker ? 'text-danger' : 'text-accent'}>
                  {parseFloat(trade.price).toFixed(2)}
                </span>
                <span>{parseFloat(trade.qty).toFixed(4)}</span>
                <span className="trade-time">{new Date(trade.time).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
