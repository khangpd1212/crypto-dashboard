import { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/stores';
import TickerCard from './TickerCard';

interface DashboardProps {
  onSelectToken: (symbol: string) => void;
}

const Dashboard = observer(function Dashboard({ onSelectToken }: DashboardProps) {
  const { t } = useTranslation();
  const { marketStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const tickers = useMemo(() => {
    const arr = Array.from(marketStore.tickers.values());
    const favorites = Array.from(marketStore.favorites);

    const filtered = arr.filter((t) =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const sorted = [...filtered].sort((a, b) => {
      const aFav = favorites.includes(a.symbol) ? 0 : 1;
      const bFav = favorites.includes(b.symbol) ? 0 : 1;
      return aFav - bFav;
    });

    return sorted;
  }, [marketStore.tickers, marketStore.favorites, searchQuery]);

  return (
    <div className="dashboard-shell">
      <section className="panel glass-panel dashboard-summary">
        <div className="section-head">
          <div>
            <span className="subtitle">{t('dashboard.marketPulse') || 'Recommended coins for 24 hours'}</span>
            <h2>{t('dashboard.marketOverview') || 'Top staking assets'}</h2>
          </div>
          <span className="count-pill">{tickers.length} {t('dashboard.pairs') || 'pairs'}</span>
        </div>

        <div className="search-panel">
          <label htmlFor="search-market">{t('dashboard.search')}</label>
          <input
            id="search-market"
            type="text"
            placeholder={t('dashboard.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {marketStore.isLoading && (
        <div className="panel glass-panel panel-info">{t('app.loading')}</div>
      )}

      {marketStore.error && (
        <div className="panel glass-panel panel-error">{marketStore.error}</div>
      )}

      {!marketStore.isLoading && tickers.length === 0 && (
        <div className="panel glass-panel panel-info">{t('dashboard.noData')}</div>
      )}

      <div className="ticker-grid">
        {tickers.map((ticker) => (
          <TickerCard
            key={ticker.symbol}
            ticker={ticker}
            isFavorite={marketStore.favorites.has(ticker.symbol)}
            onClick={() => onSelectToken(ticker.symbol)}
          />
        ))}
      </div>
    </div>
  );
});

export default Dashboard;
