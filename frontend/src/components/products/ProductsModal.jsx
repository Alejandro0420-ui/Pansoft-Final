export function ProductsModal({
  isOpen,
  onClose,
  editing,
  activeTab,
  formData,
  onFormChange,
  onImageChange,
  imagePreview,
  onSubmit,
  categories,
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={handleBackdropClick}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div
            className="modal-header"
            style={{
              backgroundColor: "#EA7028",
              color: "white",
              borderColor: "#EA7028",
            }}
          >
            <h5 className="modal-title">
              {editing
                ? `Editar ${activeTab === "productos" ? "Producto" : "Insumo"}`
                : `Agregar nuevo ${activeTab === "productos" ? "Producto" : "Insumo"}`}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={onSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre del Producto *</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: "#EBB583" }}
                    placeholder="Ej: Pan Integral"
                    value={formData.name}
                    onChange={(e) => onFormChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">SKU *</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: "#EBB583" }}
                    placeholder="Ej: PAN-002"
                    value={formData.sku}
                    onChange={(e) => onFormChange("sku", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Categoría *</label>
                  <select
                    className="form-select"
                    style={{ borderColor: "#EBB583" }}
                    value={formData.category}
                    onChange={(e) => onFormChange("category", e.target.value)}
                    required
                  >
                    <option value="">Seleccione categoría</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`col-md-${activeTab === "insumos" ? "3" : "6"}`}>
                  <label className="form-label">Precio (COP) *</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ borderColor: "#EBB583" }}
                    placeholder="1500"
                    value={formData.price}
                    onChange={(e) => onFormChange("price", e.target.value)}
                    required
                  />
                </div>
                {activeTab === "insumos" && (
                  <div className="col-md-3">
                    <label className="form-label">Unidad *</label>
                    <select
                      className="form-select"
                      style={{ borderColor: "#EBB583" }}
                      value={formData.unit}
                      onChange={(e) => onFormChange("unit", e.target.value)}
                      required
                    >
                      <option value="kg">kg</option>
                      <option value="litro">litro</option>
                      <option value="docena">docena</option>
                      <option value="unidad">unidad</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Stock Inicial</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ borderColor: "#EBB583" }}
                    placeholder="100"
                    value={formData.stock_quantity}
                    onChange={(e) => onFormChange("stock_quantity", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Stock Mínimo</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ borderColor: "#EBB583" }}
                    placeholder="20"
                    value={formData.min_stock_level}
                    onChange={(e) => onFormChange("min_stock_level", e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  style={{ borderColor: "#EBB583" }}
                  placeholder="Descripción del producto"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => onFormChange("description", e.target.value)}
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Imagen del Producto</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={onImageChange}
                  style={{ borderColor: "#EBB583" }}
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        borderRadius: "8px",
                        border: "2px solid #EBB583",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn text-white" style={{ backgroundColor: "#EA7028" }}>
                  {editing
                    ? "Guardar Cambios"
                    : `Agregar ${activeTab === "productos" ? "Producto" : "Insumo"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
