import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import {
  Excelat,
  ExcelatData,
  ExcelatColumn,
  CustomCellEditorProps,
} from "../src";

describe("Excelat - Custom Cell Types, Rendering & Editing", () => {
  describe("Custom Cell Rendering", () => {
    it("renders custom React content including badges, currency, and formatted dates", () => {
      const data: ExcelatData = [
        ["Active", 1250, "2026-09-28"],
        ["Inactive", 450, "2026-09-29"],
      ];

      const columns: ExcelatColumn[] = [
        {
          header: "Status",
          render: ({ value }) => (
            <span className={`status-badge ${value === "Active" ? "active" : "inactive"}`}>
              {String(value)}
            </span>
          ),
        },
        {
          header: "Revenue",
          type: "number",
          render: ({ value }) => <strong>${Number(value).toFixed(2)}</strong>,
        },
        {
          header: "Created",
          type: "date",
          render: ({ value }) => <em>Date: {String(value)}</em>,
        },
      ];

      const { container } = render(
        <Excelat data={data} mode="table" columns={columns} />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      const badge = cell00.querySelector(".status-badge");
      expect(badge).not.toBeNull();
      expect(badge?.textContent).toBe("Active");
      expect(badge?.classList.contains("active")).toBe(true);

      const cell01 = container.querySelector('td[data-row="0"][data-col="1"]')!;
      expect(cell01.querySelector("strong")?.textContent).toBe("$1250.00");

      const cell02 = container.querySelector('td[data-row="0"][data-col="2"]')!;
      expect(cell02.querySelector("em")?.textContent).toBe("Date: 2026-09-28");
    });

    it("passes the full row data array to CellRenderContext", () => {
      const data: ExcelatData = [
        ["Alice", 50, 100],
        ["Bob", 20, 200],
      ];

      const columns: ExcelatColumn[] = [
        { header: "Name" },
        { header: "Score" },
        {
          header: "Summary",
          render: ({ value, row }) => (
            <span className="row-summary">
              {row ? `${row[0]}: ${row[1]} / ${row[2]}` : String(value)}
            </span>
          ),
        },
      ];

      const { container } = render(
        <Excelat data={data} mode="table" columns={columns} />
      );

      const cell02 = container.querySelector('td[data-row="0"][data-col="2"]')!;
      expect(cell02.querySelector(".row-summary")?.textContent).toBe("Alice: 50 / 100");

      const cell12 = container.querySelector('td[data-row="1"][data-col="2"]')!;
      expect(cell12.querySelector(".row-summary")?.textContent).toBe("Bob: 20 / 200");
    });

    it("ensures interactive elements (buttons) inside custom renderers do not trigger cell editing or drag selection", () => {
      const data: ExcelatData = [["Task 1"], ["Task 2"]];
      const handleButtonClick = vi.fn();

      const columns: ExcelatColumn[] = [
        {
          header: "Actions",
          render: ({ rowIndex }) => (
            <button
              type="button"
              className="action-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick(rowIndex);
              }}
            >
              Action {rowIndex}
            </button>
          ),
        },
      ];

      const { container } = render(
        <Excelat data={data} mode="table" columns={columns} />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      const btn = cell00.querySelector(".action-btn") as HTMLButtonElement;
      expect(btn).not.toBeNull();

      // Click button
      fireEvent.click(btn);
      expect(handleButtonClick).toHaveBeenCalledWith(0);

      // Double-click button: must NOT trigger edit mode
      fireEvent.doubleClick(btn);
      const editor = container.querySelector(".excelat-cell-editor");
      expect(editor).toBeNull();
    });
  });

  describe("Custom Cell Editor", () => {
    // Custom Select Editor Component
    const StatusDropdownEditor: React.FC<CustomCellEditorProps> = ({
      value,
      onChange,
      onCommit,
      onCancel,
    }) => {
      return (
        <select
          className="custom-status-select"
          value={String(value ?? "Active")}
          onChange={(e) => {
            onChange(e.target.value);
            onCommit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter") onCommit();
          }}
          autoFocus
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
        </select>
      );
    };

    it("renders custom editor on edit mode and commits changes with onOperation and undo/redo", () => {
      const data: ExcelatData = [["Active", 100]];
      const handleOperation = vi.fn();
      const handleChange = vi.fn();

      const columns: ExcelatColumn[] = [
        {
          header: "Status",
          render: ({ value }) => <span className="status-pill">{String(value)}</span>,
          editor: StatusDropdownEditor,
        },
        {
          header: "Amount",
          type: "number",
        },
      ];

      const { container } = render(
        <Excelat
          data={data}
          mode="table"
          columns={columns}
          onOperation={handleOperation}
          onChange={handleChange}
        />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      expect(cell00.querySelector(".status-pill")?.textContent).toBe("Active");

      // Double-click cell to enter edit mode
      fireEvent.doubleClick(cell00);

      const select = container.querySelector(".custom-status-select") as HTMLSelectElement;
      expect(select).not.toBeNull();
      expect(select.value).toBe("Active");

      // Change selection to "Pending"
      fireEvent.change(select, { target: { value: "Pending" } });

      // After change and onCommit, editor should close and value should update
      expect(handleOperation).toHaveBeenCalledTimes(1);
      expect(handleOperation).toHaveBeenCalledWith({
        type: "cell.update",
        row: 0,
        column: 0,
        value: "Pending",
        previousValue: "Active",
      });

      expect(handleChange).toHaveBeenCalled();
      const updatedData = handleChange.mock.calls[0][0];
      expect(updatedData[0][0]).toBe("Pending");
    });

    it("supports direct value commit via onCommit(movement, directValue)", () => {
      const QuickToggleEditor: React.FC<CustomCellEditorProps> = ({
        onCommit,
        onCancel,
      }) => {
        return (
          <div className="quick-toggle">
            <button
              type="button"
              className="btn-opt-a"
              onClick={() => onCommit("none", "Option A")}
            >
              Option A
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => onCancel()}
            >
              Cancel
            </button>
          </div>
        );
      };

      const data: ExcelatData = [["Initial"]];
      const handleOperation = vi.fn();

      const columns: ExcelatColumn[] = [
        {
          header: "Choice",
          editor: QuickToggleEditor,
        },
      ];

      const { container } = render(
        <Excelat
          data={data}
          columns={columns}
          onOperation={handleOperation}
        />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.doubleClick(cell00);

      const btnA = container.querySelector(".btn-opt-a") as HTMLButtonElement;
      expect(btnA).not.toBeNull();

      fireEvent.click(btnA);

      expect(handleOperation).toHaveBeenCalledWith({
        type: "cell.update",
        row: 0,
        column: 0,
        value: "Option A",
        previousValue: "Initial",
      });
    });

    it("cancels custom editor changes when onCancel is invoked", () => {
      const SimpleCustomEditor: React.FC<CustomCellEditorProps> = ({
        onCancel,
      }) => {
        return (
          <button type="button" className="btn-abort" onClick={() => onCancel()}>
            Discard
          </button>
        );
      };

      const data: ExcelatData = [["OriginalValue"]];
      const handleOperation = vi.fn();

      const columns: ExcelatColumn[] = [
        {
          header: "Custom",
          editor: SimpleCustomEditor,
        },
      ];

      const { container } = render(
        <Excelat
          data={data}
          columns={columns}
          onOperation={handleOperation}
        />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      fireEvent.doubleClick(cell00);

      const abortBtn = container.querySelector(".btn-abort") as HTMLButtonElement;
      expect(abortBtn).not.toBeNull();

      fireEvent.click(abortBtn);

      // Should exit editing without firing operation
      expect(handleOperation).not.toHaveBeenCalled();
      expect(container.querySelector(".btn-abort")).toBeNull();
      expect(cell00.textContent).toContain("OriginalValue");
    });
  });

  describe("Separation of Concerns: Render vs Editor Combinations", () => {
    it("supports custom render with default editor", () => {
      const data: ExcelatData = [["avatar.png"]];

      const columns: ExcelatColumn[] = [
        {
          header: "Avatar",
          render: ({ value }) => <img className="avatar-img" src={String(value)} alt="User" />,
          // No custom editor: default CellEditor should be used
        },
      ];

      const { container } = render(
        <Excelat data={data} columns={columns} />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      expect(cell00.querySelector(".avatar-img")).not.toBeNull();

      // Double-click should open default CellEditor input
      fireEvent.doubleClick(cell00);
      const defaultEditor = container.querySelector(".excelat-cell-editor") as HTMLInputElement;
      expect(defaultEditor).not.toBeNull();
      expect(defaultEditor.value).toBe("avatar.png");
    });

    it("supports default render with custom editor", () => {
      const CustomInputEditor: React.FC<CustomCellEditorProps> = ({
        value,
        onChange,
        onCommit,
      }) => (
        <input
          type="text"
          className="my-special-input"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onCommit()}
        />
      );

      const data: ExcelatData = [["StandardText"]];

      const columns: ExcelatColumn[] = [
        {
          header: "Custom Edit Only",
          editor: CustomInputEditor,
          // No custom render: standard cell content is used
        },
      ];

      const { container } = render(
        <Excelat data={data} columns={columns} />
      );

      const cell00 = container.querySelector('td[data-row="0"][data-col="0"]')!;
      expect(cell00.textContent).toContain("StandardText");

      fireEvent.doubleClick(cell00);
      expect(container.querySelector(".my-special-input")).not.toBeNull();
    });
  });
});
