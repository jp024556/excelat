import { CellValue, ExcelatColumn } from "./types";
import { resolveColumnIndex } from "./sorting";

export interface GroupHeaderItem {
  type: "group";
  groupKey: string;
  column: string | number;
  columnHeader?: string;
  value: CellValue;
  count: number;
  depth: number;
  isExpanded: boolean;
}

export interface DataRowItem {
  type: "data";
  dataRowIndex: number;
  row: CellValue[];
  depth: number;
}

export type GridDisplayRow = GroupHeaderItem | DataRowItem;

/**
 * Builds display rows containing group headers and data rows according to group columns and expansion state.
 */
export function buildGroupedDisplayRows(
  rows: { row: CellValue[]; index: number }[],
  groupColumns: (string | number)[],
  expandedState: Record<string, boolean> = {},
  defaultExpanded = true,
  columns?: ExcelatColumn[]
): GridDisplayRow[] {
  if (!groupColumns || groupColumns.length === 0) {
    return rows.map((item) => ({
      type: "data",
      dataRowIndex: item.index,
      row: item.row,
      depth: 0,
    }));
  }

  function groupRecursive(
    currentRows: { row: CellValue[]; index: number }[],
    colIndexInGroup: number,
    parentKey: string,
    depth: number
  ): GridDisplayRow[] {
    if (colIndexInGroup >= groupColumns.length || currentRows.length === 0) {
      return currentRows.map((item) => ({
        type: "data",
        dataRowIndex: item.index,
        row: item.row,
        depth,
      }));
    }

    const groupColId = groupColumns[colIndexInGroup];
    const actualColIdx = resolveColumnIndex(groupColId, columns);
    const colDef = actualColIdx !== -1 && columns ? columns[actualColIdx] : undefined;
    const headerTitle = colDef?.header ?? colDef?.label ?? `Col ${groupColId}`;

    // Bucket rows by the value in actualColIdx
    const buckets = new Map<string, { value: CellValue; rows: { row: CellValue[]; index: number }[] }>();

    for (const item of currentRows) {
      const val = actualColIdx !== -1 ? item.row[actualColIdx] : null;
      const strVal = val === null || val === undefined ? "(Empty)" : String(val);

      if (!buckets.has(strVal)) {
        buckets.set(strVal, { value: val, rows: [] });
      }
      buckets.get(strVal)!.rows.push(item);
    }

    const result: GridDisplayRow[] = [];

    buckets.forEach((bucket, strVal) => {
      const groupKey = parentKey ? `${parentKey}::${strVal}` : strVal;
      const isExpanded =
        expandedState[groupKey] !== undefined
          ? !!expandedState[groupKey]
          : defaultExpanded;

      result.push({
        type: "group",
        groupKey,
        column: groupColId,
        columnHeader: headerTitle,
        value: bucket.value,
        count: bucket.rows.length,
        depth,
        isExpanded,
      });

      if (isExpanded) {
        const children = groupRecursive(
          bucket.rows,
          colIndexInGroup + 1,
          groupKey,
          depth + 1
        );
        result.push(...children);
      }
    });

    return result;
  }

  return groupRecursive(rows, 0, "", 0);
}
