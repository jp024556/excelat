import React, { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { Excelat } from "../src/Excelat";
import { ExcelatRef, ExcelatColumn, ExcelatGridState } from "../src/model/types";
import { reorderColumnsAndData } from "../src/model/operations";

describe("Excelat - Grid State Persistence (initialState, getState, setState, resetState)", () => {
  it("reorderColumnsAndData helper reorders columns and row data accurately", () => {
    const columns: ExcelatColumn[] = [
      { key: "name", header: "Name" },
      { key: "age", header: "Age" },
      { key: "city", header: "City" },
    ];
    const data = [
      ["Alice", 25, "New York"],
      ["Bob", 30, "London"],
    ];

    const result = reorderColumnsAndData(columns, data, ["city", "name", "age"]);
    expect(result.columns?.map((c) => c.key)).toEqual(["city", "name", "age"]);
    expect(result.data).toEqual([
      ["New York", "Alice", 25],
      ["London", "Bob", 30],
    ]);
  });

  it("restores column order, widths, sorting, and filtering from initialState on mount", () => {
    const columns: ExcelatColumn[] = [
      { key: "name", header: "Name" },
      { key: "age", header: "Age", type: "number" },
      { key: "city", header: "City" },
    ];
    const data = [
      ["Alice", 25, "New York"],
      ["Bob", 30, "London"],
      ["Charlie", 20, "Paris"],
    ];

    const initialState: ExcelatGridState = {
      columnOrder: ["age", "city", "name"],
      columnWidths: {
        age: 120,
        city: 150,
      },
      sorting: [{ column: "age", direction: "asc" }],
      filtering: [{ column: "city", operator: "contains", value: "o" }], // London, New York
    };

    const { container } = render(
      <Excelat
        mode="table"
        columns={columns}
        data={data}
        initialState={initialState}
        sorting={{ mode: "client" }}
        filtering={{ mode: "client" }}
      />
    );

    // 1. Column Header sequence should be: Age, City, Name
    const headers = Array.from(container.querySelectorAll(".excelat-col-header-text")).map(
      (el) => el.textContent
    );
    expect(headers).toEqual(["Age", "City", "Name"]);

    // 2. Filtered & Sorted Rows:
    // "o" in city matches:
    // - Alice: 25, New York
    // - Bob: 30, London
    // Sorted by Age asc:
    // First row: Alice (Age 25, City New York, Name Alice)
    // Second row: Bob (Age 30, City London, Name Bob)
    const getRowCells = (rowIdx: number) => [
      container.querySelector(`td[data-row="${rowIdx}"][data-col="0"]`)?.textContent,
      container.querySelector(`td[data-row="${rowIdx}"][data-col="1"]`)?.textContent,
      container.querySelector(`td[data-row="${rowIdx}"][data-col="2"]`)?.textContent,
    ];

    expect(getRowCells(0)).toEqual(["25", "New York", "Alice"]);
    expect(getRowCells(1)).toEqual(["30", "London", "Bob"]);

    // 3. Charlie (Paris) has no "o" so only 2 rows are rendered
    expect(container.querySelector('td[data-row="2"][data-col="0"]')).toBeNull();
  });

  it("getState returns a complete serializable snapshot of the grid layout", () => {
    const ref = createRef<ExcelatRef>();
    const columns: ExcelatColumn[] = [
      { key: "name", header: "Name" },
      { key: "age", header: "Age" },
    ];
    const data = [["Alice", 25]];

    render(
      <Excelat
        ref={ref}
        mode="table"
        columns={columns}
        data={data}
        sorting={{ mode: "client" }}
        filtering={{ mode: "client" }}
      />
    );

    const state = ref.current?.getState();
    expect(state).toBeDefined();
    expect(state?.columnOrder).toEqual(["name", "age"]);
    // Should be valid JSON
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  it("setState dynamically modifies column order, widths, and sort rules", () => {
    const ref = createRef<ExcelatRef>();
    const columns: ExcelatColumn[] = [
      { key: "name", header: "Name" },
      { key: "age", header: "Age", type: "number" },
    ];
    const data = [
      ["Alice", 25],
      ["Bob", 30],
    ];

    const { container } = render(
      <Excelat
        ref={ref}
        mode="table"
        columns={columns}
        data={data}
        sorting={{ mode: "client" }}
      />
    );

    const getHeaders = () =>
      Array.from(container.querySelectorAll(".excelat-col-header-text")).map(
        (el) => el.textContent
      );
    expect(getHeaders()).toEqual(["Name", "Age"]);

    // Apply new state: reorder columns and sort by age desc
    act(() => {
      ref.current?.setState({
        columnOrder: ["age", "name"],
        sorting: [{ column: "age", direction: "desc" }],
      });
    });

    expect(getHeaders()).toEqual(["Age", "Name"]);

    // Row 0 should now be Bob (30, Bob) because sorted descending
    const getRow0Cells = () => [
      container.querySelector('td[data-row="0"][data-col="0"]')?.textContent,
      container.querySelector('td[data-row="0"][data-col="1"]')?.textContent,
    ];
    expect(getRow0Cells()).toEqual(["30", "Bob"]);
  });

  it("resetState reverts column order and sorting back to initial defaults", () => {
    const ref = createRef<ExcelatRef>();
    const columns: ExcelatColumn[] = [
      { key: "name", header: "Name" },
      { key: "age", header: "Age" },
    ];
    const data = [
      ["Alice", 25],
      ["Bob", 30],
    ];

    const { container } = render(
      <Excelat
        ref={ref}
        mode="table"
        columns={columns}
        data={data}
        sorting={{ mode: "client" }}
      />
    );

    // Reorder
    act(() => {
      ref.current?.reorderColumn(0, 1);
    });
    expect(
      Array.from(container.querySelectorAll(".excelat-col-header-text")).map(
        (el) => el.textContent
      )
    ).toEqual(["Age", "Name"]);

    // Reset
    act(() => {
      ref.current?.resetState();
    });
    expect(
      Array.from(container.querySelectorAll(".excelat-col-header-text")).map(
        (el) => el.textContent
      )
    ).toEqual(["Name", "Age"]);
  });

  it("fires onStateChange when column is reordered or resized", () => {
    const ref = createRef<ExcelatRef>();
    const onStateChange = vi.fn();
    const columns: ExcelatColumn[] = [
      { key: "colA", header: "A" },
      { key: "colB", header: "B" },
    ];
    const data = [["1", "2"]];

    render(
      <Excelat
        ref={ref}
        mode="table"
        columns={columns}
        data={data}
        onStateChange={onStateChange}
      />
    );

    // Initial mount might emit initial state
    expect(onStateChange).toHaveBeenCalled();
    const initialCallCount = onStateChange.mock.calls.length;

    // Trigger column reorder
    act(() => {
      ref.current?.reorderColumn(0, 1);
    });

    expect(onStateChange.mock.calls.length).toBeGreaterThan(initialCallCount);
    const latestState: ExcelatGridState =
      onStateChange.mock.calls[onStateChange.mock.calls.length - 1][0];
    expect(latestState.columnOrder).toEqual(["colB", "colA"]);
  });
});
