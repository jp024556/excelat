import React from "react";
import { CellValue, SelectionStyle, CellRenderContext } from "../model/types";
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
  isFillTarget?: boolean;
  isMoveTarget?: boolean;
  render?: (context: CellRenderContext) => React.ReactNode;
  onMouseDown: (e: React.MouseEvent, row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onDoubleClick: (row: number, col: number) => void;
  onContextMenu?: (e: React.MouseEvent, row: number, col: number) => void;
  onFillHandleMouseDown?: (e: React.MouseEvent) => void;
  onRangeBorderMouseDown?: (e: React.MouseEvent) => void;
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
    isFillTarget,
    isMoveTarget,
    render,
    onMouseDown,
    onMouseEnter,
    onDoubleClick,
    onContextMenu,
    onFillHandleMouseDown,
    onRangeBorderMouseDown,
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
      isFillTarget ? "excelat-cell-fill-target" : "",
      isMoveTarget ? "excelat-cell-move-target" : "",
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

    const style: React.CSSProperties = {};
    if (width !== undefined) {
      style.width = `${width}px`;
      style.minWidth = `${width}px`;
      style.maxWidth = `${width}px`;
    }
    if (height !== undefined) {
      style.height = `${height}px`;
    }

    const hasBorderEdge = isTopEdge || isBottomEdge || isLeftEdge || isRightEdge;

    const handleCellMouseDown = (e: React.MouseEvent) => {
      // If clicking near border of selected range (and not in edit mode), trigger range move
      if (
        hasBorderEdge &&
        isSelected &&
        !isEditing &&
        onRangeBorderMouseDown &&
        (e.target as HTMLElement).classList.contains("excelat-cell-border-drag-zone")
      ) {
        onRangeBorderMouseDown(e);
        return;
      }
      onMouseDown(e, row, col);
    };

    return (
      <td
        className={classNames.filter(Boolean).join(" ")}
        style={Object.keys(style).length > 0 ? style : undefined}
        role="gridcell"
        aria-selected={isSelected}
        data-row={row}
        data-col={col}
        onMouseDown={handleCellMouseDown}
        onMouseEnter={() => onMouseEnter(row, col)}
        onDoubleClick={() => onDoubleClick(row, col)}
        onContextMenu={(e) => onContextMenu?.(e, row, col)}
      >
        {isEditing ? (
          <CellEditor
            value={editValue}
            onChange={(val) => onEditValueChange?.(val)}
            onCommit={(movement) => onCommitEdit?.(movement)}
            onCancel={() => onCancelEdit?.()}
          />
        ) : render && value !== null && value !== undefined ? (
          <div className="excelat-cell-content">
            {render({ value, rowIndex: row, columnIndex: col })}
          </div>
        ) : (
          <div className="excelat-cell-content" title={formattedText}>
            {formattedText}
          </div>
        )}

        {/* Drag border zone when range is selected to allow moving range */}
        {hasBorderEdge && isSelected && !isEditing && selectionStyle === "excel" && (
          <div
            className="excelat-cell-border-drag-zone"
            title="Drag to move range"
            onMouseDown={(e) => {
              e.stopPropagation();
              onRangeBorderMouseDown?.(e);
            }}
          />
        )}

        {/* Fill handle in active cell or bottom-right corner of selection */}
        {selectionStyle === "excel" && isActive && !isEditing && (
          <div
            className="excelat-cell-handle"
            title="Drag to fill values"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onFillHandleMouseDown?.(e);
            }}
          />
        )}
      </td>
    );
  }
);

Cell.displayName = "Cell";
