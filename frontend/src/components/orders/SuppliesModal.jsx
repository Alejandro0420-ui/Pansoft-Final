import { Modal } from "../common/Modal";

export function SuppliesModal({ isOpen, onClose, order, supplies }) {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={`Insumos - Orden ${order.order_number}`}
      onClose={onClose}
      size="lg"
    >
      <div className="alert alert-info mb-4">
        <div>
          <strong>Orden de Producción:</strong> {order.order_number}
        </div>
        <div>
          <strong>Producto:</strong> {order.product_name}
        </div>
        <div>
          <strong>Cantidad:</strong> {order.quantity} unidades
        </div>
      </div>

      {order.insumos && order.insumos.length > 0 ? (
        <div>
          <h6 className="mb-3">Insumos Necesarios:</h6>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead className="table-light">
                <tr>
                  <th>Insumo</th>
                  <th>Cantidad Requerida</th>
                  <th>Stock Disponible</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {order.insumos.map((insumo, idx) => {
                  const supply = supplies.find(
                    (s) => s.id === insumo.insumo_id,
                  );
                  const hasStock =
                    supply && supply.stock_quantity >= insumo.quantity_required;
                  return (
                    <tr key={idx}>
                      <td>{supply?.name}</td>
                      <td>
                        {insumo.quantity_required} {insumo.unit}
                      </td>
                      <td>
                        {supply?.stock_quantity} {supply?.unit || "kg"}
                      </td>
                      <td>
                        <span
                          className={`badge bg-${hasStock ? "success" : "danger"}`}
                        >
                          {hasStock ? "OK" : "Insuficiente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="alert alert-secondary">
          No hay insumos personalizados para esta orden.
        </div>
      )}

      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
