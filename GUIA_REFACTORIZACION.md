# 🛠️ Guía de Refactorización - Componentes Pendientes

## Componentes Pendientes de Refactorizar

| Componente    | Líneas | Estado           |
| ------------- | ------ | ---------------- |
| products.jsx  | 845    | ⏳ Pendiente     |
| suppliers.jsx | 548    | ⏳ Pendiente     |
| customers.jsx | 352    | ⏳ Pendiente     |
| employees.jsx | 312    | ⏳ Pendiente     |
| dashboard.jsx | 237    | ✅ Ya optimizado |
| billing.jsx   | 315    | ⏳ Pendiente     |
| reports.jsx   | 130    | ✅ Ya pequeño    |
| login.jsx     | 102    | ✅ Ya pequeño    |

---

## 📋 Paso a Paso: Refactorizar `products.jsx` (845 → ~250 líneas)

### Estructura Objetivo

```
products/
├── ProductsHeader.jsx          - Encabezado
├── ProductsStats.jsx           - Estadísticas
├── ProductsControls.jsx        - Búsqueda y filtros
├── ProductsTable.jsx           - Vista tabla
├── ProductsGrid.jsx            - Vista grid
├── ProductModal.jsx            - Modal para crear/editar
└── StatusBadge.jsx             - Componente badge de estado
```

### Paso 1: Crear ProductsStats.jsx

```jsx
// src/components/products/ProductsStats.jsx
import { StatCard } from "../common";
import { Package, AlertTriangle, TrendingUp } from "lucide-react";

export function ProductsStats({ products, supplies }) {
  const totalProducts = products.length;
  const lowStock = products.filter(
    (p) => p.stock_quantity <= p.min_stock_level * 1.5,
  ).length;
  const activeProducts = products.filter((p) => p.is_active !== false).length;

  return (
    <div className="row mb-4 g-3">
      <div className="col-md-3">
        <StatCard
          label="Total Productos"
          value={totalProducts}
          icon={Package}
        />
      </div>
      <div className="col-md-3">
        <StatCard
          label="Stock Bajo"
          value={lowStock}
          icon={AlertTriangle}
          color="#ffc107"
        />
      </div>
      <div className="col-md-3">
        <StatCard
          label="Productos Activos"
          value={activeProducts}
          icon={TrendingUp}
          color="#28a745"
        />
      </div>
      <div className="col-md-3">
        <StatCard
          label="Insumos"
          value={supplies.length}
          icon={Package}
          color="#17a2b8"
        />
      </div>
    </div>
  );
}
```

### Paso 2: Crear ProductsControls.jsx

