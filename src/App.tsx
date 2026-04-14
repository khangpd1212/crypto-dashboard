import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { initializeMarketData } from "./orchestrators/marketOrchestrator";
import { useStore } from "./stores";
import { Theme } from "./types/common";
import Layout from "./components/Layout";
import Dashboard from "./features/Dashboard";
import Settings from "./features/Settings";
import TokenDetail from "./features/TokenDetail";

function AppContent() {
  const { settingsStore } = useStore();
  const { i18n } = useTranslation();

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

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="token/:symbol" element={<TokenDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}