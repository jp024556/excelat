import React, { useState, useMemo, useCallback } from "react";
import { Excelat, ExcelatData, ExcelatColumn } from "@excelat/react";
import { DemoContainer } from "../components/DemoContainer";
import { CodeBlock } from "../components/CodeBlock";
import { PropsTable } from "../components/PropsTable";
import { SectionNav } from "../components/SectionNav";
import { DocSectionId } from "../types";
import { ListOrdered, Loader2, RotateCcw, CheckCircle2, Infinity, ArrowDown } from "lucide-react";

interface SectionProps {
  onSelectSection: (id: DocSectionId) => void;
}

const COLUMNS: ExcelatColumn[] = [
  { key: "id", header: "Order ID", width: 130 },
  { key: "customer", header: "Customer Name", width: 170 },
  { key: "item", header: "Purchased Item", width: 160 },
  { key: "amount", header: "Total ($)", width: 120, type: "number" },
  { key: "status", header: "Order Status", width: 130 },
];

const INFINITE_COLUMNS: ExcelatColumn[] = [
  { key: "index", header: "#", width: 70, type: "number" },
  { key: "id", header: "Transaction ID", width: 140 },
  { key: "user", header: "Account Holder", width: 170 },
  { key: "type", header: "Transaction Type", width: 150 },
  { key: "amount", header: "Amount ($)", width: 120, type: "number" },
  { key: "status", header: "Status", width: 130 },
];

function generateInfiniteBatch(startIdx: number, count: number): ExcelatData {
  const users = [
    "Sarah Connor",
    "Bruce Wayne",
    "Clark Kent",
    "Diana Prince",
    "Tony Stark",
    "Peter Parker",
    "Natasha Romanoff",
    "Steve Rogers",
    "Wanda Maximoff",
    "Stephen Strange",
  ];
  const types = ["Subscription Renewal", "Wire Transfer", "API Usage Tier 3", "Cloud Compute XL", "Direct Debit"];
  const statuses = ["Completed", "Pending", "Verified", "Processing"];

  return Array.from({ length: count }, (_, i) => {
    const idx = startIdx + i;
    return [
      idx + 1,
      `TXN-${100000 + idx}`,
      users[idx % users.length],
      types[idx % types.length],
      50 + ((idx * 83) % 4500),
      statuses[idx % statuses.length],
    ];
  });
}

