import { useTranslation } from 'react-i18next';
import { OrderBook } from '@/types/binance';
import DataTable, { Column } from '@/components/DataTable';

interface OrderRow {
  price: string;
  qty: string;
  total: string;
}

interface OrderBookTableProps {
  orderBook: OrderBook | null;
  type: 'bids' | 'asks';
  maxRows?: number;
}

export default function OrderBookTable({ orderBook, type, maxRows = 10 }: OrderBookTableProps) {
  const { t } = useTranslation();
  const orders = type === 'bids' ? orderBook?.bids : orderBook?.asks;
  const colorClass = type === 'bids' ? 'text-(--success)' : 'text-(--danger)';
  const label = type === 'bids' ? t('tokenDetail.bids') : t('tokenDetail.asks');

  const columns: Column<OrderRow>[] = [
    { 
      key: 'price', 
      header: 'Giá (USDT)', 
      className: colorClass,
      render: (row) => parseFloat(row.price).toFixed(2),
    },
    { 
      key: 'qty', 
      header: 'Số lượng',
      render: (row) => parseFloat(row.qty).toFixed(4),
    },
    { 
      key: 'total', 
      header: 'Tổng',
      render: (row) => row.total,
    },
  ];

  const processedData: OrderRow[] = (orders || []).slice(0, maxRows).map(([price, qty]) => {
    const p = parseFloat(price);
    const q = parseFloat(qty);
    return { price, qty, total: (p * q).toFixed(2) };
  });

  return (
    <div>
      <div className="mb-3 text-sm uppercase tracking-[0.12em] text-(--text-muted) font-semibold">
        {label}
      </div>
      <DataTable
        columns={columns}
        data={processedData}
        maxRows={maxRows}
        keyExtractor={(_item, index) => index}
        emptyMessage="No orders"
      />
    </div>
  );
}