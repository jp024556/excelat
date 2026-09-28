import React from "react";
import { CellValue, SelectionStyle } from "../model/types";
import { CellEditor } from "./CellEditor";
import { EditMovement } from "../hooks/useEditing";

export interface CellProps {
  row: number;
  col: number;
  value: CellValue;
  isActive: boolean;
  isSelected: boolean;
  isEditing: boolean;
  selectionStyle?: SelectionStyle;
  width?: number;
  height?: number;
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
    selectionStyle = "excel",
    width,
    height,
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
      isEditing ? "excelat-cell-editing" : "",
    ];

    if (selectionStyle === "excel") {
      if (isSelected) classNames.push("excelat-cell-selected");
      if (isActive) classNames.push("excelat-cell-active");
      if (isTopEdge) classNames.push("excelat-border-top");
      if (isBottomEdge) classNames.push("excelat-border-bottom");
      if (isLeftEdge) classNames.push("excelat-border-left");
      if (isRightEdge) classNames.push("excelat-border-right");
    } else if (selectionStyle === "subtle") {
      if (isSelected) classNames.push("excelat-cell-subtle-selected");
      if (isActive) classNames.push("excelat-cell-subtle-active");
    }
    // If selectionStyle === "none", no visual selection classes added

    const style: React.CSSProperties = {};
    if (width !== undefined) {
      style.width = `${width}px`;
      style.minWidth = `${width}px`;
      style.maxWidth = `${width}px`;
    }
    if (height !== undefined) {
      style.height = `${height}px`;
    }

    return (
      <td
        className={classNames.filter(Boolean).join(" ")}
        style={Object.keys(style).length > 0 ? style : undefined}
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
        {/* Fill handle in active cell bottom-right corner only in excel selection style */}
        {selectionStyle === "excel" && isActive && !isEditing && (
          <div className="excelat-cell-handle" />
        )}
      </td>
    );
  }
);

Cell.displayName = "Cell";
