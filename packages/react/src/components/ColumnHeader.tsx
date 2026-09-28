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
  visibleColIndices?: number[];
  leftSpacerWidth?: number;
  rightSpacerWidth?: number;
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
    visibleColIndices,
    leftSpacerWidth = 0,
    rightSpacerWidth = 0,
    isColumnSelected,
    onSelectColumn,
    onSelectAll,
    onStartResizeCol,
    onAutoFitCol,
  }) => {
    const colIndices =
      visibleColIndices ?? Array.from({ length: totalCols }, (_, i) => i);

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

        {leftSpacerWidth > 0 && (
          <th
            style={{
              width: `${leftSpacerWidth}px`,
              minWidth: `${leftSpacerWidth}px`,
              maxWidth: `${leftSpacerWidth}px`,
              padding: 0,
              border: 0,
            }}
            aria-hidden="true"
          />
        )}

        {colIndices.map((col) => {
          const selected = isColumnSelected(col);
          const customHeader = columns?.[col]?.header;
          const colLetter = getColumnLabel(col);
          const label =
            customHeader !== undefined
              ? showColumnLetters
                ? `${colLetter}: ${customHeader}`
                : customHeader
              : showColumnLetters
              ? colLetter
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
              data-col={col}
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

        {rightSpacerWidth > 0 && (
          <th
            style={{
              width: `${rightSpacerWidth}px`,
              minWidth: `${rightSpacerWidth}px`,
              maxWidth: `${rightSpacerWidth}px`,
              padding: 0,
              border: 0,
            }}
            aria-hidden="true"
          />
        )}
      </tr>
    );
  }
);

ColumnHeader.displayName = "ColumnHeader";
