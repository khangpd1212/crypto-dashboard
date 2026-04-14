import { useTranslation } from 'react-i18next';
import { Trade } from '@/types/binance';
import DataTable, { Column } from '@/components/DataTable';

interface RecentTradesTableProps {
  trades: Trade[];
  maxRows?: number;
}

export default function RecentTradesTable({ trades, maxRows = 50 }: RecentTradesTableProps) {
  const { t } = useTranslation();

  const columns: Column<Trade>[] = [
    { 
      key: 'price', 
      header: 'Giá (USDT)',
      render: (trade) => {
        const cls = trade.isBuyerMaker ? 'text-(--danger)' : 'text-(--success)';
        return <span className={cls}>{parseFloat(trade.price).toFixed(2)}</span>;
      }
    },
    { 
      key: 'qty', 
      header: 'Số lượng (ETH)',
      render: (trade) => parseFloat(trade.qty).toFixed(4),
    },
    { 
      key: 'time', 
      header: 'Thời gian',
      className: 'text-(--text-muted)',
      render: (trade) => new Date(trade.time).toLocaleTimeString(),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={trades}
      maxRows={maxRows}
      keyExtractor={(trade) => trade.id}
      emptyMessage={t('tokenDetail.noTrades') || 'No recent trades'}
      maxHeight="400px"
    />
  );
}