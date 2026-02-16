import { useState, useEffect } from "react";
import { productsAPI, suppliesAPI } from "../services/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import "bootstrap/dist/css/bootstrap.min.css";
import { ProductsSection } from "./ProductsSection";
import { SuppliesSection } from "./SuppliesSection";

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
  const [activeTab, setActiveTab] = useState("productos");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [supplies, setSupplies] = useState([]);
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
      const [productsRes, suppliesRes] = await Promise.all([
        productsAPI.getAll(),
        suppliesAPI.getAll(),
      ]);
      setProducts(productsRes.data || productsRes || []);
      setSupplies(suppliesRes.data || suppliesRes || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar datos");
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
            onClick={() => {
              openAddModal();
            }}
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
                resetForm();
              }}
            >
              Productos ({products.filter((p) => p.is_active !== 0).length}/
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
                resetForm();
              }}
            >
              Insumos ({supplies.filter((s) => s.is_active !== 0).length}/
              {supplies.length})
            </button>
          </li>
        </ul>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        {activeTab === "productos" && (
          <ProductsSection
            onShowModal={() => setShowModal(true)}
            onEditProduct={openEditModal}
          />
        )}
        {activeTab === "insumos" && (
          <SuppliesSection
            onShowModal={() => setShowModal(true)}
            onEditProduct={openEditModal}
          />
        )}
      </div>

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
