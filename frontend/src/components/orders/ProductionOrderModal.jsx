import { Modal } from "../common/Modal";
import { Plus, Trash2 } from "lucide-react";

export function ProductionOrderModal({
  isOpen,
  onClose,
  products,
  employees,
  supplies,
  formData,
  newSupply,
  onFormChange,
  onNewSupplyChange,
  onAddSupply,
  onRemoveSupply,
  onSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      title="Nueva Orden de Producción"
      onClose={onClose}
      size="lg"
      footer={
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onSubmit}>
            Crear Orden
          </button>
        </div>
      }
    >
      <div className="mb-3">
        <label className="form-label">Producto *</label>
        <select
          className="form-select"
          value={formData.product_id}
          onChange={(e) => onFormChange("product_id", e.target.value)}
          required
        >
          <option value="">Seleccione producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Cantidad *</label>
            <input
              type="number"
              className="form-control"
              value={formData.quantity}
              onChange={(e) => onFormChange("quantity", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Responsable *</label>
            <select
              className="form-select"
              value={formData.responsible_employee_id}
              onChange={(e) =>
                onFormChange("responsible_employee_id", e.target.value)
              }
              required
            >
              <option value="">Seleccione responsable</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Fecha Límite</label>
        <input
          type="date"
          className="form-control"
          value={formData.due_date}
          onChange={(e) => onFormChange("due_date", e.target.value)}
        />
      </div>

      <hr />
      <h6 className="mb-3">Insumos Necesarios (Opcional)</h6>

      <div className="row mb-3">
        <div className="col-md-6">
          <select
            className="form-select"
            value={newSupply.insumo_id}
            onChange={(e) => onNewSupplyChange("insumo_id", e.target.value)}
          >
            <option value="">Seleccione insumo</option>
            {supplies.map((supply) => (
              <option key={supply.id} value={supply.id}>
                {supply.name} (Stock: {supply.stock_quantity}{" "}
                {supply.unit || "kg"})
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Cantidad"
            value={newSupply.quantity_required}
            onChange={(e) =>
              onNewSupplyChange("quantity_required", e.target.value)
            }
            step="0.01"
          />
        </div>
        <div className="col-md-3">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={onAddSupply}
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>

      {formData.insumos && formData.insumos.length > 0 && (
        <div className="alert alert-info">
          <strong>Insumos agregados:</strong>
          <ul className="mb-0 mt-2">
            {formData.insumos.map((insumo, index) => {
              const supply = supplies.find((s) => s.id === insumo.insumo_id);
              return (
                <li
                  key={index}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span>
                    {supply?.name}: {insumo.quantity_required} {insumo.unit}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onRemoveSupply(index)}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Notas</label>
        <textarea
          className="form-control"
          value={formData.notes}
          onChange={(e) => onFormChange("notes", e.target.value)}
          rows="2"
        />
      </div>
    </Modal>
  );
}
