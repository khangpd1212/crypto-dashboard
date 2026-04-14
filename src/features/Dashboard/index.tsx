import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useStore } from "@/stores";
import TickerCard from "./TickerCard";

const Dashboard = observer(function Dashboard() {
  const { t } = useTranslation();
  const { marketStore } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  // WebSocket is initialized in App.tsx via initializeMarketData()

  const tickers = useMemo(() => {
    const arr = Array.from(marketStore.tickers.values());
    const favorites = Array.from(marketStore.favorites);

    const filtered = arr.filter((ticker) =>
      ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const sorted = [...filtered].sort((a, b) => {
      const aFav = favorites.includes(a.symbol) ? 0 : 1;
      const bFav = favorites.includes(b.symbol) ? 0 : 1;
      return aFav - bFav;
    });

    return sorted;
  }, [marketStore.tickers, marketStore.favorites, searchQuery]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <span className="block text-sm uppercase tracking-[0.16em] text-(--text-muted) mb-2">
              {t("dashboard.marketPulse") || "Recommended coins for 24 hours"}
            </span>
            <h2 className="text-3xl font-semibold">
              {t("dashboard.marketOverview") || "Top staking assets"}
            </h2>
          </div>
          <span className="inline-flex rounded-full bg-(--accent-soft) px-3 py-2 text-sm font-medium text-(--text) dark:text-white/90">
            {tickers.length} {t("dashboard.pairs") || "pairs"}
          </span>
        </div>

        <div className="grid gap-3">
          <label
            htmlFor="search-market"
            className="text-sm font-medium text-(--text-muted)">
            {t("dashboard.search")}
          </label>
          <input
            id="search-market"
            type="text"
            placeholder={t("dashboard.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-(--border) bg-[rgba(15,23,42,0.04)] dark:bg-white/5 px-4 py-3 text-(--text) placeholder:text-(--text-muted) outline-none transition focus:border-(--accent-border)"
          />
        </div>
      </section>

      {marketStore.isLoading && (
        <div className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6 text-(--text-muted)">
          {t("app.loading")}
        </div>
      )}

      {marketStore.error && (
        <div className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6 text-(--danger)">
          {marketStore.error}
        </div>
      )}

      {!marketStore.isLoading && !marketStore.hasReceivedData && (
        <div className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6 text-(--text-muted)">
          {t("dashboard.connecting")}
        </div>
      )}

      {!marketStore.isLoading && marketStore.hasReceivedData && tickers.length === 0 && (
        <div className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6 text-(--text-muted)">
          {t("dashboard.noData")}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
        {tickers.map((ticker) => (
          <TickerCard
            key={ticker.symbol}
            ticker={ticker}
            isFavorite={marketStore.favorites.has(ticker.symbol)}
          />
        ))}
      </div>
    </div>
  );
});

export default Dashboard;
