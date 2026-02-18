import { useState, useEffect } from "react";
import { suppliesAPI } from "../services/api";
import { Search, Edit2, Box, List, Grid3x3 } from "lucide-react";
import { toast } from "sonner";
import "bootstrap/dist/css/bootstrap.min.css";

const SUPPLIES_CATEGORIES = [
  "Harinas",
  "Endulzantes",
  "Levaduras",
  "Lácteos",
  "Saborizantes",
  "Condimentos",
];

export function SuppliesSection({
  supplies = [],
  onShowModal,
  onEditProduct,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, []);

  const handleToggleStatus = async (item) => {
    const newStatus = item.is_active !== 0 ? "desactivar" : "activar";
    if (
      window.confirm(
        `¿${newStatus === "desactivar" ? "Deshabilitar" : "Habilitar"} este insumo?`,
      )
    ) {
      try {
        await suppliesAPI.toggleStatus(item.id);
        toast.success("Estado actualizado");
        // Recargar insumos del padre para reflejar el cambio
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        toast.error("Error al actualizar estado");
      }
    }
  };

  const filteredItems = supplies.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock)
      return {
        style: { backgroundColor: "#DC3545", color: "white" },
        text: "Crítico",
      };
    if (stock <= minStock * 1.5)
      return {
        style: { backgroundColor: "#EBA94D", color: "white" },
        text: "Bajo",
      };
    return {
      style: { backgroundColor: "#EBCC83", color: "white" },
      text: "Normal",
    };
  };

  const getStats = () => ({
    total: supplies.length,
    active: supplies.filter((s) => s.is_active !== 0).length,
    critical: filteredItems.filter((s) => s.stock_quantity <= s.min_stock_level)
      .length,
  });

  const stats = getStats();

  if (loading)
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-warning"></div>
        <p className="mt-3">Cargando...</p>
      </div>
    );

  return (
    <>
      {/* Stats */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm"
            style={{ borderTop: `4px solid #EA7028` }}
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted d-block">Total</small>
                <h4 className="mb-0">{stats.total}</h4>
              </div>
              <Box size={32} color="#EA7028" />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm"
            style={{ borderTop: `4px solid #EBA94D` }}
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted d-block">Activos</small>
                <h4 className="mb-0">{stats.active}</h4>
              </div>
              <Box size={32} color="#EBA94D" />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm"
            style={{ borderTop: `4px solid #EBCC83` }}
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted d-block">Stock Crítico</small>
                <h4 className="mb-0">{stats.critical}</h4>
              </div>
              <Box size={32} color="#EBCC83" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={18} color="#999" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Buscar insumo por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4 d-flex gap-2 justify-content-end">
              <button
                onClick={() => setViewMode("list")}
                className={`btn ${viewMode === "list" ? "btn-warning" : "btn-outline-secondary"}`}
                title="Vista de Lista"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`btn ${viewMode === "grid" ? "btn-warning" : "btn-outline-secondary"}`}
                title="Vista de Tarjetas"
              >
                <Grid3x3 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - List View */}
      {viewMode === "list" && (
        <div>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#EBB583" }}>
                  <tr>
                    <th>Nombre</th>
                    <th>SKU</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const status = getStockStatus(
                      item.stock_quantity,
                      item.min_stock_level,
                    );
                    const isActive = item.is_active !== 0;
                    return (
                      <tr
                        key={item.id}
                        className="align-middle"
                        style={{
                          opacity: isActive ? 1 : 0.75,
                          filter: isActive ? "none" : "grayscale(30%)",
                        }}
                      >
                        <td>
                          <div className="d-flex align-items-center">
                            {item.image_url && (
                              <img
                                src={`http://localhost:5000${item.image_url}`}
                                alt={item.name}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  marginRight: "10px",
                                  borderRadius: "4px",
                                }}
                              />
                            )}
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>
                          <code>{item.sku}</code>
                        </td>
                        <td>{item.category}</td>
                        <td>
                          <span className="badge" style={status.style}>
                            {item.stock_quantity} {item.unit || "un"}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: isActive ? "#EBCC83" : "#6C757D",
                              color: "white",
                            }}
                          >
                            {isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => onEditProduct(item)}
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`btn btn-sm ${isActive ? "btn-outline-danger" : "btn-outline-success"}`}
                          >
                            {isActive ? "Deshabilitar" : "Habilitar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredItems.length === 0 && (
              <div className="alert alert-info text-center m-3 mb-0">
                No hay resultados que coincidan con tu búsqueda
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content - Grid View */}
      {viewMode === "grid" && (
        <div>
          <div className="row g-4">
            {filteredItems.map((item) => {
              const status = getStockStatus(
                item.stock_quantity,
                item.min_stock_level,
              );
              const isActive = item.is_active !== 0;
              return (
                <div key={item.id} className="col-md-6 col-lg-4">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{
                      opacity: isActive ? 1 : 0.8,
                      filter: isActive ? "none" : "grayscale(30%)",
                    }}
                  >
                    {item.image_url && (
                      <img
                        src={`http://localhost:5000${item.image_url}`}
                        alt={item.name}
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text text-muted small">{item.sku}</p>
                      <p className="card-text small mb-2">
                        <strong>Categoría:</strong> {item.category}
                      </p>
                      <div className="mb-3">
                        <span className="badge" style={status.style}>
                          {item.stock_quantity} {item.unit || "un"}
                        </span>
                        <span
                          className="badge ms-2"
                          style={{
                            backgroundColor: isActive ? "#EBCC83" : "#6C757D",
                            color: "white",
                          }}
                        >
                          {isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top">
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => onEditProduct(item)}
                          className="btn btn-sm btn-outline-primary flex-grow-1"
                        >
                          <Edit2
                            size={14}
                            className="me-1"
                            style={{ display: "inline" }}
                          />
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`btn btn-sm flex-grow-1 ${isActive ? "btn-outline-danger" : "btn-outline-success"}`}
                        >
                          {isActive ? "Deshabilitar" : "Habilitar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="col-12">
                <div className="alert alert-info text-center">
                  No hay resultados que coincidan con tu búsqueda
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
