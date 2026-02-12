import { Calendar, ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";

export function MovementHistory({ movements, onClearHistory, isClearing }) {
  return (
    <div className="card mt-4">
      <div
        className="card-header d-flex justify-content-between align-items-center"
        style={{ backgroundColor: "#EBB583" }}
      >
        <h5 className="mb-0" style={{ fontFamily: "Open Sans, sans-serif" }}>
          Historial de Movimientos ({movements.length})
        </h5>
        {movements.length > 0 && (
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={onClearHistory}
            disabled={isClearing}
            style={{ fontFamily: "Roboto" }}
            title="Limpiar todo el historial"
          >
            <Trash2 size={16} className="me-1" style={{ display: "inline" }} />
            {isClearing ? "Limpiando..." : "Limpiar Historial"}
          </button>
        )}
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: "#EBB583" }}>
            <tr>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Fecha
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Producto
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Tipo
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Cantidad
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Motivo
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Usuario
              </th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  <p style={{ fontFamily: "Roboto", marginBottom: 0 }}>
                    📭 No hay movimientos registrados
                  </p>
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr key={movement.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Calendar size={14} style={{ color: "#EBA94D" }} />
                      <span style={{ fontFamily: "Roboto" }}>
                        {movement.date}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "Roboto" }}>{movement.product}</td>
                  <td>
                    {movement.type === "entrada" ? (
                      <div className="d-flex align-items-center gap-2">
                        <ArrowDownCircle size={16} style={{ color: "green" }} />
                        <span style={{ color: "green", fontFamily: "Roboto" }}>
                          Entrada
                        </span>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
                        <ArrowUpCircle size={16} style={{ color: "red" }} />
                        <span style={{ color: "red", fontFamily: "Roboto" }}>
                          Salida
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ fontFamily: "Roboto" }}>{movement.quantity}</td>
                  <td
                    className="text-muted"
                    style={{ fontFamily: "Roboto", fontSize: "0.9rem" }}
                  >
                    {movement.motivo}
                  </td>
                  <td
                    className="text-muted"
                    style={{ fontFamily: "Roboto", fontSize: "0.9rem" }}
                  >
                    {movement.user}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