```jsx
// src/components/products/ProductsControls.jsx
import { Search, Grid3x3, List, Plus } from "lucide-react";

export function ProductsControls({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAddProduct,
  activeTab,
}) {
  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <button
          className="btn text-white"
          style={{ backgroundColor: "#EA7028" }}
          onClick={onAddProduct}
        >
          <Plus size={18} className="me-2" />
          Agregar {activeTab === "productos" ? "Producto" : "Insumo"}
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span
                  className="input-group-text"
                  style={{ borderColor: "#EBB583" }}
                >
                  <Search size={20} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar productos..."
                  style={{ borderColor: "#EBB583" }}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-end">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${viewMode === "grid" ? "btn-warning text-white" : "btn-outline-warning"}`}
                  style={{
                    backgroundColor:
                      viewMode === "grid" ? "#EA7028" : "transparent",
                    color: viewMode === "grid" ? "white" : "#EA7028",
                    borderColor: "#EA7028",
                  }}
                  onClick={() => onViewModeChange("grid")}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === "list" ? "btn-warning text-white" : "btn-outline-warning"}`}
                  style={{
                    backgroundColor:
                      viewMode === "list" ? "#EA7028" : "transparent",
                    color: viewMode === "list" ? "white" : "#EA7028",
                    borderColor: "#EA7028",
                  }}
                  onClick={() => onViewModeChange("list")}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

### Paso 3: Crear ProductModal.jsx

```jsx
// src/components/products/ProductModal.jsx
import { Modal } from "../common";
import { FormInput } from "../common/FormInput";

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  imageFile,
  onImageChange,
  imagePreview,
  activeTab,
  isEditing,
}) {
  const categories =
    activeTab === "productos"
      ? [
          "Panes",
          "Pastelería",
          "Tortas",
          "Donas",
          "Galletas",
          "Muffins",
          "Salados",
        ]
      : [
          "Harinas",
          "Endulzantes",
          "Levaduras",
          "Lácteos",
          "Saborizantes",
          "Condimentos",
        ];

  return (
    <Modal
      isOpen={isOpen}
      title={
        isEditing
          ? `Editar ${activeTab === "productos" ? "Producto" : "Insumo"}`
          : `Nuevo ${activeTab === "productos" ? "Producto" : "Insumo"}`
      }
      onClose={onClose}
      size="lg"
      footer={
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn text-white"
            style={{ backgroundColor: "#EA7028" }}
            onClick={onSubmit}
          >
            {isEditing ? "Actualizar" : "Crear"}
          </button>
        </div>
      }
    >
      <div className="row mb-3">
        <div className="col-md-6">
          <FormInput
            label="Nombre"
            value={formData.name}
            onChange={(v) => onFormChange("name", v)}
            required
            placeholder="Nombre del producto"
          />
        </div>
        <div className="col-md-6">
          <FormInput
            label="SKU"
            value={formData.sku}
            onChange={(v) => onFormChange("sku", v)}
            required
            placeholder="SKU-001"
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <FormInput
            label="Categoría"
            type="select"
            value={formData.category}
            onChange={(v) => onFormChange("category", v)}
            options={categories.map((c) => ({ value: c, label: c }))}
            required
          />
        </div>
        <div className="col-md-6">
          <FormInput
            label="Precio"
            type="number"
            value={formData.price}
            onChange={(v) => onFormChange("price", v)}
            required
            step="0.01"
          />
        </div>
      </div>

      <FormInput
        label="Descripción"
        type="textarea"
        value={formData.description}
        onChange={(v) => onFormChange("description", v)}
        placeholder="Descripción del producto"
      />

      <div className="row mb-3">
        <div className="col-md-4">
          <FormInput
            label="Stock"
            type="number"
            value={formData.stock_quantity}
            onChange={(v) => onFormChange("stock_quantity", v)}
          />
        </div>
        <div className="col-md-4">
          <FormInput
            label="Stock Mínimo"
            type="number"
            value={formData.min_stock_level}
            onChange={(v) => onFormChange("min_stock_level", v)}
          />
        </div>
        <div className="col-md-4">
          <FormInput
            label="Unidad"
            type="select"
            value={formData.unit}
            onChange={(v) => onFormChange("unit", v)}
            options={[
              { value: "kg", label: "Kilogramos" },
              { value: "unidades", label: "Unidades" },
              { value: "litros", label: "Litros" },
            ]}
          />
        </div>
      </div>

      {activeTab === "insumos" && (
        <FormInput
          label="Proveedor"
          value={formData.supplier}
          onChange={(v) => onFormChange("supplier", v)}
          placeholder="Nombre del proveedor"
        />
      )}

      <div className="mb-3">
        <label className="form-label">Imagen</label>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              marginBottom: "1rem",
            }}
          />
        )}
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={onImageChange}
        />
      </div>
    </Modal>
  );
}
```

### Paso 4: Usar estos componentes en products.jsx refactorizado

```jsx
// src/components/products.jsx (versión refactorizada)
import { useState, useEffect } from "react";
import { productsAPI, suppliesAPI } from "../services/api";
import { toast } from "sonner";
import { ProductsStats } from "./products/ProductsStats";
import { ProductsControls } from "./products/ProductsControls";
import { ProductModal } from "./products/ProductModal";
import { DataTable } from "./common";

