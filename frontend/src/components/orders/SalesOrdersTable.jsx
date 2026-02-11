import { Edit2, CheckCircle, XCircle, Wheat } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { THEME_COLORS } from "./constants";

export function SalesOrdersTable({
  orders,
  loading,
  onEdit,
  onViewSupplies,
  onUpdateStatus,
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover" style={{ borderTop: `2px solid ${THEME_COLORS.light}` }}>
        <thead style={{ backgroundColor: THEME_COLORS.light }}>
          <tr>
            <th>N° Orden</th>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Fecha</th>
            <th>Items</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center text-muted py-4">
                No hay órdenes de venta
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="align-middle">
                <td>
                  <strong>{order.orderNo}</strong>
                  {order.supplies?.length > 0 && (
                    <span
                      className="badge ms-2"
                      style={{ backgroundColor: THEME_COLORS.primary, color: "white", fontSize: "10px" }}
                    >
                      <Wheat size={10} className="me-1" style={{ display: "inline" }} />
                      {order.supplies.length}
                    </span>
                  )}
                </td>
                <td>{order.client}</td>
                <td>{order.product}</td>
                <td className="small text-muted">{order.date}</td>
                <td>{order.items}</td>
                <td style={{ color: THEME_COLORS.primary }}>
                  <strong>{order.total}</strong>
                </td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    {order.supplies?.length > 0 && (
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => onViewSupplies(order)}
                        title="Ver insumos"
                        disabled={loading}
                      >
                        <Wheat size={14} />
                      </button>
                    )}
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => onEdit(order)}
                      title="Editar"
                      disabled={loading}
                    >
                      <Edit2 size={14} />
                    </button>
                    {order.status !== "completed" && (
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => onUpdateStatus(order.id, "completed")}
                        title="Completar"
                        disabled={loading}
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {order.status !== "cancelada" && (
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => onUpdateStatus(order.id, "cancelada")}
                        title="Cancelar"
                        disabled={loading}
                      >
                        <XCircle size={14} />
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
  );
}
