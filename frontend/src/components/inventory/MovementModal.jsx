import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

export function MovementModal({
  isOpen,
  onClose,
  items,
  formData,
  onFormChange,
  onSubmit,
}) {
  const [validationWarning, setValidationWarning] = useState("");

  // Validar en tiempo real
  useEffect(() => {
    if (
      !formData.product ||
      !formData.quantity ||
      formData.type !== "entrada"
    ) {
      setValidationWarning("");
      return;
    }

    const selectedItem = items.find((item) => item.name === formData.product);
    if (!selectedItem) return;

    const newStock = selectedItem.stock + parseInt(formData.quantity || 0);
    if (newStock > selectedItem.max) {
      setValidationWarning(
        `⚠️ Total: ${newStock} unidades. Máximo permitido: ${selectedItem.max}`,
      );
    } else {
      setValidationWarning("");
    }
  }, [formData.product, formData.quantity, formData.type, items]);

  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header" style={{ backgroundColor: "#EBB583" }}>
            <h5 className="modal-title">Registrar Movimiento de Inventario</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Producto/Insumo *</label>
              <select
                className="form-select"
                style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                value={formData.product}
                onChange={(e) => onFormChange("product", e.target.value)}
              >
                <option value="">Seleccione producto</option>
                {items.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name} - Stock: {item.stock} {item.unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Tipo de Movimiento *</label>
                <select
                  className="form-select"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={formData.type}
                  onChange={(e) => onFormChange("type", e.target.value)}
                >
                  <option value="">Seleccione tipo</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Cantidad *</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                  value={formData.quantity}
                  onChange={(e) => onFormChange("quantity", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            {validationWarning && (
              <div
                className="alert alert-warning d-flex align-items-center gap-2 mb-3"
                style={{ backgroundColor: "#fff3cd", borderColor: "#ffc107" }}
              >
                <AlertCircle size={18} style={{ color: "#856404" }} />
                <span style={{ color: "#856404" }}>{validationWarning}</span>
              </div>
            )}
            <div className="mb-3">
              <label className="form-label">Motivo / Descripción</label>
              <textarea
                className="form-control"
                style={{ borderColor: "#EBB583", borderWidth: "2px" }}
                value={formData.motivo}
                onChange={(e) => onFormChange("motivo", e.target.value)}
                placeholder="Descripción del movimiento"
                rows="3"
              ></textarea>
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
              onClick={onSubmit}
            >
              Registrar Movimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
