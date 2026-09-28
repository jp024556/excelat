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

Excelat works out of the box with minimal configuration:

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

---

## 3. Features

* **Excel-like Interaction**: Native spreadsheet feeling, not just an HTML table.
* **Cell Selection & Range Selection**: Mouse drag selection and Shift + Arrow selection.
* **Inline Cell Editing**: Double-click or type directly to replace value.
* **Clipboard Support**: Copy, Cut, Paste using standard Tab-Separated Values (TSV) compatible with Excel & Google Sheets.
* **Undo / Redo**: Multi-step history stack powered by an operation model.
* **Fast & Lightweight**: Zero external grid dependencies. Memoized cell rendering.
* **Extensible Architecture**: Operation-based model designed for future collaboration, formulas, and virtualization.

---

## 4. Keyboard shortcuts

| Key Combination | Action |
| --- | --- |
| `Arrow Keys` | Move active cell (Up, Down, Left, Right) |
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
| `Ctrl/Cmd + C` | Copy selected range as TSV |
| `Ctrl/Cmd + X` | Cut selected range |
| `Ctrl/Cmd + V` | Paste matrix starting at active cell |
| `Ctrl/Cmd + Z` | Undo last operation |
| `Ctrl/Cmd + Y` / `Shift+Z` | Redo operation |
| `Delete` / `Backspace` | Clear values in selected range |

---

## 5. Controlled usage

You can manage the grid state in your own React component:

```tsx
import { useState } from "react";
import { Excelat, ExcelatData } from "@excelat/react";

function ControlledSheet() {
  const [data, setData] = useState<ExcelatData>([
    ["Jay", 30, "Bangalore"],
    ["Rahul", 28, "Delhi"],
  ]);

  return (
    <Excelat
      data={data}
      onChange={(nextData) => {
        setData(nextData);
      }}
      onSelectionChange={(selection) => {
        console.log("Selected range:", selection);
      }}
    />
  );
}
```

---

## 6. API

### `<Excelat />` Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `CellValue[][]` | `[]` | 2D matrix of cell values (`string \| number \| boolean \| null`). |
| `rows` | `number` | `100` | Initial number of rows to render. |
| `columns` | `number` | `26` | Initial number of columns to render (A–Z). |
| `onChange` | `(nextData: ExcelatData) => void` | `undefined` | Callback invoked when data changes. |
| `onSelectionChange` | `(selection: CellRange) => void` | `undefined` | Callback invoked when selected range changes. |
| `readOnly` | `boolean` | `false` | When true, disables editing, cut, paste, and deletion. |
| `className` | `string` | `""` | Optional CSS class name for root container. |
| `style` | `React.CSSProperties` | `undefined` | Optional inline styles for root container. |

### Types

```ts
export type CellValue = string | number | boolean | null;
export type ExcelatData = CellValue[][];

export interface CellRange {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
}
```

---

## 7. Architecture

Excelat separates concerns cleanly:

```text
Excelat
│
├── Grid                # Table layout, sticky headers, viewport
├── Cell                # Memoized cell display and type formatting
├── RowHeader           # Row numbers and selection highlight
├── ColumnHeader        # Column letters (A..Z, AA..) and selection highlight
├── Selection           # Normalized rectangular range state (anchor & focus)
├── Editing             # CellEditor input lifecycle and commit navigation
├── Keyboard            # Keyboard shortcuts and spreadsheet navigation
├── Clipboard          # TSV serialization, deserialization, clipboard API
└── History             # Operation stack (undo/redo) with structural sharing
```

### Operation Model

All mutations are represented as reversible atomic operations:

```ts
type GridOperation =
  | { type: "cell.update"; row: number; column: number; previousValue: CellValue; value: CellValue }
  | { type: "range.clear"; range: CellRange; previousValues: CellValue[][] }
  | { type: "range.update"; range: CellRange; previousValues: CellValue[][]; values: CellValue[][] };
```

This ensures fast undo/redo without duplicating entire datasets in memory.

---

## 8. Roadmap

```text
V0.1
✓ Excel-like grid
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
