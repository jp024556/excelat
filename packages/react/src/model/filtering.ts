import { CellValue, ExcelatColumn, Filter, FilterOperator } from "./types";
import { resolveColumnIndex } from "./sorting";

/**
 * Evaluates whether a cell value matches an operator and filter value.
 */
export function evaluateFilterCondition(
  cellVal: CellValue,
  operator: FilterOperator | string,
  filterVal: unknown
): boolean {
  const isCellEmpty =
    cellVal === null ||
    cellVal === undefined ||
    (typeof cellVal === "string" && cellVal.trim() === "");

  if (operator === "isEmpty") return isCellEmpty;
  if (operator === "isNotEmpty") return !isCellEmpty;

  if (isCellEmpty) {
    // Other operators do not match empty values unless filterVal is also empty
    return filterVal === null || filterVal === undefined || filterVal === "";
  }

  const strCell = String(cellVal).toLowerCase();
  const strFilter = String(filterVal ?? "").toLowerCase();

  switch (operator) {
    case "contains":
      return strCell.includes(strFilter);
    case "notContains":
      return !strCell.includes(strFilter);
    case "startsWith":
      return strCell.startsWith(strFilter);
    case "endsWith":
      return strCell.endsWith(strFilter);
    case "equals": {
      if (typeof cellVal === "number" && filterVal !== "" && filterVal !== null && filterVal !== undefined) {
        return cellVal === Number(filterVal);
      }
      if (typeof cellVal === "boolean") {
        return cellVal === (String(filterVal).toLowerCase() === "true");
      }
      return strCell === strFilter;
    }
    case "notEquals": {
      if (typeof cellVal === "number" && filterVal !== "" && filterVal !== null && filterVal !== undefined) {
        return cellVal !== Number(filterVal);
      }
      if (typeof cellVal === "boolean") {
        return cellVal !== (String(filterVal).toLowerCase() === "true");
      }
      return strCell !== strFilter;
    }
    case "gt": {
      const numCell = typeof cellVal === "number" ? cellVal : parseFloat(String(cellVal));
      const numFilter = typeof filterVal === "number" ? filterVal : parseFloat(String(filterVal));
      if (!isNaN(numCell) && !isNaN(numFilter)) return numCell > numFilter;

      // Date comparison
      const dateCell = new Date(String(cellVal)).getTime();
      const dateFilter = new Date(String(filterVal)).getTime();
      if (!isNaN(dateCell) && !isNaN(dateFilter)) return dateCell > dateFilter;

      return strCell > strFilter;
    }
    case "gte": {
      const numCell = typeof cellVal === "number" ? cellVal : parseFloat(String(cellVal));
      const numFilter = typeof filterVal === "number" ? filterVal : parseFloat(String(filterVal));
      if (!isNaN(numCell) && !isNaN(numFilter)) return numCell >= numFilter;

      const dateCell = new Date(String(cellVal)).getTime();
      const dateFilter = new Date(String(filterVal)).getTime();
      if (!isNaN(dateCell) && !isNaN(dateFilter)) return dateCell >= dateFilter;

      return strCell >= strFilter;
    }
    case "lt": {
      const numCell = typeof cellVal === "number" ? cellVal : parseFloat(String(cellVal));
      const numFilter = typeof filterVal === "number" ? filterVal : parseFloat(String(filterVal));
      if (!isNaN(numCell) && !isNaN(numFilter)) return numCell < numFilter;

      const dateCell = new Date(String(cellVal)).getTime();
      const dateFilter = new Date(String(filterVal)).getTime();
      if (!isNaN(dateCell) && !isNaN(dateFilter)) return dateCell < dateFilter;

      return strCell < strFilter;
    }
    case "lte": {
      const numCell = typeof cellVal === "number" ? cellVal : parseFloat(String(cellVal));
      const numFilter = typeof filterVal === "number" ? filterVal : parseFloat(String(filterVal));
      if (!isNaN(numCell) && !isNaN(numFilter)) return numCell <= numFilter;

      const dateCell = new Date(String(cellVal)).getTime();
      const dateFilter = new Date(String(filterVal)).getTime();
      if (!isNaN(dateCell) && !isNaN(dateFilter)) return dateCell <= dateFilter;

      return strCell <= strFilter;
    }
    default:
      return true;
  }
}

/**
 * Filters indexed rows based on active filter rules.
 */
export function filterIndexedRows<T extends { row: CellValue[]; index: number }>(
  items: T[],
  filters: Filter[],
  columns?: ExcelatColumn[]
): T[] {
  if (!filters || filters.length === 0) return items;

  return items.filter((item) => {
    // All filters must match (AND semantics)
    return filters.every((filter) => {
      const colIdx = resolveColumnIndex(filter.column, columns);
      if (colIdx === -1) return true;

      const cellVal = item.row[colIdx];
      return evaluateFilterCondition(cellVal, filter.operator, filter.value);
    });
  });
}
