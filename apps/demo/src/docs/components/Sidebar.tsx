import React, { useState, useMemo } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { DocSectionId } from "../types";
import { DOC_CATEGORIES } from "../docsData";

interface SidebarProps {
  currentSection: DocSectionId;
  onSelectSection: (id: DocSectionId) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return DOC_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return DOC_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const handleItemClick = (id: DocSectionId) => {
    onSelectSection(id);
    onCloseMobile?.();
  };

  return (
    <aside className={`docs-sidebar ${isOpen ? "open" : ""}`}>
      <div className="docs-sidebar-mobile-header">
        <div className="docs-brand" onClick={() => handleItemClick("overview")}>
          <img
            src="/logo.svg"
            alt="Excelat"
            width={24}
            height={24}
            className="docs-brand-logo-img"
          />
          <span className="docs-brand-name">Excelat</span>
          <span className="docs-brand-badge">v1.0.0</span>
        </div>
        <button
          className="docs-sidebar-close-btn"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <div className="docs-sidebar-search">
        <div className="docs-search-input-wrapper">
          <Search size={14} className="docs-search-icon" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="docs-search-input"
          />
          {searchQuery && (
            <button
              className="docs-search-clear"
              onClick={() => setSearchQuery("")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <nav className="docs-sidebar-nav">
        {filteredCategories.map((category) => (
          <div key={category.title} className="docs-nav-category">
            <h4 className="docs-nav-category-title">{category.title}</h4>
            <ul className="docs-nav-list">
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <li key={item.id} className="docs-nav-item">
                    <a
                      href={`#/${item.id}`}
                      className={`docs-nav-btn ${isActive ? "active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleItemClick(item.id);
                      }}
                    >
                      <div className="docs-nav-btn-icon">
                        <Icon size={15} />
                      </div>
                      <span className="docs-nav-btn-label">{item.title}</span>
                      {item.badge && (
                        <span className="docs-nav-item-badge">{item.badge}</span>
                      )}
                      {isActive && (
                        <ChevronRight
                          size={13}
                          className="docs-nav-active-chevron"
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="docs-sidebar-footer">
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
      </div>
    </aside>
  );
};
