import React from "react";
import { getColumnLabel } from "../model/dataModel";
import { ExcelatColumn } from "../model/types";

export interface ColumnHeaderProps {
  totalCols: number;
  columns?: ExcelatColumn[];
  showColumnLetters?: boolean;
  showRowNumbers?: boolean;
  columnWidths?: Record<number, number>;
  defaultColWidth?: number;
  isColumnSelected: (colIndex: number) => boolean;
  onSelectColumn?: (colIndex: number) => void;
  onSelectAll?: () => void;
  onStartResizeCol?: (e: React.MouseEvent, colIndex: number) => void;
  onAutoFitCol?: (colIndex: number) => void;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = React.memo(
  ({
    totalCols,
    columns,
    showColumnLetters = true,
    showRowNumbers = true,
    columnWidths = {},
    defaultColWidth = 100,
    isColumnSelected,
    onSelectColumn,
    onSelectAll,
    onStartResizeCol,
    onAutoFitCol,
  }) => {
    const colIndices = Array.from({ length: totalCols }, (_, i) => i);

    return (
      <tr className="excelat-header-row" role="row">
        {/* Top-left corner header (only rendered if row numbers are shown) */}
        {showRowNumbers && (
          <th
            className="excelat-header-corner"
            role="columnheader"
            aria-label="Select all"
            onClick={onSelectAll}
          >
            <div className="excelat-corner-inner" />
          </th>
        )}

        {colIndices.map((col) => {
          const selected = isColumnSelected(col);
          const customHeader = columns?.[col]?.header;
          const label =
            customHeader !== undefined
              ? customHeader
              : showColumnLetters
              ? getColumnLabel(col)
              : "";

          const width = columnWidths[col] ?? columns?.[col]?.width ?? defaultColWidth;

          return (
            <th
              key={col}
              className={`excelat-col-header ${selected ? "excelat-header-selected" : ""}`}
              style={{
                width: `${width}px`,
                minWidth: `${width}px`,
                maxWidth: `${width}px`,
              }}
              role="columnheader"
              onClick={() => onSelectColumn?.(col)}
              title={label ? `Column: ${label}` : undefined}
            >
              <div className="excelat-col-header-content">
                <span className="excelat-col-header-text">{label}</span>
              </div>

              {/* Column Resize Handle */}
              <div
                className="excelat-col-resize-handle"
                role="separator"
                aria-orientation="vertical"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onStartResizeCol?.(e, col);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onAutoFitCol?.(col);
                }}
              />
            </th>
          );
        })}
      </tr>
    );
  }
);

ColumnHeader.displayName = "ColumnHeader";
