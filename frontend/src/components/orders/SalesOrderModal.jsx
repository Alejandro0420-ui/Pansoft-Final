import { Modal } from "../common/Modal";
import { Plus, Trash2 } from "lucide-react";

export function SalesOrderModal({
  isOpen,
  onClose,
  products,
  formData,
  newItem,
  onFormChange,
  onNewItemChange,
  onAddProduct,
  onRemoveProduct,
  onSubmit,
  customerName,
  onCustomerNameChange,
}) {
  return (
    <Modal
      isOpen={isOpen}
      title="Nueva Orden de Venta"
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
        <label className="form-label">Cliente *</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ingrese nombre del cliente"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Fecha de Entrega</label>
        <input
          type="date"
          className="form-control"
          value={formData.delivery_date}
          onChange={(e) => onFormChange("delivery_date", e.target.value)}
        />
      </div>

      <hr />
      <h6 className="mb-3">Productos * (Mínimo 1)</h6>

      <div className="row mb-3">
        <div className="col-md-8">
          <select
            className="form-select"
            value={newItem.product_id}
            onChange={(e) => onNewItemChange("product_id", e.target.value)}
          >
            <option value="">Seleccione producto</option>
            {products.map((product) => {
              const isAdded = formData.items.some(
                (item) => item.product_id === product.id,
              );
              return (
                <option key={product.id} value={product.id} disabled={isAdded}>
                  {product.name} - $
                  {product.price?.toLocaleString("es-CO") || "0"}{" "}
                  {isAdded ? "(Agregado)" : ""}
                </option>
              );
            })}
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Cantidad"
            value={newItem.quantity}
            onChange={(e) => onNewItemChange("quantity", e.target.value)}
            min="1"
          />
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={onAddProduct}
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>

      {formData.items.length > 0 && (
        <div className="alert alert-info">
          <strong>Productos agregados:</strong>
          <ul className="mb-0 mt-2">
            {formData.items.map((item, index) => {
              const product = products.find((p) => p.id === item.product_id);
              const subtotal = product ? product.price * item.quantity : 0;
              return (
                <li
                  key={index}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span>
                    {item.product_name}: {item.quantity} x $
                    {product?.price?.toLocaleString("es-CO") || "0"} = $
                    {subtotal.toLocaleString("es-CO")}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onRemoveProduct(index)}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Modal>
  );
}
