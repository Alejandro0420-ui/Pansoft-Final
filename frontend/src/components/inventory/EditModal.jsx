import { useState, useEffect } from "react";

export function EditModal({
  isOpen,
  onClose,
  item,
  onSubmit,
  isSupply = false,
}) {
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    category: "",
    stock: "",
    min: "",
    max: "",
    price: "",
    unit: "",
    supplier: "",
  });

  useEffect(() => {
    if (item && isOpen) {
      setEditForm({
        code: item.code,
        name: item.name,
        category: item.category,
        stock: item.stock.toString(),
        min: item.min.toString(),
        max: item.max.toString(),
        price: item.price.replace("COP $", "").replace("$", ""),
        unit: item.unit,
        supplier: item.supplier || "",
      });
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(editForm);
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header" style={{ backgroundColor: "#EBB583" }}>
            <h5 className="modal-title">
              Editar {isSupply ? "Insumo" : "Producto"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Código *</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={editForm.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder="SKU-001"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={editForm.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nombre del producto"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Categoría</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={editForm.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="Categoría"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Unidad</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={editForm.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  placeholder="unidades"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Stock Actual</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={editForm.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Stock Mínimo</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={editForm.min}
                  onChange={(e) => handleChange("min", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Stock Máximo</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={editForm.max}
                  onChange={(e) => handleChange("max", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={editForm.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {isSupply && (
                <div className="col-md-6">
                  <label className="form-label">Proveedor</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                    value={editForm.supplier}
                    onChange={(e) => handleChange("supplier", e.target.value)}
                    placeholder="Nombre del proveedor"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn text-white"
              style={{ backgroundColor: "#EA7028" }}
              onClick={handleSubmit}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
