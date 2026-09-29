import { CellValue, ExcelatColumn, ExcelatColumnType, SortDirection, SortRule } from "./types";

/**
 * Resolves a column identifier (string key/header or numeric index) to a numeric column index.
 */
export function resolveColumnIndex(
  colId: string | number,
  columns?: ExcelatColumn[]
): number {
  if (typeof colId === "number") return colId;
  if (!columns) return -1;

  // Try matching by key first, then by header
  const byKey = columns.findIndex((c) => c.key === colId);
  if (byKey !== -1) return byKey;

  const byHeader = columns.findIndex(
    (c) => c.header && c.header.toLowerCase() === colId.toLowerCase()
  );
  if (byHeader !== -1) return byHeader;

  // Try parsing string as index
  const num = parseInt(colId, 10);
  return isNaN(num) ? -1 : num;
}

/**
 * Compares two cell values with respect to column data type and sort direction.
 * Null/undefined values are consistently sorted to the end.
 */
export function compareCellValues(
  a: CellValue,
  b: CellValue,
  type: ExcelatColumnType = "text",
  direction: SortDirection = "asc"
): number {
  const mult = direction === "desc" ? -1 : 1;

  // Handle null / undefined / empty
  const isANull = a === null || a === undefined || a === "";
  const isBNull = b === null || b === undefined || b === "";

  if (isANull && isBNull) return 0;
  if (isANull) return 1; // Nulls always at bottom
  if (isBNull) return -1;

  if (type === "number") {
    const numA = typeof a === "number" ? a : parseFloat(String(a));
    const numB = typeof b === "number" ? b : parseFloat(String(b));
    if (!isNaN(numA) && !isNaN(numB)) {
      return (numA - numB) * mult;
    }
  }

  if (type === "boolean") {
    const boolA = a === true || String(a).toLowerCase() === "true" ? 1 : 0;
    const boolB = b === true || String(b).toLowerCase() === "true" ? 1 : 0;
    return (boolA - boolB) * mult;
  }

  if (type === "date") {
    const dateA = new Date(String(a)).getTime();
    const dateB = new Date(String(b)).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return (dateA - dateB) * mult;
    }
  }

  // Fallback to text string comparison
  return (
    String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    }) * mult
  );
}

/**
 * Sorts indexed rows using the provided sorting rules.
 * Preserves the original row index so mutations can target the underlying data.
 */
export function sortIndexedRows<T extends { row: CellValue[]; index: number }>(
  items: T[],
  rules: SortRule[],
  columns?: ExcelatColumn[]
): T[] {
  if (!rules || rules.length === 0) return items;

  return [...items].sort((a, b) => {
    for (const rule of rules) {
      const colIdx = resolveColumnIndex(rule.column, columns);
      if (colIdx === -1) continue;

      const colType = columns?.[colIdx]?.type || "text";
      const valA = a.row[colIdx];
      const valB = b.row[colIdx];

      const cmp = compareCellValues(valA, valB, colType, rule.direction);
      if (cmp !== 0) return cmp;
    }
    // Stable tie-breaker: keep original relative order
    return a.index - b.index;
  });
}

/**
 * Cycles the sort state of a column: Unsorted -> Asc -> Desc -> Unsorted.
 * If multiColumn is false or not requested, replaces existing sort with single-column sort.
 */
export function cycleSortRule(
  currentRules: SortRule[] = [],
  colId: string | number,
  multiColumn = false,
  columns?: ExcelatColumn[]
): SortRule[] {
  const targetColIdx = resolveColumnIndex(colId, columns);
  const resolvedKey =
    targetColIdx !== -1 && columns?.[targetColIdx]?.key
      ? columns[targetColIdx].key!
      : colId;

  const existingIndex = currentRules.findIndex(
    (r) =>
      String(r.column) === String(colId) ||
      (targetColIdx !== -1 && resolveColumnIndex(r.column, columns) === targetColIdx)
  );

  if (existingIndex === -1) {
    const newRule: SortRule = { column: resolvedKey, direction: "asc" };
    return multiColumn ? [...currentRules, newRule] : [newRule];
  }

  const existing = currentRules[existingIndex];
  if (existing.direction === "asc") {
    const updated: SortRule = { column: resolvedKey, direction: "desc" };
    if (multiColumn) {
      const next = [...currentRules];
      next[existingIndex] = updated;
      return next;
    }
    return [updated];
  }

  // Was "desc" -> cycle back to unsorted (remove rule)
  if (multiColumn) {
    return currentRules.filter((_, idx) => idx !== existingIndex);
  }
  return [];
}