export function Products() {
  // Estados...
  const [products, setProducts] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [activeTab, setActiveTab] = useState("productos");
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
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

  // Lógica...
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, suppliesRes] = await Promise.all([
        productsAPI.getAll(),
        suppliesAPI.getAll(),
      ]);
      setProducts(productsRes.data || []);
      setSupplies(suppliesRes.data || []);
    } catch (error) {
      toast.error("Error al cargar datos");
    }
  };

  // ... resto de la lógica ...

  return (
    <div className="products-area p-4">
      <div className="mb-4">
        <h1 style={{ fontFamily: "Open Sans, sans-serif" }}>
          Gestión de Productos
        </h1>
        <p className="text-muted" style={{ fontFamily: "Roboto, sans-serif" }}>
          Administre productos e insumos
        </p>
      </div>

      <ProductsStats products={products} supplies={supplies} />

      {/* Tabs */}
      <div className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "productos" ? "active" : ""}`}
              onClick={() => setActiveTab("productos")}
            >
              📦 Productos ({products.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "insumos" ? "active" : ""}`}
              onClick={() => setActiveTab("insumos")}
            >
              🏭 Insumos ({supplies.length})
            </button>
          </li>
        </ul>
      </div>

      <ProductsControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddProduct={() => {
          setEditingProduct(null);
          setFormData({
            /* reset form */
          });
          setShowModal(true);
        }}
        activeTab={activeTab}
      />

      {/* Vista Grid o Table */}
      {viewMode === "grid" ? (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {/* Grid items aquí */}
        </div>
      ) : (
        <DataTable
          columns={[
            { label: "SKU", accessor: "sku" },
            { label: "Nombre", accessor: "name" },
            { label: "Categoría", accessor: "category" },
            { label: "Precio", accessor: "price" },
            { label: "Stock", accessor: "stock_quantity" },
          ]}
          data={activeTab === "productos" ? products : supplies}
          loading={false}
          rowActions={(row) => (
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-primary">Editar</button>
              <button className="btn btn-outline-danger">Eliminar</button>
            </div>
          )}
        />
      )}

      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
        onFormChange={(field, value) =>
          setFormData({ ...formData, [field]: value })
        }
        onSubmit={handleSubmit}
        activeTab={activeTab}
        isEditing={editingProduct !== null}
      />
    </div>
  );
}
```

---

## 📋 Patrones para `suppliers.jsx` y `customers.jsx`

Ambos componentes tienen estructura similar. Usa:

1. ✅ `DataTable` componente reutilizable
2. ✅ Modal genérico para crear/editar
3. ✅ `StatCard` para estadísticas
4. ✅ Componentes de búsqueda reutilizables

### Estructura recomendada para suppliers

```
suppliers/
├── SuppliersStats.jsx
├── SupplierModal.jsx
└── (usa DataTable común)
```

### Estructura recomendada para customers

```
customers/
├── CustomersStats.jsx
├── CustomerModal.jsx
└── (usa DataTable común)
```

---

## ✅ Checklist de Refactorización

```
□ Identificar secciones repetidas
□ Extraer modales a componentes
□ Crear componentes para stats/cards
□ Usar DataTable componente reutilizable
□ Extraer controles (búsqueda, filtros)
□ Probar que la funcionalidad sigue igual
□ Reducir líneas de código
□ Documentar cambios
□ Commit a git
```

---

## 🎯 Objetivos Finales

| Componente    | Líneas Actuales | Objetivo | Reducción |
| ------------- | --------------- | -------- | --------- |
| products.jsx  | 845             | ~250     | 70%       |
| suppliers.jsx | 548             | ~150     | 73%       |
| customers.jsx | 352             | ~100     | 72%       |
| employees.jsx | 312             | ~100     | 68%       |
| billing.jsx   | 315             | ~150     | 52%       |
| **TOTAL**     | **~4.3K**       | **~1K**  | **77%**   |

---

## 🚀 Resultado Esperado

Con estas refactorizaciones:

- ✅ 77% menos líneas de código
- ✅ Componentes más reutilizables
- ✅ Más fácil de mantener
- ✅ Mejor testabilidad
- ✅ Estilos consistentes
- ✅ Escalable a nuevas funcionalidades

---

**¿Listo para empezar?** Sigue este paso a paso y obtendrás una codebase mucho más limpia y mantenible.
