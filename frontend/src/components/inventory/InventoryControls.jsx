import { Search, Grid3x3, List, Plus } from "lucide-react";
import { SearchBar } from "../common/SearchBar";

export function InventoryControls({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAddMovement,
}) {
  return (
    <>
      <div className="text-end mb-4">
        <button
          className="btn text-white"
          style={{ backgroundColor: "#EA7028" }}
          onClick={onAddMovement}
        >
          <Plus size={18} className="me-2" />
          Registrar Movimiento
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex gap-3">
            <div className="flex-grow-1 position-relative">
              <Search
                className="position-absolute"
                size={20}
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999",
                }}
              />
              <input
                type="text"
                className="form-control ps-5"
                style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <button
              className="btn"
              style={{
                backgroundColor:
                  viewMode === "grid" ? "#EA7028" : "transparent",
                color: viewMode === "grid" ? "white" : "#EA7028",
                borderColor: "#EBA94D",
                borderWidth: "2px",
              }}
              onClick={() => onViewModeChange("grid")}
              title="Vista de Tarjetas"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              className="btn"
              style={{
                backgroundColor:
                  viewMode === "table" ? "#EA7028" : "transparent",
                color: viewMode === "table" ? "white" : "#EA7028",
                borderColor: "#EBA94D",
                borderWidth: "2px",
              }}
              onClick={() => onViewModeChange("table")}
              title="Vista de Tabla"
            >
              <List size={18} />
            </button>
            <button
              className="btn"
              style={{
                borderColor: "#EBA94D",
                borderWidth: "2px",
                color: "#EA7028",
              }}
              onClick={() => alert("Exportando inventario...")}
            >
              Exportar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
