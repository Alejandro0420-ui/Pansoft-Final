import { useState, useEffect } from "react";
import { productsAPI, suppliesAPI } from "../services/api";
import { Plus, Search, Edit2, Box, List, Grid3x3 } from "lucide-react";
import { toast } from "sonner";
import "bootstrap/dist/css/bootstrap.min.css";

const FINISHED_PRODUCTS_CATEGORIES = [
  "Panes",
  "Pastelería",
  "Tortas",
  "Donas",
  "Galletas",
  "Muffins",
  "Salados",
];
const SUPPLIES_CATEGORIES = [
  "Harinas",
  "Endulzantes",
  "Levaduras",
  "Lácteos",
  "Saborizantes",
  "Condimentos",
];

export function Products() {
  const [products, setProducts] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [activeTab, setActiveTab] = useState("productos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    category: "",
    stock_quantity: "",
    min_stock_level: "",
    unit: "kg",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [productsRes, suppliesRes] = await Promise.all([
        productsAPI.getAll(),
        suppliesAPI.getAll(),
      ]);
      setProducts(productsRes.data || productsRes || []);
      setSupplies(suppliesRes.data || suppliesRes || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      price: "",
      category: "",
      stock_quantity: "",
      min_stock_level: "",
      unit: "kg",
    });
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingProduct(item);
    setFormData({
      name: item.name || "",
      sku: item.sku || "",
      description: item.description || "",
      price: item.price || "",
      category: item.category || "",
      stock_quantity: item.stock_quantity || "",
      min_stock_level: item.min_stock_level || "",
      unit: item.unit || "kg",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.sku ||
      !formData.category ||
      !formData.price
    ) {
      toast.error("Complete todos los campos requeridos");
      return;
    }

    try {
      const api = activeTab === "productos" ? productsAPI : suppliesAPI;
      const itemList = activeTab === "productos" ? products : supplies;

      // Validar duplicados
      if (
        itemList.some(
          (item) =>
            item.sku.toLowerCase() === formData.sku.toLowerCase() &&
            (!editingProduct || item.id !== editingProduct.id),
        )
      ) {
        toast.error(`El SKU "${formData.sku}" ya existe`);
        return;
      }

      if (editingProduct) {
        await api.update(editingProduct.id, formData);
        toast.success(
          `${activeTab === "productos" ? "Producto" : "Insumo"} actualizado`,
        );
      } else {
        await api.create(formData);
        toast.success(
          `${activeTab === "productos" ? "Producto" : "Insumo"} agregado`,
        );
      }

      loadAllData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar");
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.is_active !== 0 ? "desactivar" : "activar";
    if (
      window.confirm(
        `¿${newStatus === "desactivar" ? "Deshabilitar" : "Habilitar"} este ${activeTab === "productos" ? "producto" : "insumo"}?`,
      )
    ) {
      try {
        const api = activeTab === "productos" ? productsAPI : suppliesAPI;
        const response = await api.toggleStatus(item.id);

        // Actualizar el item localmente
        const newState = newStatus === "desactivar" ? 0 : 1;
        if (activeTab === "productos") {
          setProducts(
            products.map((p) =>
              p.id === item.id ? { ...p, is_active: newState } : p,
            ),
          );
        } else {
          setSupplies(
            supplies.map((s) =>
              s.id === item.id ? { ...s, is_active: newState } : s,
            ),
          );
        }

        toast.success("Estado actualizado");
      } catch (error) {
        toast.error("Error al actualizar estado");
      }
    }
  };

  const filteredItems =
    activeTab === "productos"
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : supplies.filter(
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
    total: activeTab === "productos" ? products.length : supplies.length,
    active:
      activeTab === "productos"
        ? products.filter((p) => p.is_active !== 0).length
        : supplies.filter((s) => s.is_active !== 0).length,
    critical: filteredItems.filter((p) => p.stock_quantity <= p.min_stock_level)
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
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header & Controls Wrapper */}
      <div style={{ flex: "0 0 auto", overflowY: "auto", padding: "1rem" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">Gestión de Productos</h1>
            <p className="text-muted">Administre productos e insumos</p>
          </div>
          <button
            onClick={openAddModal}
            className="btn"
            style={{ backgroundColor: "#EA7028", color: "white" }}
          >
            <Plus size={18} className="me-2" style={{ display: "inline" }} />
            Nuevo
          </button>
        </div>

        {/* Tabs */}
        <ul
          className="nav nav-tabs mb-4"
          style={{ borderBottomColor: "#EBB583" }}
        >
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "productos" ? "active" : ""}`}
              style={{
                backgroundColor:
                  activeTab === "productos" ? "#EA7028" : "transparent",
                color: activeTab === "productos" ? "white" : "#333",
                border: "none",
              }}
              onClick={() => {
                setActiveTab("productos");
                setSearchTerm("");
              }}
            >
              📦 Productos ({products.filter((p) => p.is_active !== 0).length}/
              {products.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "insumos" ? "active" : ""}`}
              style={{
                backgroundColor:
                  activeTab === "insumos" ? "#EA7028" : "transparent",
                color: activeTab === "insumos" ? "white" : "#333",
                border: "none",
              }}
              onClick={() => {
                setActiveTab("insumos");
                setSearchTerm("");
              }}
            >
              🏭 Insumos ({supplies.filter((s) => s.is_active !== 0).length}/
              {supplies.length})
            </button>
          </li>
        </ul>

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
                    placeholder={`Buscar ${activeTab === "productos" ? "producto" : "insumo"} por nombre o SKU...`}
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
      </div>

      {/* Content - List View */}
      {viewMode === "list" && (
        <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#EBB583" }}>
                  <tr>
                    <th>Nombre</th>
                    <th>SKU</th>
                    <th>Categoría</th>
                    <th>Precio</th>
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
                        style={{ opacity: isActive ? 1 : 0.5 }}
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
                          COP $
                          {Number(item.price).toLocaleString("es-CO", {
                            minimumFractionDigits: 0,
                          })}
                        </td>
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
                            onClick={() => openEditModal(item)}
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
        <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
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
                    style={{ opacity: isActive ? 1 : 0.6 }}
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
                      <p className="card-text small mb-2">
                        <strong>Precio:</strong> COP $
                        {Number(item.price).toLocaleString("es-CO", {
                          minimumFractionDigits: 0,
                        })}
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
                          onClick={() => openEditModal(item)}
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

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">
                  {editingProduct
                    ? `Editar ${activeTab === "productos" ? "Producto" : "Insumo"}`
                    : `Nuevo ${activeTab === "productos" ? "Producto" : "Insumo"}`}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">SKU *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Categoría *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="">Seleccione</option>
                      {(activeTab === "productos"
                        ? FINISHED_PRODUCTS_CATEGORIES
                        : SUPPLIES_CATEGORIES
                      ).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Precio *</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Stock Actual</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Stock Mínimo</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.min_stock_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_stock_level: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Unidad</label>
                    <select
                      className="form-select"
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="ml">ml</option>
                      <option value="un">un</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: "#EA7028", color: "white" }}
                  onClick={handleSave}
                >
                  {editingProduct ? "Guardar Cambios" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
