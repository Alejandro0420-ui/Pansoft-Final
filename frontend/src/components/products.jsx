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
  "Otros",
];
const SUPPLIES_CATEGORIES = [
  "Harinas",
  "Endulzantes",
  "Levaduras",
  "Lácteos",
  "Saborizantes",
  "Condimentos",
  "Otros",
];

export function Products() {
  const [activeTab, setActiveTab] = useState("productos");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
      console.log("📥 Cargando productos e insumos...");
      const [productsRes, suppliesRes] = await Promise.all([
        productsAPI.getAll(),
        suppliesAPI.getAll(),
      ]);
      console.log("✅ Productos recibidos:", productsRes);
      console.log("✅ Insumos recibidos:", suppliesRes);
      setProducts(productsRes.data || productsRes || []);
      setSupplies(suppliesRes.data || suppliesRes || []);
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
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
    setImageFile(null);
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
    console.log("🔍 handleSave ejecutado", { formData, activeTab });

    if (
      !formData.name ||
      !formData.sku ||
      !formData.category ||
      !formData.price
    ) {
      console.warn(" Campos requeridos faltando", {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: formData.price,
      });
      const mensaje = "Complete todos los campos requeridos";
      alert(mensaje);
      toast.error(mensaje);
      return;
    }

    setIsLoading(true);
    try {
      const api = activeTab === "productos" ? productsAPI : suppliesAPI;
      const itemList = activeTab === "productos" ? products : supplies;
      console.log("📤 Enviando datos:", {
        api,
        activeTab,
        itemList: itemList.length,
      });

      // Validar duplicados por SKU
      if (
        itemList.some(
          (item) =>
            item.sku.toLowerCase() === formData.sku.toLowerCase() &&
            (!editingProduct || item.id !== editingProduct.id),
        )
      ) {
        const mensaje = `El SKU "${formData.sku}" ya existe en la sistema. Por favor usa uno diferente.`;
        console.warn(mensaje);
        alert(mensaje);
        toast.error(mensaje);
        setIsLoading(false);
        return;
      }

      // Validar duplicados por Nombre
      if (
        itemList.some(
          (item) =>
            item.name.toLowerCase() === formData.name.toLowerCase() &&
            (!editingProduct || item.id !== editingProduct.id),
        )
      ) {
        const mensaje = ` El nombre "${formData.name}" ya existe en el sistema. Por favor usa uno diferente.`;
        console.warn(mensaje);
        alert(mensaje);
        toast.error(mensaje);
        setIsLoading(false);
        return;
      }

      // Crear FormData para enviar archivos
      const data = new FormData();
      data.append("name", formData.name);
      data.append("sku", formData.sku);
      data.append("description", formData.description || "");
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("stock_quantity", formData.stock_quantity || 0);
      data.append("min_stock_level", formData.min_stock_level || 0);
      if (activeTab === "insumos") {
        data.append("unit", formData.unit || "kg");
      }

      // Agregar imagen si existe
      if (imageFile) {
        data.append("image", imageFile);
      }

      let response;
      if (editingProduct) {
        console.log(" Actualizando producto:", editingProduct.id);
        response = await api.update(editingProduct.id, data);
        console.log(" Producto actualizado:", response);
        const mensaje = ` ${activeTab === "productos" ? "Producto" : "Insumo"} actualizado exitosamente`;
        alert(mensaje);
        toast.success(mensaje);
      } else {
        console.log("Creando nuevo producto...");
        response = await api.create(data);
        console.log("Producto creado:", response);
        const mensaje = `${activeTab === "productos" ? "Producto" : "Insumo"} creado exitosamente`;
        alert(mensaje);
        toast.success(mensaje);
      }

      console.log("Cerrando modal y recargando datos...");
      setShowModal(false);
      resetForm();
      // Recargar datos después de cerrar modal
      setTimeout(() => {
        console.log("Recargando datos...");
        loadAllData();
      }, 500);
    } catch (error) {
      console.error("Error completo al guardar:", error);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Message:", error.message);

      // Extraer el mensaje de error más descriptivo
      const mensajeError =
        error.response?.data?.error ||
        error.message ||
        "Error al guardar el producto";

      console.error("Mensaje de error final:", mensajeError);
      alert(`Error: ${mensajeError}`);
      toast.error(mensajeError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
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
            products={products}
            onShowModal={() => setShowModal(true)}
            onEditProduct={openEditModal}
            onRefresh={loadAllData}
          />
        )}
        {activeTab === "insumos" && (
          <SuppliesSection
            supplies={supplies}
            onShowModal={() => setShowModal(true)}
            onEditProduct={openEditModal}
            onRefresh={loadAllData}
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
                  <div className="col-md-6">
                    <label className="form-label">Imagen (Opcional)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                    />
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Guardando...
                    </>
                  ) : editingProduct ? (
                    "Guardar Cambios"
                  ) : (
                    "Crear"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
