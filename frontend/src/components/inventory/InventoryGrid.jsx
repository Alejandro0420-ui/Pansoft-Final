import { Edit, Trash2 } from "lucide-react";

export function InventoryGrid({
  items,
  onEdit,
  onToggleDisable,
  getStatusBadge,
  icon = "📦",
}) {
  return (
    <div className="card mb-4">
      <div className="card-header" style={{ backgroundColor: "#EBB583" }}>
        <h5 className="mb-0" style={{ fontFamily: "Open Sans, sans-serif" }}>
          Inventario
        </h5>
      </div>
      <div className="card-body">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {items.map((item) => (
            <div key={item.id} className="col">
              <div
                className="card h-100"
                style={{
                  opacity: item.disabled ? 0.6 : 1,
                  borderColor: item.disabled ? "#ccc" : "#EBB583",
                  borderWidth: "2px",
                }}
              >
                <div
                  style={{
                    height: "180px",
                    overflow: "hidden",
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "1px solid #EBB583",
                    fontSize: "48px",
                  }}
                >
                  {item.image_url ? (
                    <img
                      src={`http://localhost:5000${item.image_url}`}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    icon
                  )}
                </div>
                <div className="card-body pb-2">
                  <h5
                    className="card-title"
                    style={{
                      fontFamily: "Open Sans, sans-serif",
                      color: "#333",
                      textDecoration: item.disabled ? "line-through" : "none",
                    }}
                  >
                    {item.name}
                  </h5>
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <strong>SKU:</strong> {item.code}
                  </p>
                  <p className="mb-2" style={{ fontSize: "0.85rem" }}>
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
                  </p>
                  <p className="mb-1" style={{ fontSize: "0.9rem" }}>
                    <strong>Stock:</strong> {item.stock} {item.unit}
                  </p>
                  <p
                    className="text-muted mb-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Min: {item.min} | Máx: {item.max}
                  </p>
                  <div className="mb-2">{getStatusBadge(item.status)}</div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <button
                    className="btn btn-sm flex-grow-1"
                    style={{
                      color: "#EA7028",
                      backgroundColor: "transparent",
                      borderColor: "#EBA94D",
                      borderWidth: "1px",
                    }}
                    onClick={() => onEdit(item)}
                    disabled={item.disabled}
                  >
                    <Edit size={16} className="me-1" />
                    Editar
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{
                      color: item.disabled ? "#888" : "#dc3545",
                      backgroundColor: "transparent",
                      borderColor: "currentColor",
                      borderWidth: "1px",
                    }}
                    onClick={() => onToggleDisable(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
