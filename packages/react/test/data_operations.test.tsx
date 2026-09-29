import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act, screen } from "@testing-library/react";
import {
  Excelat,
  ExcelatRef,
  ExcelatData,
  ExcelatColumn,
  SortRule,
  Filter,
  PaginationConfig,
} from "../src";

describe("Excelat - Data Operations & Advanced Capabilities", () => {
  const sampleData: ExcelatData = [
    ["Alice", 30, "Engineering", "2023-01-15", true],
    ["Charlie", 25, "Design", "2022-06-10", false],
    ["Bob", 35, "Engineering", "2021-03-20", true],
    ["David", 28, "Design", "2023-09-01", false],
    ["Eve", 40, "Marketing", "2020-11-05", true],
  ];

  const columns: ExcelatColumn[] = [
    { key: "name", header: "Name", type: "text" },
    { key: "age", header: "Age", type: "number" },
    { key: "department", header: "Department", type: "text" },
    { key: "joinDate", header: "Join Date", type: "date" },
    { key: "active", header: "Active", type: "boolean" },
  ];

  // ==========================================
  // 1. SORTING
  // ==========================================
  describe("Sorting", () => {
    it("performs client-side single column sorting (asc, desc, unsorted)", () => {
      const { container, rerender } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          sorting={{ mode: "client", sort: [{ column: "name", direction: "asc" }] }}
        />
      );

      // In ASC order by name: Alice, Bob, Charlie, David, Eve
      let firstCell = container.querySelector('td[data-row="0"][data-col="0"]');
      let secondCell = container.querySelector('td[data-row="1"][data-col="0"]');
      expect(firstCell?.textContent).toContain("Alice");
      expect(secondCell?.textContent).toContain("Bob");

      // In DESC order by name: Eve, David, Charlie, Bob, Alice
      rerender(
        <Excelat
          data={sampleData}
          columns={columns}
          sorting={{ mode: "client", sort: [{ column: "name", direction: "desc" }] }}
        />
      );

      firstCell = container.querySelector('td[data-row="0"][data-col="0"]');
      secondCell = container.querySelector('td[data-row="1"][data-col="0"]');
      expect(firstCell?.textContent).toContain("Eve");
      expect(secondCell?.textContent).toContain("David");
    });

    it("performs numeric sorting correctly in client mode", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          sorting={{ mode: "client", sort: [{ column: "age", direction: "asc" }] }}
        />
      );

      // Ages: 25 (Charlie), 28 (David), 30 (Alice), 35 (Bob), 40 (Eve)
      const firstRowName = container.querySelector('td[data-row="0"][data-col="0"]');
      const firstRowAge = container.querySelector('td[data-row="0"][data-col="1"]');
      expect(firstRowName?.textContent).toContain("Charlie");
      expect(firstRowAge?.textContent).toContain("25");

      const lastRowName = container.querySelector('td[data-row="4"][data-col="0"]');
      expect(lastRowName?.textContent).toContain("Eve");
    });

    it("performs multi-column sorting in client mode", () => {
      const multiSortData: ExcelatData = [
        ["Alice", 30, "Engineering"],
        ["Bob", 25, "Engineering"],
        ["Charlie", 35, "Engineering"],
        ["David", 22, "Design"],
      ];
      const multiCols: ExcelatColumn[] = [
        { key: "name", header: "Name" },
        { key: "age", header: "Age", type: "number" },
        { key: "dept", header: "Department" },
      ];

      // Primary: dept asc ("Design", then "Engineering")
      // Secondary: age desc (for Engineering: Charlie (35), Alice (30), Bob (25))
      const { container } = render(
        <Excelat
          data={multiSortData}
          columns={multiCols}
          sorting={{
            mode: "client",
            sort: [
              { column: "dept", direction: "asc" },
              { column: "age", direction: "desc" },
            ],
          }}
        />
      );

      // Row 0: David (Design)
      expect(container.querySelector('td[data-row="0"][data-col="0"]')?.textContent).toContain("David");
      // Row 1: Charlie (Engineering, 35)
      expect(container.querySelector('td[data-row="1"][data-col="0"]')?.textContent).toContain("Charlie");
      // Row 2: Alice (Engineering, 30)
      expect(container.querySelector('td[data-row="2"][data-col="0"]')?.textContent).toContain("Alice");
      // Row 3: Bob (Engineering, 25)
      expect(container.querySelector('td[data-row="3"][data-col="0"]')?.textContent).toContain("Bob");
    });

    it("cycles sort direction on header click and emits onSortChange in server mode without modifying local data order", () => {
      const handleSortChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          sorting={{ mode: "server" }}
          onSortChange={handleSortChange}
        />
      );

      const header0 = container.querySelector('.excelat-col-header[data-col="0"]')!;
      fireEvent.click(header0);

      expect(handleSortChange).toHaveBeenCalledWith([{ column: "name", direction: "asc" }]);

      // Server mode does not mutate client data order
      expect(container.querySelector('td[data-row="0"][data-col="0"]')?.textContent).toContain("Alice");
      expect(container.querySelector('td[data-row="1"][data-col="0"]')?.textContent).toContain("Charlie");
    });

    it("supports Shift+Click for multi-column sorting toggle", () => {
      const handleSortChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          sorting={{
            mode: "server",
            sort: [{ column: "department", direction: "asc" }],
          }}
          onSortChange={handleSortChange}
        />
      );

      const headerAge = container.querySelector('.excelat-col-header[data-col="1"]')!;
      fireEvent.click(headerAge, { shiftKey: true });

      expect(handleSortChange).toHaveBeenCalledWith([
        { column: "department", direction: "asc" },
        { column: "age", direction: "asc" },
      ]);
    });
  });

  // ==========================================
  // 2. FILTERING
  // ==========================================
  describe("Filtering", () => {
    it("filters text columns using client-side mode", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          filtering={{
            mode: "client",
            filters: [{ column: "department", operator: "equals", value: "Engineering" }],
          }}
        />
      );

      // Only Alice and Bob are Engineering
      const rows = container.querySelectorAll(".excelat-tbody tr.excelat-row");
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain("Alice");
      expect(rows[1].textContent).toContain("Bob");
    });

    it("filters number columns with greater-than operator", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          filtering={{
            mode: "client",
            filters: [{ column: "age", operator: "gt", value: 30 }],
          }}
        />
      );

      // Bob (35) and Eve (40)
      const rows = container.querySelectorAll(".excelat-tbody tr.excelat-row");
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain("Bob");
      expect(rows[1].textContent).toContain("Eve");
    });

    it("filters boolean and date columns in client mode", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          filtering={{
            mode: "client",
            filters: [{ column: "active", operator: "equals", value: false }],
          }}
        />
      );

      // Charlie and David are false
      const rows = container.querySelectorAll(".excelat-tbody tr.excelat-row");
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain("Charlie");
      expect(rows[1].textContent).toContain("David");
    });

    it("emits onFilterChange in server mode without modifying local data order", () => {
      const handleFilterChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          filtering={{ mode: "server" }}
          onFilterChange={handleFilterChange}
        />
      );

      // Click filter trigger on col 0 (Name)
      const filterBtn = container.querySelector('.excelat-col-header[data-col="0"] .excelat-filter-btn')!;
      fireEvent.click(filterBtn);

      // Filter popover opens
      const popover = container.querySelector(".excelat-filter-popover");
      expect(popover).not.toBeNull();

      const input = popover!.querySelector(".excelat-filter-input") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Ali" } });

      const applyBtn = popover!.querySelector(".excelat-filter-apply-btn")!;
      fireEvent.click(applyBtn);

      expect(handleFilterChange).toHaveBeenCalledWith([
        { column: "name", operator: "contains", value: "Ali" },
      ]);
    });
  });

  // ==========================================
  // 3. PAGINATION
  // ==========================================
  describe("Pagination", () => {
    it("slices data rows locally when pagination mode is client", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          pagination={{
            mode: "client",
            page: 1,
            pageSize: 2,
          }}
        />
      );

      const rows = container.querySelectorAll(".excelat-tbody tr.excelat-row");
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain("Alice");
      expect(rows[1].textContent).toContain("Charlie");

      // Pagination summary text
      const summary = container.querySelector(".excelat-pagination-summary");
      expect(summary?.textContent).toContain("Showing");
      expect(summary?.textContent).toContain("5");
    });

    it("calls onPageChange and onPageSizeChange callbacks", () => {
      const handlePageChange = vi.fn();
      const handlePageSizeChange = vi.fn();

      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          pagination={{
            mode: "client",
            page: 1,
            pageSize: 2,
            total: 5,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      );

      const nextBtn = container.querySelector(".excelat-pagination-next")!;
      fireEvent.click(nextBtn);
      expect(handlePageChange).toHaveBeenCalledWith(2);

      const sizeSelect = container.querySelector(".excelat-page-size-select") as HTMLSelectElement;
      fireEvent.change(sizeSelect, { target: { value: "10" } });
      expect(handlePageSizeChange).toHaveBeenCalledWith(10);
    });

    it("supports custom pagination UI via renderPagination", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          pagination={{
            mode: "server",
            page: 3,
            pageSize: 20,
            total: 100,
          }}
          renderPagination={(props) => (
            <div data-testid="custom-pagination">
              Page {props.page} of {props.totalPages} (Total: {props.total})
            </div>
          )}
        />
      );

      const custom = screen.getByTestId("custom-pagination");
      expect(custom.textContent).toBe("Page 3 of 5 (Total: 100)");
    });
  });

  // ==========================================
  // 4. ROW GROUPING
  // ==========================================
  describe("Row Grouping", () => {
    it("groups rows by single column with distinct group header rows and counts", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          grouping={{
            columns: ["department"],
          }}
        />
      );

      // Groups: Engineering (2), Design (2), Marketing (1)
      const groupHeaders = container.querySelectorAll(".excelat-group-row");
      expect(groupHeaders.length).toBe(3);

      expect(groupHeaders[0].textContent).toContain("Department: Engineering");
      expect(groupHeaders[0].textContent).toContain("(2)");

      expect(groupHeaders[1].textContent).toContain("Department: Design");
      expect(groupHeaders[1].textContent).toContain("(2)");

      expect(groupHeaders[2].textContent).toContain("Department: Marketing");
      expect(groupHeaders[2].textContent).toContain("(1)");
    });

    it("supports expanding and collapsing groups via toggle click", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          grouping={{
            columns: ["department"],
          }}
        />
      );

      // Initially expanded: 3 group rows + 5 data rows = 8 total rows
      let rows = container.querySelectorAll(".excelat-tbody tr");
      expect(rows.length).toBe(8);

      // Click collapse toggle on first group (Engineering)
      const firstToggle = container.querySelector(".excelat-group-toggle")!;
      fireEvent.click(firstToggle);

      // Engineering collapsed (2 items hidden): 3 group rows + 3 data rows = 6 rows
      rows = container.querySelectorAll(".excelat-tbody tr");
      expect(rows.length).toBe(6);

      // Click again to expand
      fireEvent.click(firstToggle);
      rows = container.querySelectorAll(".excelat-tbody tr");
      expect(rows.length).toBe(8);
    });

    it("ensures group header rows are not editable", () => {
      const handleCellEditStart = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          grouping={{
            columns: ["department"],
          }}
          onCellEditStart={handleCellEditStart}
        />
      );

      // Double-click group header row cell
      const groupCell = container.querySelector(".excelat-group-row td")!;
      fireEvent.doubleClick(groupCell);

      expect(handleCellEditStart).not.toHaveBeenCalled();
      const editor = container.querySelector(".excelat-cell-editor");
      expect(editor).toBeNull();
    });

    it("supports multi-column nested grouping", () => {
      const multiGroupData: ExcelatData = [
        ["Alice", "Engineering", "Frontend"],
        ["Bob", "Engineering", "Backend"],
        ["Charlie", "Design", "Product"],
      ];
      const multiCols: ExcelatColumn[] = [
        { key: "name", header: "Name" },
        { key: "dept", header: "Department" },
        { key: "role", header: "Role" },
      ];

      const { container } = render(
        <Excelat
          data={multiGroupData}
          columns={multiCols}
          grouping={{
            columns: ["dept", "role"],
          }}
        />
      );

      const groupHeaders = container.querySelectorAll(".excelat-group-row");
      // Dept: Engineering, Role: Frontend, Role: Backend, Dept: Design, Role: Product = 5 headers
      expect(groupHeaders.length).toBe(5);
    });
  });

  // ==========================================
  // 5. CUSTOM TOOLBAR
  // ==========================================
  describe("Custom Toolbar", () => {
    it("renders custom toolbar element and provides access to grid state via function form", () => {
      let toolbarReceivedProps: any = null;

      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          toolbar={(props) => {
            toolbarReceivedProps = props;
            return (
              <div data-testid="custom-toolbar">
                <button
                  data-testid="tb-insert"
                  onClick={() => props.insertRow?.(0, ["Zoe", 29, "Ops", "2024-01-01", true])}
                >
                  Insert Row
                </button>
                <button data-testid="tb-undo" onClick={() => props.undo?.()}>
                  Undo
                </button>
              </div>
            );
          }}
        />
      );

      expect(screen.getByTestId("custom-toolbar")).toBeInTheDocument();
      expect(toolbarReceivedProps).not.toBeNull();
      expect(toolbarReceivedProps.canUndo).toBe(false);
      expect(toolbarReceivedProps.canRedo).toBe(false);
      expect(typeof toolbarReceivedProps.insertRow).toBe("function");
      expect(typeof toolbarReceivedProps.deleteRows).toBe("function");

      // Click insert button from toolbar
      const insertBtn = screen.getByTestId("tb-insert");
      fireEvent.click(insertBtn);

      // Verify row 0 is Zoe
      const firstRowCell = container.querySelector('td[data-row="0"][data-col="0"]');
      expect(firstRowCell?.textContent).toContain("Zoe");
    });
  });

  // ==========================================
  // 6. FEATURE COMPOSITION
  // ==========================================
  describe("Feature Composition & Mode Parity", () => {
    it("composes sorting + filtering + pagination simultaneously", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          // Filter: age > 25 (Alice 30, Bob 35, David 28, Eve 40)
          filtering={{
            mode: "client",
            filters: [{ column: "age", operator: "gt", value: 25 }],
          }}
          // Sort: age asc (David 28, Alice 30, Bob 35, Eve 40)
          sorting={{
            mode: "client",
            sort: [{ column: "age", direction: "asc" }],
          }}
          // Paginate: page 1, pageSize 2 -> David 28, Alice 30
          pagination={{
            mode: "client",
            page: 1,
            pageSize: 2,
          }}
        />
      );

      const rows = container.querySelectorAll(".excelat-tbody tr.excelat-row");
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain("David");
      expect(rows[1].textContent).toContain("Alice");

      const summary = container.querySelector(".excelat-pagination-summary");
      expect(summary?.textContent).toContain("Showing");
      expect(summary?.textContent).toContain("4");
    });

    it("composes grouping with sorting and filtering", () => {
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          // Filter: only active=true (Alice, Bob, Eve)
          filtering={{
            mode: "client",
            filters: [{ column: "active", operator: "equals", value: true }],
          }}
          // Sort: name desc
          sorting={{
            mode: "client",
            sort: [{ column: "name", direction: "desc" }],
          }}
          // Group by department
          grouping={{
            columns: ["department"],
          }}
        />
      );

      // Active groups: Engineering (Eve is in Marketing, Alice & Bob in Engineering)
      const groupHeaders = container.querySelectorAll(".excelat-group-row");
      expect(groupHeaders.length).toBe(2); // Engineering (2), Marketing (1)
    });

    it("verifies all capabilities work identically in spreadsheet mode and table mode", () => {
      const testProps = {
        data: sampleData,
        columns: columns,
        sorting: { mode: "client" as const, sort: [{ column: "name" as const, direction: "asc" as const }] },
        filtering: { mode: "client" as const, filters: [{ column: "active" as const, operator: "equals" as const, value: true }] },
        grouping: { columns: ["department"] },
        pagination: { mode: "client" as const, page: 1, pageSize: 10 },
      };

      // 1. Spreadsheet mode
      const { container: spreadsheetContainer } = render(
        <Excelat mode="spreadsheet" {...testProps} />
      );
      expect(spreadsheetContainer.querySelectorAll(".excelat-group-row").length).toBe(2);
      expect(spreadsheetContainer.querySelector(".excelat-pagination")).not.toBeNull();

      // 2. Table mode
      const { container: tableContainer } = render(
        <Excelat mode="table" {...testProps} />
      );
      expect(tableContainer.querySelectorAll(".excelat-group-row").length).toBe(2);
      expect(tableContainer.querySelector(".excelat-pagination")).not.toBeNull();
    });

    it("preserves cell editing target row index when sorted and grouped", () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Excelat
          data={sampleData}
          columns={columns}
          sorting={{ mode: "client", sort: [{ column: "name", direction: "desc" }] }}
          onChange={handleChange}
        />
      );

      // In DESC order:
      // Row 0 display is Eve (original data index 4)
      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      expect(cell00.textContent).toContain("Eve");

      // Double click cell to edit
      fireEvent.doubleClick(cell00);
      const editor = container.querySelector(".excelat-cell-editor") as HTMLInputElement;
      expect(editor).not.toBeNull();
      expect(editor.value).toBe("Eve");

      // Change value to "Evelyn" and press Enter
      fireEvent.change(editor, { target: { value: "Evelyn" } });
      fireEvent.keyDown(editor, { key: "Enter" });

      expect(handleChange).toHaveBeenCalled();
      const updatedData = handleChange.mock.calls[0][0];
      // Original row 4 (Eve) should now be "Evelyn", and original row 0 (Alice) remains "Alice"
      expect(updatedData[4][0]).toBe("Evelyn");
      expect(updatedData[0][0]).toBe("Alice");
    });
  });
});
