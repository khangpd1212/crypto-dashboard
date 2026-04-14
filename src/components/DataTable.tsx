import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  maxRows?: number;
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  maxHeight?: string;
}

export default function DataTable<T>({
  columns,
  data,
  maxRows,
  keyExtractor,
  emptyMessage = 'No data',
  maxHeight = '400px',
}: DataTableProps<T>) {
  const displayData = maxRows ? data.slice(0, maxRows) : data;

  return (
    <div className="grid gap-1">
      <div className="grid gap-1 text-sm font-medium text-(--text-muted) mb-1 px-3">
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
          {columns.map((col) => (
            <span key={col.key}>{col.header}</span>
          ))}
        </div>
      </div>
      <div className="grid gap-1 overflow-y-auto" style={{ maxHeight }}>
        {displayData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-(--text-muted)">
            {emptyMessage}
          </div>
        ) : (
          displayData.map((item, index) => (
            <div
              key={keyExtractor(item, index)}
              className="grid gap-2 rounded-xl px-3 py-2 text-sm text-(--text-muted) hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-white/5"
              style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
            >
              {columns.map((col) => (
                <span key={col.key} className={col.className}>
                  {col.render ? col.render(item, index) : String((item as Record<string, unknown>)[col.key] ?? '')}
                </span>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}