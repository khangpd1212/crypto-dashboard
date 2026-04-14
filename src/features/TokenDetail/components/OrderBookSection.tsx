import { useTranslation } from 'react-i18next';
import { OrderBook } from '@/types/binance';
import OrderBookTable from './OrderBookTable';

interface OrderBookSectionProps {
  orderBook: OrderBook | null;
}

export default function OrderBookSection({ orderBook }: OrderBookSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-[28px] border border-(--border) bg-(--surface) shadow-[0_30px_90px_rgba(0,0,0,0.28)] p-6">
      <h3 className="text-lg font-semibold mb-4">{t('tokenDetail.orderBook')}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <OrderBookTable orderBook={orderBook} type="bids" maxRows={10} />
        <OrderBookTable orderBook={orderBook} type="asks" maxRows={10} />
      </div>
    </section>
  );
}