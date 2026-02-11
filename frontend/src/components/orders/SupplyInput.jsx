import { Trash2, Wheat } from "lucide-react";
import { THEME_COLORS } from "./constants";

export function SupplyInput({ supply, onRemove, index }) {
  return (
    <div
      className="d-flex justify-content-between align-items-center p-2 rounded mb-2"
      style={{ backgroundColor: THEME_COLORS.light, opacity: 0.2 }}
    >
      <span className="small">
        <strong>{supply.name}</strong>: {supply.quantity} {supply.unit}
      </span>
      <button className="btn btn-sm text-danger" onClick={() => onRemove(index)}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}
