# Excelat

> **Excel-like tables for modern web applications.**  
> Lightweight, lightning fast, and zero external grid dependencies.

[![npm version](https://img.shields.io/npm/v/@excelat/react.svg)](https://www.npmjs.com/package/@excelat/react)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![bundle size](https://img.shields.io/badge/bundle%20size-13.8%20kB%20gzipped-success.svg)](https://www.npmjs.com/package/@excelat/react)
[![tests](https://img.shields.io/badge/tests-49%20passing-brightgreen.svg)]()

Excelat delivers the rich spreadsheet interaction users expect — cell and range selection, keyboard navigation, copy/paste, inline editing, formula bar, drag-fill, range-moving, undo/redo, row/column resizing, and first-class virtualization — inside your React app **without forcing you to adopt an enormous, opinionated grid framework.**

```bash
npm install @excelat/react
```

```tsx
import { Excelat } from "@excelat/react";
import "@excelat/react/dist/style.css";

export function App() {
  const data = [
    ["Jay", 30, "Bangalore", 2200000],
    ["Rahul", 28, "Delhi", 1800000],
    ["Amit", 32, "Mumbai", 2500000],
  ];

  return <Excelat data={data} />;
}
```

---

## Table of Contents

- [Why Excelat?](#why-excelat)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Data Loading Modes](#data-loading-modes)
  - [1. Simple Local Data](#1-simple-local-data)
  - [2. Large Datasets with Virtualization](#2-large-datasets-with-virtualization)
  - [3. Controlled Server-Side Pagination](#3-controlled-server-side-pagination)
  - [4. Infinite / Incremental Loading](#4-infinite--incremental-loading)
- [Visual Modes & Styling](#visual-modes--styling)
  - [Spreadsheet Mode vs Normal Table Mode](#spreadsheet-mode-vs-normal-table-mode)
  - [Configurable Selection Styles](#configurable-selection-styles)
- [Formula Bar](#formula-bar)
- [Mutations & Persistence (`onOperation`)](#mutations--persistence-onoperation)
  - [Granular Operations Model](#granular-operations-model)
  - [Batch Operations](#batch-operations)
  - [Persistence Strategies (Immediate, Debounced, Batch, Optimistic)](#persistence-strategies)
- [Custom Cell Rendering & Column Types](#custom-cell-rendering--column-types)
- [Keyboard Navigation & Shortcuts](#keyboard-navigation--shortcuts)
- [Imperative Ref API](#imperative-ref-api)
- [Complete API Reference](#complete-api-reference)
- [Architecture & Philosophy](#architecture--philosophy)
- [License](#license)

---

## Why Excelat?

* **Zero External Grid Dependencies:** Built from the ground up for React and pure CSS. No AG Grid, no Handsontable, no heavy canvas layers.
* **Excellent Developer Experience (DX):** Sensible defaults for everything. Zero-config `<Excelat data={data} />` works right out of the box.
* **Infrastructure & Backend Agnostic:** Excelat **never** forces a backend or data-fetching model onto your app. You own your API queries (REST, GraphQL, Supabase, Firebase, WebSockets).
* **Smooth Virtualization:** Render 10,000+ rows and 100+ columns at 60 FPS while keeping selection, editing, fill-handle, and auto-scrolling 100% accurate.
* **Separation of Concerns:** Excelat owns grid presentation, interaction, selection, and history. Your application owns network requests, dirty states, and persistence.

---

## Installation

```bash
npm install @excelat/react
```

Import the stylesheet once in your application entry point (e.g., `main.tsx` or `App.tsx`):

```tsx
import "@excelat/react/dist/style.css";
```

---

## Quick Start

### Basic Spreadsheet

```tsx
import { useState } from "react";
import { Excelat, ExcelatData } from "@excelat/react";
import "@excelat/react/dist/style.css";

const INITIAL_DATA: ExcelatData = [
  ["Product", "Category", "Stock", "Price"],
  ["Laptop Pro", "Electronics", 45, 1299],
  ["Wireless Mouse", "Accessories", 120, 49],
  ["Mechanical Keyboard", "Accessories", 80, 119],
];

export default function Demo() {
  const [data, setData] = useState<ExcelatData>(INITIAL_DATA);

  return (
    <div style={{ height: "400px" }}>
      <Excelat
        data={data}
        onChange={setData}
        showFormulaBar={true}
      />
    </div>
  );
}
```

---

## Data Loading Modes

Excelat accommodates all modern data loading patterns without complicating the basic API:

### 1. Simple Local Data
For standard forms, admin tables, or settings pages:

```tsx
<Excelat data={data} onChange={setData} />
```

---

### 2. Large Datasets with Virtualization
Turn on first-class window virtualization for tens of thousands of rows:

```tsx
<Excelat
  data={largeData} // e.g. 10,000+ rows
  virtualization
/>
```

You can optionally configure overscan buffers:

```tsx
<Excelat
  data={largeData}
  virtualization={{
    rowOverscan: 12,
    colOverscan: 4,
  }}
/>
```

> **Interaction Guarantee:** Virtualization in Excelat never sacrifices correctness. Keyboard navigation automatically calculates target cell coordinates mathematically and scrolls the active cell into view, even if it is not currently rendered in the DOM.

---

### 3. Controlled Server-Side Pagination
For datasets backed by remote databases where data is loaded in pages.

**Excelat does NOT fetch data itself.** The application owns the query, loading state, and error handling. Excelat only displays the current page and informs you when the user changes pages:

```tsx
import { useState, useEffect } from "react";
import { Excelat, ExcelatData } from "@excelat/react";

export function PaginatedGrid() {
  const [rows, setRows] = useState<ExcelatData>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 50;
  const totalRows = 10000;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/records?page=${page}&limit=${pageSize}`);
        const data = await response.json();
        setRows(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page]);

  return (
    <Excelat
      data={rows}
      pagination={{
        page,
        pageSize,
        total: totalRows,
      }}
      loading={loading}
      onPageChange={(nextPage) => setPage(nextPage)}
    />
  );
}
```

* **Automatic Row Offset:** Row numbers automatically reflect the active page (e.g. Page 2 displays rows `51, 52, 53...`).
* **Built-in Accessible Controls:** First, Previous, Page X of Y, Next, and Last buttons with disabled states and loading indicators.

---

### 4. Infinite / Incremental Loading
For large datasets loaded dynamically as the user scrolls:

```tsx
import { useState } from "react";
import { Excelat, ExcelatData } from "@excelat/react";

export function InfiniteGrid() {
  const [rows, setRows] = useState<ExcelatData>(initialBatch);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextBatch = await fetchNextRecords(rows.length);
      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setRows((prev) => [...prev, ...nextBatch]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Excelat
      data={rows}
      virtualization
      hasMore={hasMore}
      loading={loading}
      onLoadMore={handleLoadMore}
    />
  );
}
```

* Detects when the user scrolls near the end of the loaded dataset.
* Prevents duplicate requests while `loading === true`.
* Preserves active cell coordinates and selections as new rows are appended.

---

## Visual Modes & Styling

### Spreadsheet Mode vs Normal Table Mode

Excelat supports two distinct visual modes via the `mode` prop:

```tsx
// Spreadsheet Mode (Default): Excel-like interface with row numbers and column letters
<Excelat data={data} mode="spreadsheet" />

// Table Mode: Looks like a clean application table, retaining full spreadsheet interactions underneath
<Excelat
  data={data}
  mode="table"
  columns={[
    { header: "Name", width: 140 },
    { header: "Age", width: 80 },
    { header: "City", width: 160 },
  ]}
/>
```

You can toggle individual UI chrome elements regardless of mode:

```tsx
<Excelat
  data={data}
  mode="table"
  showRowNumbers={false}
  showColumnLetters={true}
  showFormulaBar={false}
/>
```

---

### Configurable Selection Styles

Control the visual treatment of the active cell and selected ranges using `selectionStyle`:

```tsx
<Excelat
  data={data}
  selectionStyle="excel"   // Thick green Excel border with drag-fill handle
  // selectionStyle="subtle" // Clean blue boundary for web application tables
  // selectionStyle="none"   // Visual focus hidden; full keyboard/selection state works internally
/>
```

---

## Formula Bar

Excelat includes an optional, fully synchronized formula bar:

```tsx
<Excelat data={data} showFormulaBar={true} />
```

* **Unified Mutation Pipeline:** Edits made in the formula bar flow through the exact same parsing, validation, `onChange`, `onOperation`, and undo/redo pipeline as in-cell editing.
* **Bidirectional Sync:** Shows active cell coordinate (e.g. `B4`) and current value.
* <kbd>Enter</kbd> commits the edit and moves focus downward; <kbd>Escape</kbd> cancels.

---

## Mutations & Persistence (`onOperation`)

Excelat cleanly separates local grid state from backend synchronization. The grid owns interactions (cursor, selection, editing, resizing, undo stack), while your app owns persistence.

Use the `onOperation` callback to listen for granular developer-level mutations:

```tsx
<Excelat
  data={data}
  onOperation={(op) => {
    console.log("Grid operation emitted:", op);
  }}
/>
```

### Granular Operations Model

Excelat emits strongly-typed `ExcelatOperation` events:

```ts
export type ExcelatOperation =
  | {
      type: "cell.update";
      row: number;
      column: number;
      value: CellValue;
      previousValue?: CellValue;
    }
  | {
      type: "range.update";
      range: CellRange;
      values: CellValue[][];
      previousValues?: CellValue[][];
    }
  | {
      type: "range.clear";
      range: CellRange;
      previousValues?: CellValue[][];
    }
  | {
      type: "range.paste";
      range: CellRange;
      values: CellValue[][];
    }
  | {
      type: "range.cut";
      source: CellRange;
      destination: CellRange;
    }
  | {
      type: "range.fill";
      source: CellRange;
      destination: CellRange;
    }
  | {
      type: "range.move";
      source: CellRange;
      destination: CellRange;
      values?: CellValue[][];
    }
  | {
      type: "row.insert";
      index: number;
      values?: CellValue[];
    }
  | {
      type: "row.delete";
      index: number;
      deletedRow?: CellValue[];
    }
  | {
      type: "column.insert";
      index: number;
    }
  | {
      type: "column.delete";
      index: number;
    }
  | {
      type: "batch";
      operations: ExcelatOperation[];
    };
```

---

### Batch Operations

When a user performs a multi-cell action (e.g. pasting 1,000 cells, clearing a large range, extending a sequence with the fill handle, or moving a range), Excelat dispatches **one logical operation** and treats it as **one history action** for undo/redo.

---

### Persistence Strategies

Because Excelat does not bind you to a specific transport protocol or SDK, you can implement whatever persistence strategy suits your stack:

#### Strategy A: Immediate Save (Auto-Save on Edit)
```tsx
const handleOperation = async (op: ExcelatOperation) => {
  if (op.type === "cell.update") {
    await fetch(`/api/cells`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row: op.row, col: op.column, value: op.value }),
    });
  }
};
```

#### Strategy B: Debounced Save
```tsx
import debounce from "lodash.debounce";

const debouncedSave = useMemo(
  () =>
    debounce((allData) => {
      fetch("/api/sheet", {
        method: "PUT",
        body: JSON.stringify({ data: allData }),
      });
    }, 800),
  []
);

<Excelat data={data} onChange={(next) => { setData(next); debouncedSave(next); }} />
```

#### Strategy C: Batch Save / Manual "Save Changes" Button
```tsx
const pendingOps = useRef<ExcelatOperation[]>([]);

const handleOperation = (op: ExcelatOperation) => {
  pendingOps.current.push(op);
};

const handleSaveAll = async () => {
  await fetch("/api/batch-persist", {
    method: "POST",
    body: JSON.stringify({ operations: pendingOps.current }),
  });
  pendingOps.current = [];
};
```

#### Strategy D: Realtime WebSockets / Supabase / Firebase
```tsx
const handleOperation = (op: ExcelatOperation) => {
  socket.emit("grid:operation", { sheetId: "finance-2026", op });
};
```

---

## Custom Cell Rendering & Column Types

Customize cell formatting in table mode with `render` and enforce input parsing with `type`:

```tsx
import { Excelat, ExcelatColumn } from "@excelat/react";

const columns: ExcelatColumn[] = [
  {
    header: "Employee",
    width: 140,
    type: "text",
  },
  {
    header: "Age",
    width: 80,
    type: "number", // Automatically coerces numbers on edit
  },
  {
    header: "Salary",
    width: 120,
    type: "number",
    render: ({ value }) => (
      <span style={{ fontWeight: 600 }}>
        ${Number(value || 0).toLocaleString()}
      </span>
    ),
  },
  {
    header: "Status",
    width: 100,
    render: ({ value }) => (
      <span className={value === "Active" ? "badge-green" : "badge-gray"}>
        {String(value || "")}
      </span>
    ),
  },
];

<Excelat data={data} mode="table" columns={columns} />
```

---

## Keyboard Navigation & Shortcuts

Excelat supports complete standard spreadsheet navigation out of the box:

| Shortcut | Description |
| --- | --- |
| <kbd>Arrow Keys</kbd> | Move active cell selection (auto-scrolls viewport into view) |
| <kbd>Shift</kbd> + <kbd>Arrow Keys</kbd> | Expand or shrink rectangular range selection |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Move to next / previous column |
| <kbd>Enter</kbd> / <kbd>Shift</kbd> + <kbd>Enter</kbd> | Move to next / previous row |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to start / end of row |
| <kbd>Ctrl/Cmd</kbd> + <kbd>Home</kbd> / <kbd>End</kbd> | Jump to top-left / bottom-right cell of dataset |
| <kbd>Double Click</kbd> or <kbd>F2</kbd> | Enter cell edit mode with cursor at end |
| <kbd>Type any key</kbd> | Immediately replace cell value and enter edit mode |
| <kbd>Enter</kbd> (in editor) | Commit edit and move down |
| <kbd>Tab</kbd> (in editor) | Commit edit and move right |
| <kbd>Escape</kbd> (in editor) | Cancel editing without saving changes |
| <kbd>Ctrl/Cmd</kbd> + <kbd>C</kbd> | Copy selected range as standard TSV to system clipboard |
| <kbd>Ctrl/Cmd</kbd> + <kbd>X</kbd> | Cut selected range |
| <kbd>Ctrl/Cmd</kbd> + <kbd>V</kbd> | Paste TSV matrix into grid starting at active cell |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Clear contents of all cells in active range |
| <kbd>Ctrl/Cmd</kbd> + <kbd>Z</kbd> | Undo last operation |
| <kbd>Ctrl/Cmd</kbd> + <kbd>Y</kbd> / <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo operation |

---

## Imperative Ref API

Access imperative grid commands using `ref`:

```tsx
import { useRef } from "react";
import { Excelat, ExcelatRef } from "@excelat/react";

export function ControlledGrid() {
  const gridRef = useRef<ExcelatRef>(null);

  return (
    <>
      <div className="toolbar">
        <button onClick={() => gridRef.current?.undo()}>Undo</button>
        <button onClick={() => gridRef.current?.redo()}>Redo</button>
        <button onClick={() => gridRef.current?.insertRow(0, ["New", "Row"])}>
          Insert Top Row
        </button>
        <button onClick={() => gridRef.current?.deleteRow(0)}>Delete Top Row</button>
        <button onClick={() => gridRef.current?.copy()}>Copy Selection</button>
        <button onClick={() => gridRef.current?.focus()}>Focus Grid</button>
      </div>

      <Excelat ref={gridRef} data={data} />
    </>
  );
}
```

### `ExcelatRef` Interface

```ts
export interface ExcelatRef {
  insertRow: (index?: number, values?: CellValue[]) => void;
  deleteRow: (index?: number) => void;
  insertColumn: (index?: number, values?: CellValue[]) => void;
  deleteColumn: (index?: number) => void;
  undo: () => void;
  redo: () => void;
  copy: () => Promise<string | undefined>;
  cut: () => Promise<string | undefined>;
  paste: () => Promise<void>;
  focus: () => void;
}
```

---

## Complete API Reference

### `<Excelat />` Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `CellValue[][]` | `[]` | 2D matrix of cell values (`string \| number \| boolean \| null`). |
| `mode` | `"spreadsheet" \| "table"` | `"spreadsheet"` | Visual mode. In `"table"` mode, row numbers and column letters are hidden by default. |
| `columns` | `number \| ExcelatColumn[]` | `26` | Total number of columns or array of custom column definitions. |
| `rows` | `number` | `100` | Fallback number of rows to render if `data` is empty. |
| `virtualization` | `boolean \| VirtualizationConfig` | `false` | Enables row and column virtualization for large datasets. |
| `pagination` | `PaginationConfig` | `undefined` | Controlled pagination settings `{ page, pageSize, total }`. |
| `loading` | `boolean` | `false` | Displays a subtle loading banner during pagination or infinite fetching. |
| `onPageChange` | `(nextPage: number) => void` | `undefined` | Callback fired when the user navigates between pages. |
| `hasMore` | `boolean` | `undefined` | Used with infinite loading to signal more records are available. |
| `onLoadMore` | `() => void` | `undefined` | Callback fired when scrolling near the bottom of loaded rows. |
| `onOperation` | `(op: ExcelatOperation) => void` | `undefined` | Callback for granular developer mutations to connect persistence. |
| `onChange` | `(nextData: ExcelatData) => void` | `undefined` | Callback invoked whenever the full grid dataset changes. |
| `onSelectionChange` | `(range: CellRange) => void` | `undefined` | Callback invoked when the active cell or selection range changes. |
| `onContextMenu` | `(e, ctx) => void` | `undefined` | Callback fired on cell right-click with row, column, and range context. |
| `selectionStyle` | `"excel" \| "subtle" \| "none"` | `"excel"` (`"subtle"` in table mode) | Visual highlight style for selection. |
| `showRowNumbers` | `boolean` | `true` (`false` in table mode) | Toggle display of row number header. |
| `showColumnLetters` | `boolean` | `true` (`false` in table mode) | Toggle display of column letters (A, B, C...). |
| `showFormulaBar` | `boolean` | `false` | Toggle display of formula bar above grid. |
| `onColumnResize` | `(colIndex, width) => void` | `undefined` | Callback fired when a column is manually resized. |
| `onRowResize` | `(rowIndex, height) => void` | `undefined` | Callback fired when a row is manually resized. |
| `readOnly` | `boolean` | `false` | Disables editing, cut, paste, delete, and structural mutations. |
| `className` | `string` | `""` | Optional CSS class name on root container. |
| `style` | `React.CSSProperties` | `undefined` | Optional inline styles on root container. |

---

## Architecture & Philosophy

```text
Excelat
│
├── VirtualizationEngine  # Dynamic viewport calculation & spacer rows/cells
├── Grid                  # Pure semantic HTML table layout with sticky headers
├── Cell & RowHeader      # Lightweight memoized cells with direct event delegation
├── FormulaBar            # Two-way synchronized editing surface
├── SelectionController   # Coordinate normalization (anchor, range, drag)
├── EditingController     # In-place input lifecycle, movement & type coercion
├── ClipboardController   # Standard TSV matrix copy, cut & paste parser
└── HistoryManager        # Atomic GridOperation stack & public ExcelatOperation dispatcher
```

1. **DX First:** `<Excelat data={data} />` requires zero setup. Opt into advanced capabilities (`virtualization`, `pagination`, `onOperation`) only when you need them.
2. **Framework Freedom:** Excelat never assumes what backend or transport protocol you use.
3. **No Heavy Dependencies:** No canvas black-boxes. Fully accessible HTML tables that respect standard browser CSS styling, printing, and accessibility tools.

---

## Contributing & Development

```bash
# 1. Clone repository
git clone https://github.com/your-username/excelat.git
cd excelat

# 2. Install dependencies
npm install

# 3. Run all tests
npm test

# 4. Start interactive demo
npm run dev

# 5. Build packages for production
npm run build
```

---

## License

MIT © [Excelat](LICENSE)
