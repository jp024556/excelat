import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "tsx",
  title,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="docs-code-card">
      <div className="docs-code-header">
        <div className="docs-code-title">
          {title ? (
            <span className="docs-code-filename">{title}</span>
          ) : (
            <span className="docs-code-lang">{language.toUpperCase()}</span>
          )}
        </div>
        <button
          className="docs-copy-btn"
          onClick={handleCopy}
          title="Copy code to clipboard"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="docs-code-content">
        <pre>
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
};
