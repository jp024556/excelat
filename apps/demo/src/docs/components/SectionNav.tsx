import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DocSectionId } from "../types";
import { ALL_SECTIONS } from "../docsData";

interface SectionNavProps {
  currentSection: DocSectionId;
  onSelectSection: (id: DocSectionId) => void;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  currentSection,
  onSelectSection,
}) => {
  const currentIndex = ALL_SECTIONS.findIndex((s) => s.id === currentSection);
  const prev = currentIndex > 0 ? ALL_SECTIONS[currentIndex - 1] : null;
  const next =
    currentIndex < ALL_SECTIONS.length - 1
      ? ALL_SECTIONS[currentIndex + 1]
      : null;

  return (
    <div className="docs-bottom-nav">
      {prev ? (
        <button
          className="docs-nav-pager docs-nav-pager-prev"
          onClick={() => onSelectSection(prev.id)}
        >
          <div className="docs-pager-icon">
            <ArrowLeft size={16} />
          </div>
          <div className="docs-pager-text">
            <span className="docs-pager-label">Previous</span>
            <span className="docs-pager-title">{prev.title}</span>
          </div>
        </button>
      ) : (
        <div />
      )}

      {next && (
        <button
          className="docs-nav-pager docs-nav-pager-next"
          onClick={() => onSelectSection(next.id)}
        >
          <div className="docs-pager-text">
            <span className="docs-pager-label">Next</span>
            <span className="docs-pager-title">{next.title}</span>
          </div>
          <div className="docs-pager-icon">
            <ArrowRight size={16} />
          </div>
        </button>
      )}
    </div>
  );
};
