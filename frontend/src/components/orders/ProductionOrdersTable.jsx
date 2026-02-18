import { Edit2, CheckCircle, XCircle, Wheat, Eye } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { THEME_COLORS } from "./constants";

export function ProductionOrdersTable({
  orders,
  loading,
  onEdit,
  onViewDetails,
  onViewSupplies,
  onUpdateStatus,
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover" style={{ borderTop: `2px solid ${THEME_COLORS.light}` }}>
        <thead style={{ backgroundColor: THEME_COLORS.light }}>
          <tr>
            <th>N° Orden</th>
            <th>Fecha</th>
            <th>Cantidad</th>
            <th>Responsable</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted py-4">
                No hay órdenes de producción
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
                <td>{order.product}</td>
                <td className="small text-muted">{order.date}</td>
                <td>{order.quantity}</td>
                <td className="small">{order.responsible}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => onViewDetails(order)}
                      title="Ver detalles"
                      disabled={loading}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => onViewSupplies(order)}
                      title="Ver insumos"
                      disabled={loading}
                    >
                      <Wheat size={14} />
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => onEdit(order)}
                      title="Editar"
                      disabled={loading}
                    >
                      <Edit2 size={14} />
                    </button>
                    {order.status !== "completada" && (
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => onUpdateStatus(order.id, "completada")}
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
