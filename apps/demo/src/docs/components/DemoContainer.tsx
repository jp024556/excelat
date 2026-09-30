import React, { useState } from "react";
import { Code2, Eye } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface DemoContainerProps {
  title: string;
  badge?: string;
  description?: string;
  controls?: React.ReactNode;
  code: string;
  children: React.ReactNode;
}

export const DemoContainer: React.FC<DemoContainerProps> = ({
  title,
  description,
  controls,
  code,
  children,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  return (
    <div className="docs-demo-container">
      <div className="docs-demo-header">
        <div className="docs-demo-info">
          <h3 className="docs-demo-title">{title}</h3>
          {description && <p className="docs-demo-desc">{description}</p>}
        </div>

        <div className="docs-demo-tab-toggles">
          <button
            className={`docs-demo-tab ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
            aria-label="View component preview"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
          <button
            className={`docs-demo-tab ${activeTab === "code" ? "active" : ""}`}
            onClick={() => setActiveTab("code")}
            aria-label="View component code"
          >
            <Code2 size={13} />
            <span>Code</span>
          </button>
        </div>
      </div>

      {controls && activeTab === "preview" && (
        <div className="docs-demo-controls-bar">{controls}</div>
      )}

      <div className="docs-demo-body">
        {activeTab === "preview" ? (
          <div className="docs-demo-canvas">{children}</div>
        ) : (
          <div className="docs-demo-code-pane">
            <CodeBlock code={code} language="tsx" />
          </div>
        )}
      </div>
    </div>
  );
};
