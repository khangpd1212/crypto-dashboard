import { useTranslation } from "react-i18next";
import { Ticker } from "@/types/binance";

export interface TableColumn {
  key: string;
  headerKey: string;
  render?: (item: Ticker, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  data: Ticker[];
  columns: TableColumn[];
  pageSize?: number;
  pageIndex?: number;
  onPageChange?: (pageIndex: number) => void;
  onRowClick?: (ticker: Ticker) => void;
  emptyMessage?: string;
}

interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
  className?: string;
}

export type { Column };

export function SimpleDataTable<T>({
  columns,
  data,
  maxRows,
  keyExtractor,
  emptyMessage = "No data",
}: {
  columns: Column<T>[];
  data: T[];
  maxRows?: number;
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
}) {
  const displayData = maxRows ? data.slice(0, maxRows) : data;

  return (
    <div className="w-full">
      <div className="grid gap-1 text-sm font-medium text-[--text-muted] mb-1 px-3">
        <div
          className={`grid gap-2`}
          style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
          {columns.map((col) => (
            <span key={col.key}>{col.header}</span>
          ))}
        </div>
      </div>
      <div className="grid gap-1 overflow-y-auto max-h-100">
        {displayData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-[--text-muted]">
            {emptyMessage}
          </div>
        ) : (
          displayData.map((item, index) => (
            <div
              key={keyExtractor(item, index)}
              className="grid gap-2 px-3 py-2 text-sm text-[--text-muted] hover:bg-white/5"
              style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
              {columns.map((col) => (
                <span key={col.key} className={col.className}>
                  {col.render
                    ? col.render(
                        (item as Record<string, unknown>)[col.key],
                        item,
                        index,
                      )
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </span>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PaginationEllipsis({ className }: { className?: string }) {
  return (
    <span className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
      <span className="sr-only">More pages</span>
    </span>
  );
}

export function DataTable({
  data,
  columns,
  pageSize = 10,
  pageIndex = 0,
  onPageChange,
  onRowClick,
  emptyMessage = "No results.",
}: DataTableProps) {
  const { t } = useTranslation();

  const totalRows = data.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  const startRow = pageIndex * pageSize;
  const endRow = Math.min(startRow + pageSize, totalRows);
  const pageData = data.slice(startRow, endRow);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (pageIndex < 5) {
        for (let i = 0; i < 5; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages - 1);
      } else if (pageIndex > totalPages - 5) {
        pages.push(0);
        pages.push("ellipsis");
        for (let i = totalPages - 5; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push("ellipsis");
        for (let i = pageIndex - 1; i <= pageIndex + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages - 1);
      }
    }
    return pages;
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="h-12 px-4 text-left align-middle font-medium text-[--text-muted] text-xs uppercase tracking-wider">
                  {t(col.headerKey)}
                </th>
              ))}
              <th className="h-12 px-4 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {pageData.length ? (
              pageData.map((item, index) => (
                <tr
                  key={item.symbol}
                  onClick={() => onRowClick?.(item)}
                  className="cursor-pointer transition-colors hover:bg-white/5">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-4 align-middle ${col.className || ""}`}>
                      {col.render ? col.render(item, index) : "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="h-24 text-center text-[--text-muted]">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between py-4 px-2">
        <div className="text-sm text-[--text-muted]">
          {t("pagination.showing", {
            start: startRow + 1,
            end: endRow,
            total: totalRows,
          })}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium text-[--text-muted] transition hover:bg-white/5 disabled:opacity-50"
            onClick={() => onPageChange?.(pageIndex - 1)}
            disabled={pageIndex === 0}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          {getPageNumbers().map((page, idx) =>
            page === "ellipsis" ? (
              <PaginationEllipsis
                key={`ellipsis-${idx}`}
                className="flex h-9 w-9 items-center justify-center"
              />
            ) : (
              <button
                key={page}
                className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                  page === pageIndex
                    ? "bg-white/10 text-[--text]"
                    : "text-[--text-muted] hover:bg-white/5"
                }`}
                onClick={() => onPageChange?.(page)}>
                {page + 1}
              </button>
            ),
          )}
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium text-[--text-muted] transition hover:bg-white/5 disabled:opacity-50"
            onClick={() => onPageChange?.(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
