import { useTranslation } from 'react-i18next';
import { Trade } from '@/types/binance';
import { SimpleDataTable, type Column } from '@/components/DataTable';

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
      render: (_value, trade) => {
        const cls = trade.isBuyerMaker ? 'text-(--danger)' : 'text-(--success)';
        return <span className={cls}>{parseFloat(trade.price).toFixed(2)}</span>;
      }
    },
    { 
      key: 'qty', 
      header: 'Số lượng (ETH)',
      render: (_value, trade) => parseFloat(trade.qty).toFixed(4),
    },
    { 
      key: 'time', 
      header: 'Thời gian',
      className: 'text-(--text-muted)',
      render: (_value, trade) => new Date(trade.time).toLocaleTimeString(),
    },
  ];

  return (
    <SimpleDataTable
      columns={columns}
      data={trades}
      maxRows={maxRows}
      keyExtractor={(trade) => trade.id}
      emptyMessage={t('tokenDetail.noTrades') || 'No recent trades'}
    />
  );
}