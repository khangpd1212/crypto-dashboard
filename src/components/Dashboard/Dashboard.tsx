import { useState, useMemo, observer } from 'react';
import { useTranslation } from 'react-i18next';
import { marketStore } from '../../stores';
import TickerCard from './TickerCard';

interface DashboardProps {
  onSelectToken: (symbol: string) => void;
}

const Dashboard = observer(function Dashboard({ onSelectToken }: DashboardProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const tickers = useMemo(() => {
    const arr = Array.from(marketStore.tickers.values());
    const favorites = Array.from(marketStore.favorites);
    
    const filtered = arr.filter(t => 
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const sorted = [...filtered].sort((a, b) => {
      const aFav = favorites.includes(a.symbol) ? 0 : 1;
      const bFav = favorites.includes(b.symbol) ? 0 : 1;
      return aFav - bFav;
    });
    
    return sorted;
  }, [marketStore.tickers, marketStore.favorites, searchQuery]);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('dashboard.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {marketStore.isLoading && (
        <div className="text-center py-8 text-gray-400">
          {t('app.loading')}
        </div>
      )}
      
      {marketStore.error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {marketStore.error}
        </div>
      )}
      
      {!marketStore.isLoading && tickers.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          {t('dashboard.noData')}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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