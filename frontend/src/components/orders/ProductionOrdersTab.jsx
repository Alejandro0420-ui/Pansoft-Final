export function ProductionOrdersTab({
  orders,
  loading,
  searchTerm,
  onSearchChange,
  onAddOrder,
  onViewSupplies,
  onStatusChange,
  getStatusLabel,
  getStatusBadgeClass,
}) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex gap-3 mb-4">
          <div className="flex-grow-1">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar órdenes de producción..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={onAddOrder}>
            + Nueva Orden de Producción
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>N° Orden</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Responsable</th>
                <th>Fecha Límite</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-3">
                    Cargando...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No hay órdenes de producción
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-bold">{order.order_number}</td>
                    <td>{order.product_name}</td>
                    <td>{order.quantity}</td>
                    <td>{order.responsible_name}</td>
                    <td>
                      {order.due_date
                        ? new Date(order.due_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={`badge bg-${getStatusBadgeClass(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => onViewSupplies(order)}
                          title="Ver insumos"
                        >
                          Insumos
                        </button>
                        {order.status !== "completada" && (
                          <button
                            className="btn btn-outline-success"
                            onClick={() =>
                              onStatusChange(order.id, "completada")
                            }
                            title="Completar"
                          >
                            ✓
                          </button>
                        )}
                        {order.status !== "cancelada" && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() =>
                              onStatusChange(order.id, "cancelada")
                            }
                            title="Cancelar"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
