import React from "react";
import { getColumnLabel } from "../model/dataModel";

export interface ColumnHeaderProps {
  totalCols: number;
  isColumnSelected: (colIndex: number) => boolean;
  onSelectColumn?: (colIndex: number) => void;
  onSelectAll?: () => void;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = React.memo(
  ({ totalCols, isColumnSelected, onSelectColumn, onSelectAll }) => {
    const colIndices = Array.from({ length: totalCols }, (_, i) => i);

    return (
      <tr className="excelat-header-row" role="row">
        {/* Top-left corner header */}
        <th
          className="excelat-header-corner"
          role="columnheader"
          aria-label="Select all"
          onClick={onSelectAll}
        >
          <div className="excelat-corner-inner" />
        </th>

        {colIndices.map((col) => {
          const selected = isColumnSelected(col);
          return (
            <th
              key={col}
              className={`excelat-col-header ${selected ? "excelat-header-selected" : ""}`}
              role="columnheader"
              onClick={() => onSelectColumn?.(col)}
              title={`Column ${getColumnLabel(col)}`}
            >
              {getColumnLabel(col)}
            </th>
          );
        })}
      </tr>
    );
  }
);

ColumnHeader.displayName = "ColumnHeader";
