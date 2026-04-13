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
  const fillWidth = Math.min(Math.abs(changePercent) * 3.5, 100);

  return (
    <div
      onClick={onClick}
      className={`ticker-card ${flash === 'up' ? 'flash-up' : ''} ${flash === 'down' ? 'flash-down' : ''}`}
    >
      <div className="flash-ring" />
      <div className="card-top">
        <div className="ticker-symbol">
          <span>{baseSymbol}</span>
          <small>/USDT</small>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            marketStore.toggleFavorite(ticker.symbol);
          }}
          className="star-btn"
          aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div className="price">
        ${parseFloat(ticker.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      <div className={`change ${isPositive ? 'up' : 'down'}`}>
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </div>

      <div className="bar-wrap" aria-hidden="true">
        <div className="bar-fill" style={{ width: `${fillWidth}%` }} />
      </div>
    </div>
  );
}

export default memo(TickerCard);
