import { Plus, Search } from "lucide-react";
import { THEME_COLORS } from "./constants";

export function SearchBar({
  searchTerm,
  onSearchChange,
  onNewOrder,
  loading,
  activeTab,
}) {
  return (
    <div className="row mb-4 card-body">
      <div className="col-md-9">
        <div className="input-group">
          <span
            className="input-group-text"
            style={{
              backgroundColor: THEME_COLORS.light,
              borderColor: THEME_COLORS.light,
            }}
          >
            <Search size={18} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder={`Buscar ${
              activeTab === "sales"
                ? "orden de venta"
                : "orden de producción"
            }...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ borderColor: THEME_COLORS.light }}
          />
        </div>
      </div>
      <div className="col-md-3 text-end">
        <button
          className="btn text-white"
          style={{ backgroundColor: THEME_COLORS.primary }}
          onClick={onNewOrder}
          disabled={loading}
        >
          <Plus size={18} className="me-2" style={{ display: "inline" }} />
          Nueva Orden
        </button>
      </div>
    </div>
  );
}
