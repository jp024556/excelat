import React, { useState } from "react";
import { Copy, Check, Menu, X, Sun, Moon } from "lucide-react";
import { DocSectionId } from "../types";

interface HeaderProps {
  currentSection: DocSectionId;
  onSelectSection: (id: DocSectionId) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onSelectSection,
  isSidebarOpen,
  onToggleSidebar,
  theme = "dark",
  onToggleTheme,
}) => {
  const [copiedInstall, setCopiedInstall] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("npm install @excelat/react");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <header className="docs-top-header">
      <div className="docs-header-left">
        <button
          className="docs-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="docs-brand" onClick={() => onSelectSection("overview")}>
          <img
            src="/logo.svg"
            alt="Excelat"
            width={28}
            height={28}
            className="docs-brand-logo-img"
          />
          <span className="docs-brand-name">Excelat</span>
          <span className="docs-brand-badge">v0.1.0</span>
        </div>
      </div>

      <div className="docs-header-center">
        <button
          className="docs-install-badge-btn"
          onClick={handleCopyInstall}
          title="Click to copy install command"
        >
          <span className="docs-install-prompt">$</span>
          <code>npm install @excelat/react</code>
          {copiedInstall ? (
            <Check size={13} className="text-emerald" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>

      <div className="docs-header-right">
        <nav className="docs-header-nav">
          <a
            href="#/overview"
            className={`docs-nav-link ${currentSection !== "api-reference" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectSection("overview");
            }}
          >
            Documentation
          </a>
          <a
            href="#/api-reference"
            className={`docs-nav-link ${currentSection === "api-reference" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectSection("api-reference");
            }}
          >
            API Reference
          </a>
        </nav>

        <div className="docs-header-actions">
          <a
            href="https://statpio.com"
            target="_blank"
            rel="noreferrer"
            className="docs-statpio-badge"
            title="Used in production on Statpio"
          >
            <span className="docs-statpio-pulse"></span>
            <span>Used on Statpio</span>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>

          <button
            type="button"
            className="docs-theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <a
            href="https://github.com/excelat/excelat"
            target="_blank"
            rel="noreferrer"
            className="docs-icon-btn docs-github-btn"
            aria-label="View on GitHub"
            title="GitHub Repository"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};
