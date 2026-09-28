import React from "react";
import { getRowLabel } from "../model/dataModel";

export interface RowHeaderProps {
  rowIndex: number;
  height?: number;
  isSelected: boolean;
  onSelectRow?: (rowIndex: number) => void;
  onStartResizeRow?: (e: React.MouseEvent, rowIndex: number) => void;
}

export const RowHeader: React.FC<RowHeaderProps> = React.memo(
  ({ rowIndex, height, isSelected, onSelectRow, onStartResizeRow }) => {
    return (
      <th
        className={`excelat-row-header ${isSelected ? "excelat-header-selected" : ""}`}
        style={height ? { height: `${height}px` } : undefined}
        role="rowheader"
        onClick={() => onSelectRow?.(rowIndex)}
        title={`Row ${getRowLabel(rowIndex)}`}
      >
        <span className="excelat-row-header-text">{getRowLabel(rowIndex)}</span>

        {/* Row Resize Handle */}
        <div
          className="excelat-row-resize-handle"
          role="separator"
          aria-orientation="horizontal"
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartResizeRow?.(e, rowIndex);
          }}
        />
      </th>
    );
  }
);

RowHeader.displayName = "RowHeader";
