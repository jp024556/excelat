# Excelat

Excel-like tables for modern web apps.

```bash
npm install @excelat/react
```

```tsx
import { Excelat } from "@excelat/react";
import "@excelat/react/dist/style.css";

function App() {
  return (
    <Excelat
      data={[
        ["Jay", 30, "Bangalore"],
        ["Rahul", 28, "Delhi"],
      ]}
    />
  );
}
```

---

## 1. Installation

Install the package via npm:

```bash
npm install @excelat/react
```

Import the styles in your application:

```tsx
import "@excelat/react/dist/style.css";
```

---

## 2. Quick start

### Spreadsheet Mode (Default)

Excel-like interface with row numbers, column letters, and Excel-style focus:

```tsx
import { Excelat } from "@excelat/react";
import "@excelat/react/dist/style.css";

const data = [
  ["Name", "Age", "City", "Salary"],
  ["Jay", 30, "Bangalore", 2200000],
  ["Rahul", 28, "Delhi", 1800000],
  ["Amit", 32, "Mumbai", 2500000],
];

export default function Demo() {
  return (
    <Excelat
      data={data}
      rows={100}
      columns={20}
    />
  );
}
```

### Table Mode (Application Table)

Visually looks like a normal application table while retaining full spreadsheet interactions (keyboard navigation, range selection, inline editing, copy/paste, undo/redo):

```tsx
import { Excelat } from "@excelat/react";
import "@excelat/react/dist/style.css";

const data = [
  ["Jay", 30, "Bangalore"],
  ["Rahul", 28, "Delhi"],
];

export default function TableDemo() {
  return (
    <Excelat
      data={data}
      mode="table"
      columns={[
        { header: "Name", width: 120 },
        { header: "Age", width: 80 },
        { header: "City", width: 140 },
      ]}
    />
  );
}
```

---

## 3. Features

* **Visual Modes**: Choose between `"spreadsheet"` (Excel-like UI) and `"table"` (clean web application table).
* **Formula Bar as Real Editing Surface**: Bidirectional synchronization with the active cell. Enter commits, Escape cancels, type parsing is preserved, and undo/redo works consistently.
* **Fill Handle**: Drag the bottom-right fill handle to copy repeating values or extend numeric sequences downward and rightward.
* **Drag Selected Range**: Drag the border of any selected range to move it to a new location with undo support.
* **Structural Operations**: Insert and delete rows and columns programmatically via imperative ref or context menu, complete with undo/redo.
* **Custom Cell Rendering**: Clean and simple `render: ({ value, rowIndex, columnIndex }) => ReactNode` for application tables (status pills, badges, formatting).
* **Basic Column Types**: Optional `type: "text" | "number" | "boolean"` for predictable input parsing.
* **Configurable Selection**: Choose between `"excel"` (prominent green border & fill handle), `"subtle"` (minimal blue border), and `"none"`.
* **Column & Row Resizing**: Drag column and row header boundaries to resize; double-click column boundary to auto-fit.
* **Cell Selection & Range Selection**: Mouse drag selection, Shift + Arrow selection, and full row/column header clicks.
* **Auto-Scrolling Navigation**: Active cell automatically scrolls into view during Arrow, Tab, and Enter navigation without moving the outer page.
* **Inline Cell Editing**: Double-click or type directly to replace value. Enter/Tab commits, Escape cancels.
* **Row & Column Clipboard**: Copy and paste individual cells, rectangular ranges, entire rows, or entire columns using standard TSV format.
* **Context Menu Integration**: `onContextMenu` callback allows consumers to attach their own context menus or action sheets.
* **Undo / Redo**: Multi-step history stack powered by an atomic operation model (`Ctrl+Z`, `Ctrl+Y`).
* **Fast & Lightweight**: Zero external grid dependencies. Built from scratch with React and pure vanilla CSS.

---

## 4. Keyboard shortcuts

| Key Combination | Action |
| --- | --- |
| `Arrow Keys` | Move active cell (auto-scrolls into view) |
| `Shift + Arrow` | Expand rectangular range selection |
| `Tab` / `Shift + Tab` | Move to next / previous column |
| `Enter` / `Shift + Enter` | Move to next / previous row |
| `Home` / `End` | Jump to start / end of row |
| `Ctrl/Cmd + Home` / `End` | Jump to top-left / bottom-right of grid |
| `Double Click` or `F2` | Enter cell edit mode |
| `Type any character` | Start editing and replace existing cell value |
| `Enter` (while editing) | Commit change and move down |
| `Tab` (while editing) | Commit change and move right |
| `Escape` (while editing) | Cancel editing without saving |
| `Ctrl/Cmd + C` | Copy selected range / rows / columns as TSV |
| `Ctrl/Cmd + X` | Cut selected range / rows / columns |
| `Ctrl/Cmd + V` | Paste matrix starting at active cell |
| `Ctrl/Cmd + Z` | Undo last operation |
| `Ctrl/Cmd + Y` / `Shift+Z` | Redo operation |
| `Delete` / `Backspace` | Clear values in selected range |

---

## 5. Controlled usage & Imperative Ref

You can manage data with `onChange` and access imperative grid methods using `ref`:

