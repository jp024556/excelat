import React from "react";
import { PropDefinition } from "../types";

interface PropsTableProps {
  title?: string;
  props: PropDefinition[];
}

export const PropsTable: React.FC<PropsTableProps> = ({ title, props }) => {
  return (
    <div className="docs-props-wrapper">
      {title && <h4 className="docs-props-title">{title}</h4>}
      <div className="docs-props-table-container">
        <table className="docs-props-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr key={p.name}>
                <td>
                  <code className="prop-name">
                    {p.name}
                    {p.required && <span className="prop-required">*</span>}
                  </code>
                </td>
                <td>
                  <code className="prop-type">{p.type}</code>
                </td>
                <td>
                  <code className="prop-default">{p.defaultValue ?? "-"}</code>
                </td>
                <td className="prop-desc">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
