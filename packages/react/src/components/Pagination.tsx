import React from "react";
import { PaginationConfig } from "../model/types";

export interface PaginationProps {
  config: PaginationConfig;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = React.memo(
  ({ config, onPageChange, onPageSizeChange, loading }) => {
    const { page, pageSize, total = 0 } = config;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const startItem = total > 0 ? Math.min((page - 1) * pageSize + 1, total) : 0;
    const endItem = Math.min(page * pageSize, total);

    return (
      <div className="excelat-pagination excelat-pagination-bar" role="navigation" aria-label="Pagination">
        <div className="excelat-pagination-info excelat-pagination-summary">
          {total > 0 ? (
            <>
              Showing <strong>{startItem.toLocaleString()}</strong>–
              <strong>{endItem.toLocaleString()}</strong> of{" "}
              <strong>{total.toLocaleString()}</strong>
            </>
          ) : (
            "0 items"
          )}
        </div>

        <div className="excelat-pagination-controls">
          {onPageSizeChange && (
            <div className="excelat-page-size-selector">
              <label htmlFor="excelat-page-size" className="excelat-page-size-label">
                Rows:
              </label>
              <select
                id="excelat-page-size"
                className="excelat-page-size-select"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                disabled={loading}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}

          <button
            type="button"
            className="excelat-page-btn excelat-pagination-first"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange?.(1)}
            aria-label="First page"
            title="First page"
          >
            «
          </button>
          <button
            type="button"
            className="excelat-page-btn excelat-pagination-prev"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange?.(page - 1)}
            aria-label="Previous page"
            title="Previous page"
          >
            ‹
          </button>

          <span className="excelat-page-current">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            className="excelat-page-btn excelat-pagination-next"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange?.(page + 1)}
            aria-label="Next page"
            title="Next page"
          >
            ›
          </button>
          <button
            type="button"
            className="excelat-page-btn"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange?.(totalPages)}
            aria-label="Last page"
            title="Last page"
          >
            »
          </button>
        </div>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";
