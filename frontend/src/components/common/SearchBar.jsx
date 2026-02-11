import React from "react";
import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  onExtraAction,
}) {
  return (
    <div className="mb-4">
      <div className="input-group">
        <span className="input-group-text" style={{ borderColor: "#EBB583" }}>
          <Search size={20} className="text-muted" />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ borderColor: "#EBB583" }}
        />
      </div>
    </div>
  );
}
