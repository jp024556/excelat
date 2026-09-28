import React from "react";
import { getRowLabel } from "../model/dataModel";

export interface RowHeaderProps {
  rowIndex: number;
  isSelected: boolean;
  onSelectRow?: (rowIndex: number) => void;
}

export const RowHeader: React.FC<RowHeaderProps> = React.memo(
  ({ rowIndex, isSelected, onSelectRow }) => {
    return (
      <th
        className={`excelat-row-header ${isSelected ? "excelat-header-selected" : ""}`}
        role="rowheader"
        onClick={() => onSelectRow?.(rowIndex)}
        title={`Row ${getRowLabel(rowIndex)}`}
      >
        {getRowLabel(rowIndex)}
      </th>
    );
  }
);

RowHeader.displayName = "RowHeader";
