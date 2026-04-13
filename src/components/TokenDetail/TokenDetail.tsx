import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { fetchKlines, fetchOrderBook, fetchRecentTrades } from '../../services/binanceApi';
import { getTokenStore } from '../../stores';
import { Kline, OrderBook, Trade } from '../../types/binance';

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
        background: { color: '#1f2937' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    
    const chartData: CandlestickData[] = klines.map(k => ({
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">{t('app.loading')}</div>
      </div>
    );
  }

  const lastPrice = klines[klines.length - 1]?.close || 0;
  const prevPrice = klines[klines.length - 2]?.close || lastPrice;
  const priceChange = ((lastPrice - prevPrice) / prevPrice * 100).toFixed(2);
  const isPositive = parseFloat(priceChange) >= 0;

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{baseSymbol.toUpperCase()}/USDT</h2>
            <div className="text-3xl font-mono mt-1">
              ${parseFloat(lastPrice.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{priceChange}%
            </div>
          </div>
        </div>
      </div>

      <div ref={chartContainerRef} className="bg-gray-800 rounded-lg border border-gray-700" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">{t('tokenDetail.orderBook')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-green-400 mb-2">{t('tokenDetail.bids')}</h4>
              <div className="space-y-1 font-mono text-sm">
                {orderBook?.bids.slice(0, 10).map(([price, qty], i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-green-400">{parseFloat(price).toFixed(2)}</span>
                    <span className="text-gray-400">{parseFloat(qty).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-red-400 mb-2">{t('tokenDetail.asks')}</h4>
              <div className="space-y-1 font-mono text-sm">
                {orderBook?.asks.slice(0, 10).map(([price, qty], i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-red-400">{parseFloat(price).toFixed(2)}</span>
                    <span className="text-gray-400">{parseFloat(qty).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">{t('tokenDetail.recentTrades')}</h3>
          <div className="space-y-1 font-mono text-sm max-h-64 overflow-y-auto">
            {recentTrades.slice(0, 20).map((trade) => (
              <div key={trade.id} className="flex justify-between">
                <span className={trade.isBuyerMaker ? 'text-red-400' : 'text-green-400'}>
                  {parseFloat(trade.price).toFixed(2)}
                </span>
                <span className="text-gray-400">{parseFloat(trade.qty).toFixed(4)}</span>
                <span className="text-gray-500">
                  {new Date(trade.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}