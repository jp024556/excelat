import { useState, useEffect } from "react";
import { DocSectionId } from "./docs/types";
import { ALL_SECTIONS } from "./docs/docsData";
import { Header } from "./docs/components/Header";
import { Sidebar } from "./docs/components/Sidebar";

// Documentation Section Components
import { OverviewSection } from "./docs/sections/OverviewSection";
import { ModesSection } from "./docs/sections/ModesSection";
import { DataModelSection } from "./docs/sections/DataModelSection";
import { CustomCellsSection } from "./docs/sections/CustomCellsSection";
import { SortingSection } from "./docs/sections/SortingSection";
import { FilteringSection } from "./docs/sections/FilteringSection";
import { GroupingSection } from "./docs/sections/GroupingSection";
import { VirtualizationSection } from "./docs/sections/VirtualizationSection";
import { PaginationSection } from "./docs/sections/PaginationSection";
import { ColumnReorderSection } from "./docs/sections/ColumnReorderSection";
import { OperationsSection } from "./docs/sections/OperationsSection";
import { StatePersistenceSection } from "./docs/sections/StatePersistenceSection";
import { ToolbarContextMenuSection } from "./docs/sections/ToolbarContextMenuSection";
import { ApiReferenceSection } from "./docs/sections/ApiReferenceSection";

import "./App.css";

function getSectionFromHash(): DocSectionId {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const found = ALL_SECTIONS.find((s) => s.id === hash);
  return found ? found.id : "overview";
}

export function App() {
  const [currentSection, setCurrentSection] = useState<DocSectionId>(getSectionFromHash);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("excelat-docs-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "dark"; // Default to dark mode for sleek developer aesthetics
  });

  // Sync dark class on html root and persist to localStorage
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("excelat-docs-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Sync hash on mount and hashchange event
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentSection(getSectionFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSelectSection = (id: DocSectionId) => {
    setCurrentSection(id);
    window.location.hash = `#/${id}`;
    setIsSidebarOpen(false);
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "overview":
        return <OverviewSection onSelectSection={handleSelectSection} />;
      case "modes":
        return <ModesSection onSelectSection={handleSelectSection} />;
      case "data-model":
        return <DataModelSection onSelectSection={handleSelectSection} />;
      case "custom-cells":
        return <CustomCellsSection onSelectSection={handleSelectSection} />;
      case "sorting":
        return <SortingSection onSelectSection={handleSelectSection} />;
      case "filtering":
        return <FilteringSection onSelectSection={handleSelectSection} />;
      case "grouping":
        return <GroupingSection onSelectSection={handleSelectSection} />;
      case "virtualization":
        return <VirtualizationSection onSelectSection={handleSelectSection} />;
      case "pagination":
        return <PaginationSection onSelectSection={handleSelectSection} />;
      case "column-reorder":
        return <ColumnReorderSection onSelectSection={handleSelectSection} />;
      case "operations":
        return <OperationsSection onSelectSection={handleSelectSection} />;
      case "state-persistence":
        return <StatePersistenceSection onSelectSection={handleSelectSection} />;
      case "toolbar-context":
        return <ToolbarContextMenuSection onSelectSection={handleSelectSection} />;
      case "api-reference":
        return <ApiReferenceSection onSelectSection={handleSelectSection} />;
      default:
        return <OverviewSection onSelectSection={handleSelectSection} />;
    }
  };

  return (
    <div className="docs-app">
      <Header
        currentSection={currentSection}
        onSelectSection={handleSelectSection}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="docs-main-layout">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={handleSelectSection}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {isSidebarOpen && (
          <div
            className="docs-sidebar-backdrop"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="docs-content-container">
          <div className="docs-content-wrapper">{renderCurrentSection()}</div>
        </main>
      </div>
    </div>
  );
}

export default App;