```tsx
import { useState, useRef } from "react";
import { Excelat, ExcelatData, ExcelatRef } from "@excelat/react";

function ControlledSheet() {
  const gridRef = useRef<ExcelatRef>(null);
  const [data, setData] = useState<ExcelatData>([
    ["Jay", 30, "Bangalore"],
    ["Rahul", 28, "Delhi"],
  ]);

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => gridRef.current?.undo()}>Undo</button>
        <button onClick={() => gridRef.current?.redo()}>Redo</button>
        <button onClick={() => gridRef.current?.insertRow()}>Insert Row</button>
        <button onClick={() => gridRef.current?.deleteRow()}>Delete Row</button>
      </div>

      <Excelat
        ref={gridRef}
        data={data}
        onChange={setData}
        onSelectionChange={(selection) => {
          console.log("Selected range:", selection);
        }}
        onContextMenu={(e, { rowIndex, columnIndex, selection }) => {
          console.log("Right clicked cell:", rowIndex, columnIndex, selection);
        }}
      />
    </div>
  );
}
```

---

## 6. Custom Cell Rendering & Column Types

Customize how cells appear in application tables without taking over grid navigation or editing:

```tsx
<Excelat
  mode="table"
  data={data}
  columns={[
    { header: "Name", type: "text", width: 140 },
    { header: "Age", type: "number", width: 80 },
    {
      header: "Status",
      type: "boolean",
      width: 100,
      render: ({ value }) => (
        <span className={value ? "badge-active" : "badge-inactive"}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ]}
/>
```

---

## 7. API Reference

### `<Excelat />` Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `CellValue[][]` | `[]` | 2D matrix of cell values (`string \| number \| boolean \| null`). |
| `mode` | `"spreadsheet" \| "table"` | `"spreadsheet"` | Visual mode. In `"table"` mode, row numbers and column letters are hidden by default. |
| `columns` | `number \| ExcelatColumn[]` | `26` | Number of columns or array of column definitions. |
| `rows` | `number` | `100` | Initial number of rows to render. |
| `selectionStyle` | `"excel" \| "subtle" \| "none"` | `"excel"` (or `"subtle"` in table mode) | Visual treatment for active and selected cells. |
| `showRowNumbers` | `boolean` | `true` (false in table mode) | Whether to display row numbers (1, 2, 3...). |
| `showColumnLetters` | `boolean` | `true` (false in table mode) | Whether to display column letters (A, B, C...). |
| `showFormulaBar` | `boolean` | `false` | Whether to display the interactive formula bar. |
| `onChange` | `(nextData: ExcelatData) => void` | `undefined` | Callback invoked when data changes. |
| `onSelectionChange` | `(selection: CellRange) => void` | `undefined` | Callback invoked when selected range changes. |
| `onContextMenu` | `(e: MouseEvent, ctx: ContextMenuContext) => void` | `undefined` | Callback for context menu integration. |
| `onColumnResize` | `(colIndex: number, width: number) => void` | `undefined` | Callback invoked when a column is resized. |
| `onRowResize` | `(rowIndex: number, height: number) => void` | `undefined` | Callback invoked when a row is resized. |
| `readOnly` | `boolean` | `false` | When true, disables editing, cut, paste, and deletion. |
| `className` | `string` | `""` | Optional CSS class name for root container. |
| `style` | `React.CSSProperties` | `undefined` | Optional inline styles for root container. |

### `ExcelatRef` Imperative Handle

```ts
export interface ExcelatRef {
  insertRow: (index?: number) => void;
  deleteRow: (index?: number) => void;
  insertColumn: (index?: number) => void;
  deleteColumn: (index?: number) => void;
  undo: () => void;
  redo: () => void;
  copy: () => Promise<string | undefined>;
  cut: () => Promise<string | undefined>;
  paste: (text?: string) => Promise<void>;
  focus: () => void;
}
```

### Types

```ts
export type CellValue = string | number | boolean | null;
export type ExcelatData = CellValue[][];
export type ExcelatMode = "table" | "spreadsheet";
export type SelectionStyle = "excel" | "subtle" | "none";
export type ColumnType = "text" | "number" | "boolean";

export interface CellRenderContext {
  value: CellValue;
  rowIndex: number;
  columnIndex: number;
}

export interface ExcelatColumn {
  header?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  type?: ColumnType;
  render?: (context: CellRenderContext) => React.ReactNode;
}

export interface CellRange {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
}

export interface ContextMenuContext {
  rowIndex: number;
  columnIndex: number;
  selection: CellRange;
}
```

---

## 7. Architecture

Excelat separates concerns cleanly:

```text
Excelat
│
├── Grid                # Table layout, sticky headers, viewport, mode styles
├── Cell                # Memoized cell display, selection styles, alignment
├── RowHeader           # Row numbers, selection highlight, row resizing
├── ColumnHeader        # Column headers/letters, selection highlight, col resizing
├── FormulaBar          # Optional formula bar with active coordinate & value input
├── Selection           # Normalized rectangular range state (anchor & focus)
├── Editing             # CellEditor input lifecycle and commit navigation
├── Keyboard            # Keyboard shortcuts and spreadsheet navigation
├── Clipboard          # TSV serialization, deserialization, clipboard API
└── History             # Operation stack (undo/redo) with structural sharing
```

---

## 8. Roadmap

```text
V0.1
✓ Excel-like grid
✓ Optional Excel UI (Table mode vs Spreadsheet mode)
✓ Configurable selection UI (Excel, Subtle, None)
✓ Column and row resizing
✓ Normal table headers
✓ Cell editing
✓ Keyboard navigation
✓ Range selection
✓ Clipboard
✓ Undo/redo

Future
□ Virtualization
□ Formatting
□ Formulas
□ Sorting/filtering
□ Frozen rows/columns
□ CSV
□ XLSX
□ Collaboration
□ BYO collaboration backend
```

---

## 9. Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Start demo: `npm run dev`
5. Build packages: `npm run build`

---

## License

MIT
