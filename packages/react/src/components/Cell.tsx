import React from "react";
import { CellValue } from "../model/types";
import { CellEditor } from "./CellEditor";
import { EditMovement } from "../hooks/useEditing";

export interface CellProps {
  row: number;
  col: number;
  value: CellValue;
  isActive: boolean;
  isSelected: boolean;
  isEditing: boolean;
  editValue?: string;
  isTopEdge?: boolean;
  isBottomEdge?: boolean;
  isLeftEdge?: boolean;
  isRightEdge?: boolean;
  onMouseDown: (e: React.MouseEvent, row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onDoubleClick: (row: number, col: number) => void;
  onEditValueChange?: (value: string) => void;
  onCommitEdit?: (movement?: EditMovement) => void;
  onCancelEdit?: () => void;
}

export const Cell: React.FC<CellProps> = React.memo(
  ({
    row,
    col,
    value,
    isActive,
    isSelected,
    isEditing,
    editValue = "",
    isTopEdge,
    isBottomEdge,
    isLeftEdge,
    isRightEdge,
    onMouseDown,
    onMouseEnter,
    onDoubleClick,
    onEditValueChange,
    onCommitEdit,
    onCancelEdit,
  }) => {
    // Determine alignment and formatting based on value type
    let cellType = "text";
    let formattedText = "";

    if (value !== null && value !== undefined) {
      if (typeof value === "number") {
        cellType = "number";
        formattedText = value.toLocaleString();
      } else if (typeof value === "boolean") {
        cellType = "boolean";
        formattedText = value ? "TRUE" : "FALSE";
      } else {
        formattedText = String(value);
      }
    }

    const classNames = [
      "excelat-cell",
      `excelat-cell-${cellType}`,
      isSelected ? "excelat-cell-selected" : "",
      isActive ? "excelat-cell-active" : "",
      isEditing ? "excelat-cell-editing" : "",
      isTopEdge ? "excelat-border-top" : "",
      isBottomEdge ? "excelat-border-bottom" : "",
      isLeftEdge ? "excelat-border-left" : "",
      isRightEdge ? "excelat-border-right" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <td
        className={classNames}
        role="gridcell"
        aria-selected={isSelected}
        data-row={row}
        data-col={col}
        onMouseDown={(e) => onMouseDown(e, row, col)}
        onMouseEnter={() => onMouseEnter(row, col)}
        onDoubleClick={() => onDoubleClick(row, col)}
      >
        {isEditing ? (
          <CellEditor
            value={editValue}
            onChange={(val) => onEditValueChange?.(val)}
            onCommit={(movement) => onCommitEdit?.(movement)}
            onCancel={() => onCancelEdit?.()}
          />
        ) : (
          <div className="excelat-cell-content" title={formattedText}>
            {formattedText}
          </div>
        )}
        {/* Fill handle in active cell bottom-right corner when selected */}
        {isActive && !isEditing && <div className="excelat-cell-handle" />}
      </td>
    );
  }
);

Cell.displayName = "Cell";
