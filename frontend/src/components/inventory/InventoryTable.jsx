import { Edit } from "lucide-react";

export function InventoryTable({
  items,
  onEdit,
  getStatusBadge,
  showSupplier = false,
}) {
  return (
    <div className="card mb-4">
      <div className="card-header" style={{ backgroundColor: "#EBB583" }}>
        <h5 className="mb-0" style={{ fontFamily: "Open Sans, sans-serif" }}>
          Inventario
        </h5>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: "#EBB583" }}>
            <tr>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Código
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Nombre
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Categoría
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Stock
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Min/Max
              </th>
              {showSupplier && (
                <th
                  style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
                >
                  Proveedor
                </th>
              )}
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Precio
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Estado
              </th>
              <th
                style={{ color: "#333", fontFamily: "Open Sans, sans-serif" }}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="align-middle">
                <td style={{ fontFamily: "Roboto" }}>{item.code}</td>
                <td style={{ fontFamily: "Roboto" }}>{item.name}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      borderColor: "#EBA94D",
                      backgroundColor: "white",
                      color: "#EA7028",
                    }}
                  >
                    {item.category}
                  </span>
                </td>
                <td style={{ fontFamily: "Roboto" }}>
                  {item.stock} {item.unit}
                </td>
                <td
                  className="text-muted"
                  style={{ fontFamily: "Roboto", fontSize: "0.9rem" }}
                >
                  {item.min} / {item.max}
                </td>
                {showSupplier && (
                  <td className="text-muted" style={{ fontSize: "0.9rem" }}>
                    {item.supplier}
                  </td>
                )}
                <td style={{ color: "#EA7028", fontFamily: "Roboto" }}>
                  {item.price}
                </td>
                <td>{getStatusBadge(item.status)}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    style={{ color: "#EA7028" }}
                    onClick={() => onEdit(item)}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
