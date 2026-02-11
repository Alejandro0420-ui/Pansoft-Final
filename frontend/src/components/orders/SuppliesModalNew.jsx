import { Modal } from "../common/Modal";
import { PRODUCT_RECIPES, THEME_COLORS, STATUS_COLORS } from "./constants";

export function SuppliesModal({
  isOpen,
  onClose,
  selectedOrder,
  activeTab,
}) {
  return (
    <Modal
      isOpen={isOpen}
      title={`Insumos - Orden ${selectedOrder?.orderNo}`}
      onClose={onClose}
      size="lg"
      footer={
        <button className="btn btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      {selectedOrder?.supplies?.length > 0 && (
        <div>
          <h6 className="mb-3">Insumos Personalizados:</h6>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead style={{ backgroundColor: THEME_COLORS.light }}>
                <tr>
                  <th>Insumo</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.supplies.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td>{s.quantity}</td>
                    <td>{s.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "production" &&
        selectedOrder &&
        PRODUCT_RECIPES[selectedOrder.product] && (
          <div className="mt-4">
            <h6 className="mb-3">Receta Sugerida (Base: 10 unidades):</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead style={{ backgroundColor: THEME_COLORS.light }}>
                  <tr>
                    <th>Insumo</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Stock Disponible</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCT_RECIPES[selectedOrder.product].map((s, i) => {
                    const statusColors =
                      STATUS_COLORS[s.status] || STATUS_COLORS.pending;
                    return (
                      <tr key={i}>
                        <td>{s.name}</td>
                        <td>
                          {(
                            s.quantity *
                            (selectedOrder.quantity / 10)
                          ).toFixed(2)}
                        </td>
                        <td>{s.unit}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: statusColors.bg,
                              color: statusColors.text,
                            }}
                          >
                            {s.stock}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </Modal>
  );
}
