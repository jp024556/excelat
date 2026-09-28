import React from "react";
import { PaginationConfig } from "../model/types";

export interface PaginationProps {
  config: PaginationConfig;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = React.memo(
  ({ config, onPageChange, loading }) => {
    const { page, pageSize, total } = config;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const startItem = Math.min((page - 1) * pageSize + 1, total);
    const endItem = Math.min(page * pageSize, total);

    return (
      <div className="excelat-pagination-bar" role="navigation" aria-label="Pagination">
        <div className="excelat-pagination-info">
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
          <button
            type="button"
            className="excelat-page-btn"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange?.(1)}
            aria-label="First page"
            title="First page"
          >
            «
          </button>
          <button
            type="button"
            className="excelat-page-btn"
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
            className="excelat-page-btn"
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
