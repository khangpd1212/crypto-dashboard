import { useState, useEffect, memo } from 'react';
import { useStore } from '@/stores';
import { Ticker } from '@/types/binance';

interface TickerCardProps {
  ticker: Ticker;
  isFavorite: boolean;
  onClick: () => void;
}

function TickerCard({ ticker, isFavorite, onClick }: TickerCardProps) {
  const { marketStore } = useStore();
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const [prevPrice, setPrevPrice] = useState(ticker.price);
  
  useEffect(() => {
    const currentPrice = parseFloat(ticker.price);
    const prev = parseFloat(prevPrice);
    
    if (currentPrice > prev) {
      setFlash('up');
    } else if (currentPrice < prev) {
      setFlash('down');
    }
    
    setPrevPrice(ticker.price);
    
    const timeout = setTimeout(() => setFlash(null), 300);
    return () => clearTimeout(timeout);
  }, [ticker.price, prevPrice]);

  const changePercent = parseFloat(ticker.priceChangePercent);
  const isPositive = changePercent >= 0;
  const baseSymbol = ticker.symbol.replace('USDT', '');

  return (
    <div
      onClick={onClick}
      className={`
        bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-750
        border border-gray-700 hover:border-gray-600
        ${flash === 'up' ? 'ring-2 ring-green-500' : ''}
        ${flash === 'down' ? 'ring-2 ring-red-500' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-lg font-bold">{baseSymbol}</span>
          <span className="text-sm text-gray-400 ml-1">/USDT</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            marketStore.toggleFavorite(ticker.symbol);
          }}
          className="text-xl hover:scale-110 transition"
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
      </div>
      
      <div className="text-2xl font-mono mb-1">
        ${parseFloat(ticker.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      
      <div className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </div>
    </div>
  );
}

export default memo(TickerCard);