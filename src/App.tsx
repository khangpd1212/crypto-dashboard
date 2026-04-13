import { useEffect, useState } from 'react';
import { observer } from 'mobx';
import { useTranslation } from 'react-i18next';
import { settingsStore } from './stores';
import { initializeMarketData } from './orchestrators/marketOrchestrator';
import Dashboard from './components/Dashboard/Dashboard';
import TokenDetail from './components/TokenDetail/TokenDetail';
import Settings from './components/Settings/Settings';

type View = 'dashboard' | 'detail' | 'settings';

const App = observer(function App() {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    initializeMarketData();
  }, []);

  useEffect(() => {
    i18n.changeLanguage(settingsStore.language);
    document.documentElement.classList.toggle('dark', settingsStore.theme === 'dark');
  }, [settingsStore.language, settingsStore.theme, i18n]);

  const handleSelectToken = (symbol: string) => {
    setSelectedSymbol(symbol);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('dashboard');
    setSelectedSymbol(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentView !== 'dashboard' && (
              <button
                onClick={handleBack}
                className="px-3 py-1.5 bg-gray-700 rounded hover:bg-gray-600 transition"
              >
                ← Back
              </button>
            )}
            <h1 className="text-xl font-bold">{t('app.title')}</h1>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded transition ${
                currentView === 'dashboard' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {t('dashboard.title')}
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-4 py-2 rounded transition ${
                currentView === 'settings' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              ⚙️
            </button>
          </nav>
        </div>
      </header>

      <main className="p-4">
        {currentView === 'dashboard' && (
          <Dashboard onSelectToken={handleSelectToken} />
        )}
        {currentView === 'detail' && selectedSymbol && (
          <TokenDetail symbol={selectedSymbol} onBack={handleBack} />
        )}
        {currentView === 'settings' && (
          <Settings />
        )}
      </main>
    </div>
  );
});

export default App;