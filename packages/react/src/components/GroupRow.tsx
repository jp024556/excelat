import React from "react";
import { GroupHeaderItem } from "../model/grouping";

export interface GroupRowProps {
  item: GroupHeaderItem;
  rowIndex: number;
  totalColsSpan: number;
  isSelected?: boolean;
  onToggle: (groupKey: string) => void;
}

export const GroupRow: React.FC<GroupRowProps> = React.memo(
  ({ item, rowIndex, totalColsSpan, isSelected, onToggle }) => {
    const { groupKey, columnHeader, value, count, depth, isExpanded } = item;

    return (
      <tr
        className={`excelat-row excelat-group-row ${isSelected ? "excelat-group-selected" : ""}`}
        role="row"
        aria-expanded={isExpanded}
        data-row={rowIndex}
      >
        <td
          colSpan={totalColsSpan}
          className="excelat-group-cell"
          style={{ paddingLeft: `${depth * 20 + 10}px` }}
          onClick={() => onToggle(groupKey)}
        >
          <button
            type="button"
            className="excelat-group-toggle"
            aria-label={isExpanded ? "Collapse group" : "Expand group"}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
          <span className="excelat-group-title">
            <span className="excelat-group-col-label">{columnHeader}:</span>{" "}
            <strong>{value === null || value === undefined ? "(Empty)" : String(value)}</strong>
          </span>
          <span className="excelat-group-count">({count})</span>
        </td>
      </tr>
    );
  }
);

GroupRow.displayName = "GroupRow";
