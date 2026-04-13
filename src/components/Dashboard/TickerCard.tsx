import { useEffect, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores';
import { Ticker } from '@/types/binance';

interface TickerCardProps {
  ticker: Ticker;
  isFavorite: boolean;
  onClick: () => void;
}

function TickerCard({ ticker, isFavorite, onClick }: TickerCardProps) {
  const { t } = useTranslation();
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
      className={`relative cursor-pointer overflow-hidden rounded-[26px] border border-(--border) bg-(--surface) p-6 text-(--text) shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 ${
        flash === 'up'
          ? 'ring-2 ring-cyan-400/40'
          : flash === 'down'
          ? 'ring-2 ring-orange-400/40'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="space-y-1">
          <span className="text-lg font-semibold">{baseSymbol}</span>
          <small className="text-sm text-(--text-muted)">/USDT</small>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            marketStore.toggleFavorite(ticker.symbol);
          }}
          className="rounded-2xl border border-(--border) bg-[rgba(15,23,42,0.05)] dark:bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
          aria-label={isFavorite ? t('common.removeFavorite') : t('common.addFavorite')}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div className="text-3xl font-semibold tracking-tight">${parseFloat(ticker.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

      <div
        className={`mt-3 inline-flex rounded-full px-3 py-2 text-sm font-semibold ${
          isPositive
            ? 'bg-[rgba(82,227,255,0.14)] text-(--success)'
            : 'bg-[rgba(255,111,111,0.12)] text-(--danger)'
        }`}
      >
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[rgba(15,23,42,0.06)] dark:bg-white/5">
        <div
          className={`h-full rounded-full ${
            isPositive ? 'bg-[rgba(82,227,255,0.85)]' : 'bg-[rgba(255,111,111,0.85)]'
          }`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
    </div>
  );
}

export default memo(TickerCard);
