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
      Theme.Dark,
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
    <div className="min-h-screen flex relative">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 flex-col gap-6 px-5 py-7 bg-white/95 dark:bg-[#0a1228] border-r border-[rgba(15,23,42,0.08)] dark:border-white/10 shadow-[inset_-1px_0_0_rgba(15,23,42,0.08)] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.02)] overflow-y-auto">
        <div className="flex items-center gap-3.5 py-2">
          <div className="w-12 h-12 rounded-[1.25rem] grid place-items-center bg-(--accent) text-white text-2xl shadow-[0_8px_24px_rgba(79,93,255,0.18)] border border-(--accent-border)">
            ⚡
          </div>
          <div className="min-w-0">
            <span className="block text-[0.72rem] uppercase tracking-[0.24em] text-(--text-muted) font-semibold mb-0.5">
              {t("app.brand") || "StakeNet"}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">{t("app.title")}</h1>
          </div>
        </div>

        <nav className="grid gap-2">
          {[
            { view: "dashboard", icon: "📊", label: t("dashboard.title") },
            { view: "settings", icon: "⚙️", label: t("settings.title") },
          ].map(({ view, icon, label }) => (
            <button
              key={view}
              onClick={() => setCurrentView(view as View)}
              className={`w-full text-left px-4 py-3 rounded-2xl border transition duration-200 flex items-center gap-3 text-sm font-medium ${
                currentView === view
                  ? "bg-(--accent) border-(--accent-border) text-white shadow-[0_8px_24px_rgba(79,93,255,0.15)]"
                  : "bg-white/90 dark:bg-white/5 border-[rgba(15,23,42,0.08)] dark:border-white/5 text-(--text) hover:bg-[rgba(79,93,255,0.12)] hover:border-(--accent-border) dark:hover:bg-[rgba(255,255,255,0.12)]"
              }`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.75)] dark:bg-[rgba(79,93,255,0.08)] px-4 py-3 text-center text-sm font-medium tracking-[0.03em] text-(--text) dark:text-white">
          {t("app.status") || "Live market feed"}
        </div>
      </aside>

      <div className="flex-1 md:ml-72 min-h-screen">
        <header className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 md:px-10 pt-8 pb-5">
          <div>
            <span className="inline-block text-[0.72rem] uppercase tracking-[0.16em] text-(--text-muted) mb-2">
              {t("app.cockpit") || "Liquid Staking Cockpit"}
            </span>
            <div className="text-[clamp(2rem,2.2vw,3rem)] font-semibold leading-[0.94] max-w-3xl">
              {currentView === "dashboard"
                ? t("dashboard.title")
                : currentView === "settings"
                ? t("settings.title")
                : `${selectedSymbol?.replace("USDT", "")} / USDT`}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentView !== "dashboard" && (
              <button
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-(--text) transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(79,93,255,0.16)]"
                onClick={handleBack}
              >
                ← {t("app.back") || "Back"}
              </button>
            )}
          </div>
        </header>

        <main className="pt-6 px-4 pb-10 md:px-10 flex flex-col gap-6">
          {currentView === "dashboard" && <Dashboard onSelectToken={handleSelectToken} />}
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
