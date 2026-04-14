import { useTranslation } from 'react-i18next';
import { Trade } from '@/types/binance';
import RecentTradesTable from './RecentTradesTable';

interface RecentTradesSectionProps {
  trades: Trade[];
  maxRows?: number;
}

export default function RecentTradesSection({ trades, maxRows = 50 }: RecentTradesSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6">
      <h3 className="text-lg font-semibold mb-4">{t('tokenDetail.recentTrades')}</h3>
      <RecentTradesTable trades={trades} maxRows={maxRows} />
    </section>
  );
}