export const PaginationSection: React.FC<SectionProps> = ({ onSelectSection }) => {
  // ---------------------------------------------------------------------------
  // Pagination Demo State
  // ---------------------------------------------------------------------------
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const total = 500;

  const pageData: ExcelatData = useMemo(() => {
    const offset = (page - 1) * pageSize;
    const items = ["Cloud Storage", "API Gateway Pro", "Enterprise SSO", "Compute Node XL", "DB Cluster"];
    const statuses = ["Fulfilled", "Processing", "Delivered", "In Transit"];

    return Array.from({ length: pageSize }, (_, i) => {
      const idx = offset + i;
      return [
        `ORD-${50000 + idx}`,
        `Customer #${idx + 1}`,
        items[idx % items.length],
        120 + ((idx * 45) % 1800),
        statuses[idx % statuses.length],
      ];
    });
  }, [page, pageSize]);

  const handlePageChange = useCallback((nextPage: number) => {
    setLoading(true);
    setTimeout(() => {
      setPage(nextPage);
      setLoading(false);
    }, 180);
  }, []);

  const handlePageSizeChange = useCallback((nextSize: number) => {
    setLoading(true);
    setTimeout(() => {
      setPageSize(nextSize);
      setPage(1);
      setLoading(false);
    }, 180);
  }, []);

  // ---------------------------------------------------------------------------
  // Infinite Scroll Demo State
  // ---------------------------------------------------------------------------
  const INITIAL_BATCH_SIZE = 30;
  const BATCH_SIZE = 25;
  const MAX_RECORDS = 300;

  const [infiniteData, setInfiniteData] = useState<ExcelatData>(() =>
    generateInfiniteBatch(0, INITIAL_BATCH_SIZE)
  );
  const [infiniteLoading, setInfiniteLoading] = useState<boolean>(false);

  const hasMore = infiniteData.length < MAX_RECORDS;

  const handleLoadMore = useCallback(() => {
    if (infiniteLoading || !hasMore) return;
    setInfiniteLoading(true);

    setTimeout(() => {
      setInfiniteData((prev) => {
        const nextBatch = generateInfiniteBatch(prev.length, BATCH_SIZE);
        return [...prev, ...nextBatch];
      });
      setInfiniteLoading(false);
    }, 450);
  }, [infiniteLoading, hasMore]);

  const handleResetInfinite = useCallback(() => {
    setInfiniteLoading(false);
    setInfiniteData(generateInfiniteBatch(0, INITIAL_BATCH_SIZE));
  }, []);

  const paginationDemoCode = `import { useState } from "react";
import { Excelat, ExcelatColumn } from "@excelat/react";

export function ServerPaginatedTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // In real applications, fetch your slice from an API
  const { data, total } = useApiQuery({ page, pageSize });

  return (
    <div style={{ height: 320 }}>
      <Excelat
        mode="table"
        columns={columns}
        data={data}
        loading={loading}
        pagination={{
          mode: "server",
          page,
          pageSize,
          total,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        onPageChange={(nextPage) => {
          setLoading(true);
          fetchData(nextPage).then(() => setLoading(false));
        }}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
      />
    </div>
  );
}`;

  const infiniteDemoCode = `import { useState, useCallback } from "react";
import { Excelat, ExcelatColumn } from "@excelat/react";

export function InfiniteScrollTable() {
  const [data, setData] = useState(() => fetchInitialBatch(30));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    api.fetchNextChunk({ offset: data.length, limit: 25 }).then((newRows) => {
      setData((prev) => [...prev, ...newRows]);
      setLoading(false);
      if (data.length + newRows.length >= 300) {
        setHasMore(false);
      }
    });
  }, [loading, hasMore, data.length]);

  return (
    <div style={{ height: 320 }}>
      <Excelat
        mode="table"
        columns={columns}
        data={data}
        virtualization={true}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={handleLoadMore}
        selectionStyle="subtle"
      />
    </div>
  );
}`;

  return (
    <div className="docs-section-page">
      <div className="docs-page-header">
        <div className="docs-breadcrumb">
          <span>Performance & Scale</span> / <span>Pagination & Infinite Scroll</span>
        </div>
        <h1 className="docs-page-title">Controlled Pagination & Infinite Loading</h1>
        <p className="docs-page-lead">
          Built-in controlled pagination bar supporting both client-side slicing and server-side querying,
          alongside high-performance virtualized infinite scrolling with automatic scroll thresholds.
        </p>
      </div>

      {/* Demo 1: Pagination */}
      <DemoContainer
        title="Server-Side Controlled Pagination Demo"
        badge="Interactive Pagination Studio"
        description="Navigate pages using the first, prev, next, last buttons. Change the page size to 10 or 25 to observe simulated server API loading states."
        code={paginationDemoCode}
        controls={
          <div className="docs-demo-controls-inline">
            <span className="control-group-title">
              <ListOrdered size={14} />
              <span>Page Controls:</span>
            </span>
            <div className="demo-pill-group">
              <span className="docs-status-chip">
                {loading && <Loader2 size={12} className="excelat-spin" />}
                <span>
                  Showing page {page} of {Math.ceil(total / pageSize)} (Total: {total.toLocaleString()} records)
                </span>
              </span>
            </div>
          </div>
        }
      >
        <div style={{ height: 320, width: "100%" }}>
          <Excelat
            mode="table"
            columns={COLUMNS}
            data={pageData}
            loading={loading}
            pagination={{
              mode: "server",
              page,
              pageSize,
              total,
            }}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            selectionStyle="subtle"
          />
        </div>
      </DemoContainer>

      {/* Demo 2: Infinite Scroll */}
      <div style={{ marginTop: 40 }}>
        <DemoContainer
          title="Virtual Infinite Scroll & Incremental Fetch Demo"
          badge="Virtualized Infinite Loader"
          description="Scroll down inside the table viewport. When you approach within 250px of the bottom, Excelat's virtualization engine automatically triggers onLoadMore to fetch and append the next batch of records seamlessly."
          code={infiniteDemoCode}
          controls={
            <div className="docs-demo-controls-inline">
              <span className="control-group-title">
                <Infinity size={14} />
                <span>Dataset State:</span>
              </span>
              <div className="demo-pill-group">
                <span className={`docs-status-chip ${infiniteLoading ? "loading" : hasMore ? "" : "success"}`}>
                  {infiniteLoading ? (
                    <>
                      <Loader2 size={12} className="excelat-spin" />
                      <span>Fetching next 25 records...</span>
                    </>
                  ) : hasMore ? (
                    <>
                      <ArrowDown size={12} />
                      <span>Scroll down to fetch more</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={12} />
                      <span>All {MAX_RECORDS} records loaded</span>
                    </>
                  )}
                </span>
                <span className="docs-status-count">
                  {infiniteData.length} / {MAX_RECORDS} loaded
                </span>
              </div>
              <button
                className="docs-reset-btn"
                onClick={handleResetInfinite}
                title="Reset back to initial 30 records"
              >
                <RotateCcw size={12} />
                <span>Reset Demo</span>
              </button>
            </div>
          }
        >
          <div style={{ height: 320, width: "100%" }}>
            <Excelat
              mode="table"
              columns={INFINITE_COLUMNS}
              data={infiniteData}
              virtualization={true}
              hasMore={hasMore}
              loading={infiniteLoading}
              onLoadMore={handleLoadMore}
              selectionStyle="subtle"
            />
          </div>
        </DemoContainer>
      </div>

      <section className="docs-article-section">
        <h2>Client vs Server Pagination Modes</h2>
        <ul className="docs-bullet-list">
          <li>
            <strong><code>mode="client"</code></strong>: Pass the full dataset into <code>data</code>. Excelat automatically slices the rows according to <code>page</code> and <code>pageSize</code>, integrating smoothly with sorting and filtering.
          </li>
          <li>
            <strong><code>mode="server"</code></strong>: Pass only the current page's slice into <code>data</code>, along with the total count in <code>pagination.total</code>. Excelat renders navigation controls and fires <code>onPageChange</code> / <code>onPageSizeChange</code> for your API calls.
          </li>
        </ul>
      </section>

      <section className="docs-article-section">
        <h2>Infinite Scroll Architecture</h2>
        <p>
          Infinite loading is built directly into Excelat's virtualization pipeline. When <code>virtualization=&#123;true&#125;</code> and <code>hasMore=&#123;true&#125;</code> are provided:
        </p>
        <ul className="docs-bullet-list">
          <li>
            <strong>Scroll Threshold Intercept</strong>: As the user scrolls within 250px of the rendered bottom boundary, Excelat dispatches the <code>onLoadMore</code> callback.
          </li>
          <li>
            <strong>Request Deduplication</strong>: If <code>loading=&#123;true&#125;</code>, duplicate scroll triggers are safely blocked until your asynchronous fetch completes and appends new rows.
          </li>
          <li>
            <strong>Seamless DOM Windowing</strong>: Because virtualization calculates top and bottom spacer heights dynamically, expanding the array from 30 to 1,000+ rows causes zero scroll jumping or DOM reflow penalty.
          </li>
        </ul>
      </section>

      <section className="docs-article-section">
        <h2>Custom Pagination Render Slot</h2>
        <p>
          You can completely replace the default pagination bar by passing the <code>renderPagination</code> prop:
        </p>
        <CodeBlock
          code={`<Excelat
  pagination={{ mode: "server", page: 1, pageSize: 20, total: 500 }}
  renderPagination={({ page, totalPages, onPageChange, loading }) => (
    <div className="my-custom-footer">
      <span>Page {page} / {totalPages}</span>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Back</button>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next</button>
    </div>
  )}
/>`}
          language="tsx"
        />
      </section>

      <section className="docs-article-section">
        <h2>Pagination & Infinite Scroll Props</h2>
        <PropsTable
          props={[
            {
              name: "pagination",
              type: "PaginationConfig",
              description: "Configuration object specifying pagination mode, page, pageSize, and total.",
            },
            {
              name: "virtualization",
              type: "boolean | VirtualizationConfig",
              defaultValue: "false",
              description: "Enables DOM windowing for high performance and infinite scrolling.",
            },
            {
              name: "hasMore",
              type: "boolean",
              defaultValue: "false",
              description: "Signals to the virtualization hook that more records remain to be fetched.",
            },
            {
              name: "loading",
              type: "boolean",
              defaultValue: "false",
              description: "Whether an asynchronous page or chunk request is currently in progress.",
            },
            {
              name: "onLoadMore",
              type: "() => void",
              description: "Callback invoked when user scrolls within 250px of the bottom boundary.",
            },
            {
              name: "onPageChange",
              type: "(page: number) => void",
              description: "Invoked when a pagination button or target page is selected.",
            },
            {
              name: "onPageSizeChange",
              type: "(pageSize: number) => void",
              description: "Invoked when the user selects a new page size from the dropdown.",
            },
            {
              name: "renderPagination",
              type: "(props: RenderPaginationProps) => ReactNode",
              description: "Custom render function replacing the default pagination navigation bar.",
            },
          ]}
        />
      </section>

      <SectionNav currentSection="pagination" onSelectSection={onSelectSection} />
    </div>
  );
};
