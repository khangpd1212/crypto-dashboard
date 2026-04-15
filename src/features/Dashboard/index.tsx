import { useStore } from "@/stores";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DataTable, TableColumn } from "@/components/DataTable";

const Dashboard = observer(function Dashboard() {
  const { t } = useTranslation();
  const { marketStore } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const arr = Array.from(marketStore.tickers.values());

  const filtered = arr.filter((ticker) =>
    ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tickers = [...filtered].sort((a, b) => {
    const aFav = marketStore.favorites.has(a.symbol) ? 0 : 1;
    const bFav = marketStore.favorites.has(b.symbol) ? 0 : 1;
    return aFav - bFav;
  });

  const hasData = tickers.length > 0;

  const handleRowClick = (ticker: { symbol: string }) => {
    navigate(`/token/${ticker.symbol}`);
  };

  const columns: TableColumn[] = [
    {
      key: 'symbol',
      headerKey: 'dashboard.table.pair',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{item.symbol.replace('USDT', '')}</span>
          <span className="text-xs text-[--text-muted]">/USDT</span>
        </div>
      ),
    },
    {
      key: 'price',
      headerKey: 'dashboard.table.lastPrice',
      className: 'font-mono',
      render: (item) => `$${parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      key: 'priceChangePercent',
      headerKey: 'dashboard.table.change',
      render: (item) => {
        const change = parseFloat(item.priceChangePercent);
        return (
          <span className={change >= 0 ? 'text-[--success]' : 'text-[--danger]'}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        );
      },
    },
  ];

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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageIndex(0);
            }}
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

      {!marketStore.isLoading && !hasData && (
        <div className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6 text-(--text-muted)">
          {t("dashboard.noData")}
        </div>
      )}

      {!marketStore.isLoading && hasData && (
        <section className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6">
          <DataTable 
            data={tickers} 
            columns={columns}
            pageSize={10} 
            pageIndex={pageIndex}
            onPageChange={setPageIndex}
            onRowClick={handleRowClick}
            emptyMessage={t("dashboard.noData")}
          />
        </section>
      )}
    </div>
  );
});

export default Dashboard;
