export function SalesOrdersTab({
  orders,
  products,
  loading,
  searchTerm,
  onSearchChange,
  onAddOrder,
  onStatusChange,
  getStatusLabel,
  getStatusBadgeClass,
}) {
  const columns = [
    { label: "N° Orden", accessor: "order_number" },
    { label: "Cliente", accessor: "customer_name" },
    {
      label: "Fecha",
      accessor: "order_date",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      label: "Total",
      accessor: "total_amount",
      render: (value) =>
        `$${value?.toLocaleString("es-CO", { minimumFractionDigits: 2 }) || "0"}`,
    },
    {
      label: "Estado",
      accessor: "status",
      render: (value) => (
        <span className={`badge bg-${getStatusBadgeClass(value)}`}>
          {getStatusLabel(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex gap-3 mb-4">
          <div className="flex-grow-1">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar órdenes de venta..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={onAddOrder}>
            + Nueva Orden de Venta
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                {columns.map((col) => (
                  <th key={col.accessor}>{col.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-3">
                    Cargando...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No hay órdenes de venta
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-bold">{order.order_number}</td>
                    <td>{order.customer_name}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="fw-bold">
                      $
                      {order.total_amount?.toLocaleString("es-CO", {
                        minimumFractionDigits: 2,
                      }) || "0"}
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
