import React, { useState, useRef } from "react";
import { Excelat, ExcelatData, ExcelatOperation, ExcelatRef } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";
import { Terminal, Trash2 } from "lucide-react";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const INITIAL_DATA: ExcelatData = [
  ["Task 101", "Database Migration", "Completed", 8],
  ["Task 102", "Auth Token Refresh", "In Review", 4],
  ["Task 103", "Stripe Checkout V3", "In Progress", 16],
  ["Task 104", "Virtualization Optim", "Pending", 12],
];

interface LogEntry {
  id: number;
  time: string;
  op: ExcelatOperation;
}

export const OperationsSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  const gridRef = useRef<ExcelatRef>(null);
  const [data, setData] = useState<ExcelatData>(INITIAL_DATA);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const handleOperation = (op: ExcelatOperation) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ id: Date.now() + Math.random(), time: timestamp, op }, ...prev.slice(0, 19)]);
  };

  const demoCode = `import { useState } from "react";
import { Excelat, ExcelatOperation } from "@excelat/react";

export function CollaborativeGrid() {
  const [data, setData] = useState(initialData);

  const handleOperation = (op: ExcelatOperation) => {
    // Send granular mutation over WebSocket / Supabase channel
    websocket.send(JSON.stringify({
      channel: "sheet_42",
      operation: op,
    }));
  };

  return (
    <Excelat
      data={data}
      onChange={setData}
      onOperation={handleOperation}
      showFormulaBar={true}
    />
  );
}`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Interactions & State</span> / <span>Operations & Realtime Sync</span>
        </div>
        <h1 className="docs-page-title">Granular Operations & Realtime Sync</h1>
        <p className="docs-page-lead">
          Never diff massive 2D matrices again. Excelat dispatches granular, atomic <code>onOperation</code> events
          for every cell edit, range clear, fill handle drag, and row/column insertion.
        </p>
      </div>

      <DemoContainer
        title="Live Operation Event Stream"
        badge="Realtime Event Inspector"
        description="Edit any cell, press Delete on a selection, or drag the fill handle. Watch the live developer event log below capture every granular mutation in real time."
        code={demoCode}
        controls={
          <div className="docs-demo-controls-inline">
            <span className="control-group-title">
              <Terminal size={14} />
              <span>Event Stream ({logs.length} logged):</span>
            </span>
            <button
              className="demo-pill"
              onClick={() => setLogs([])}
              title="Clear event log"
            >
              <Trash2 size={12} />
              <span>Clear Log</span>
            </button>
          </div>
        }
      >
        <div style={{ height: 200, width: "100%", marginBottom: 12 }}>
          <Excelat
            ref={gridRef}
            mode="table"
            data={data}
            onChange={setData}
            onOperation={handleOperation}
            showFormulaBar={true}
            selectionStyle="excel"
          />
        </div>

        {/* Live Event Console */}
        <div className="docs-console-card">
          <div className="docs-console-header">
            <span className="docs-console-title">Live Mutation Event Console</span>
            <span className="docs-console-badge">WebSocket / Backend Ready</span>
          </div>
          <div className="docs-console-body">
            {logs.length === 0 ? (
              <div className="docs-console-empty">
                Interact with the table above to stream atomic mutation events...
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="docs-console-row">
                  <span className="console-time">{log.time}</span>
                  <span className={`console-op-type op-${log.op.type.replace(".", "-")}`}>
                    {log.op.type}
                  </span>
                  <span className="console-op-detail">
                    {log.op.type === "cell.update" && (
                      <>
                        [Row {log.op.row}, Col {log.op.column}]: "
                        <span className="prev-val">{String(log.op.previousValue ?? "null")}</span>" → "
                        <span className="next-val">{String(log.op.value ?? "null")}</span>"
                      </>
                    )}
                    {log.op.type === "range.clear" && (
                      <>
                        Range [R{log.op.range.startRow}:C{log.op.range.startColumn} to R{log.op.range.endRow}:C{log.op.range.endColumn}] cleared
                      </>
                    )}
                    {log.op.type === "range.fill" && (
                      <>
                        Filled from [R{log.op.source.startRow}:C{log.op.source.startColumn}] to [R{log.op.destination.endRow}:C{log.op.destination.endColumn}]
                      </>
                    )}
                    {log.op.type === "row.insert" && <>Inserted row at index {log.op.index}</>}
                    {log.op.type === "row.delete" && <>Deleted row at index {log.op.index}</>}
                    {log.op.type === "column.insert" && <>Inserted column at index {log.op.index}</>}
                    {log.op.type === "column.delete" && <>Deleted column at index {log.op.index}</>}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </DemoContainer>

      <section className="docs-article-section">
        <h2>Why Granular Operations Matter</h2>
        <p>
          Traditional React tables only expose <code>onChange(newData)</code>. To sync changes to a backend or database,
          developers had to compare old data against new data, performing expensive O(R×C) diffing algorithms.
        </p>
        <p>
          Excelat solves this at the architecture level. Every user action emits an atomic <code>ExcelatOperation</code> object:
        </p>
        <div className="docs-comparison-table-wrapper">
          <table className="docs-comparison-table">
            <thead>
              <tr>
                <th>Operation <code>type</code></th>
                <th>Payload Properties</th>
                <th>Typical Database Mapping</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>"cell.update"</code></td>
                <td><code>row, column, previousValue, value</code></td>
                <td><code>UPDATE table SET col = ? WHERE id = ?</code></td>
              </tr>
              <tr>
                <td><code>"range.clear"</code></td>
                <td><code>range</code></td>
                <td><code>UPDATE table SET ... = NULL WHERE id IN (...)</code></td>
              </tr>
              <tr>
                <td><code>"range.fill"</code></td>
                <td><code>source, destination, values</code></td>
                <td>Batch update range across target records</td>
              </tr>
              <tr>
                <td><code>"row.insert"</code></td>
                <td><code>index, values</code></td>
                <td><code>INSERT INTO table ...</code></td>
              </tr>
              <tr>
                <td><code>"row.delete"</code></td>
                <td><code>index</code></td>
                <td><code>DELETE FROM table WHERE id = ?</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <SectionNav currentSection="operations" onSelectSection={onSelectSection} />
    </div>
  );
};
