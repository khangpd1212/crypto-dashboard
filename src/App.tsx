import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Dashboard from "./components/Dashboard/Dashboard";
import Settings from "./components/Settings/Settings";
import TokenDetail from "./components/TokenDetail/TokenDetail";
import { initializeMarketData } from "./orchestrators/marketOrchestrator";
import { useStore } from "./stores";
import { Theme } from "./types/common";

type View = "dashboard" | "detail" | "settings";

const App = observer(function App() {
  const { settingsStore } = useStore();
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    initializeMarketData();
  }, []);

  useEffect(() => {
    i18n.changeLanguage(settingsStore.language);
    document.documentElement.classList.toggle(
      "dark",
      settingsStore.theme === Theme.Dark,
    );
  }, [settingsStore.language, settingsStore.theme, i18n]);

  const handleSelectToken = (symbol: string) => {
    setSelectedSymbol(symbol);
    setCurrentView("detail");
  };

  const handleBack = () => {
    setCurrentView("dashboard");
    setSelectedSymbol(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar-panel">
        <div className="brand-sidebar">
          <div className="brand-logo">⚡</div>
          <div className="brand-copy">
            <span className="copy-small">{t("app.brand") || "StakeNet"}</span>
            <h1>{t("app.title")}</h1>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={currentView === "dashboard" ? "active" : ""}
          >
            <span>📊</span>
            {t("dashboard.title")}
          </button>
          <button
            onClick={() => setCurrentView("settings")}
            className={currentView === "settings" ? "active" : ""}
          >
            <span>⚙️</span>
            {t("settings.title")}
          </button>
        </nav>

        <div className="sidebar-note">
          <span>{t("app.status") || "Live market feed"}</span>
        </div>
      </aside>

      <div className="workspace">
        <header className="header-panel">
          <div>
            <span className="eyebrow">{t("app.cockpit") || "Liquid Staking Cockpit"}</span>
            <div className="headline">
              {currentView === "dashboard"
                ? t("dashboard.title")
                : currentView === "settings"
                ? t("settings.title")
                : `${selectedSymbol?.replace('USDT', '')} / USDT`}
            </div>
          </div>
          <div className="header-actions">
            {currentView !== "dashboard" && (
              <button className="header-btn" onClick={handleBack}>
                ← {t("app.back") || "Back"}
              </button>
            )}
          </div>
        </header>

        <main className="content-wrap">
          {currentView === "dashboard" && (
            <Dashboard onSelectToken={handleSelectToken} />
          )}
          {currentView === "detail" && selectedSymbol && (
            <TokenDetail symbol={selectedSymbol} onBack={handleBack} />
          )}
          {currentView === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
});

export default App;
