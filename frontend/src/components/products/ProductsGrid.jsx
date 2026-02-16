export function ProductsGrid({
  items,
  activeTab,
  onEdit,
  onDelete,
  getStatusBadge,
}) {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {items.map((item) => (
        <div key={item.id} className="col">
          <div
            className="card h-100 shadow-sm"
            style={{
              borderTop: "4px solid #EA7028",
              opacity: item.is_active === false ? 0.78 : 1,
              filter: item.is_active === false ? "grayscale(40%)" : "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0.5rem 1rem rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)";
            }}
          >
            <div
              className="card-img-top"
              style={{
                height: "200px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                overflow: "hidden",
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
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      activeTab === "productos" ? "📦" : "🏭";
                  }}
                />
              ) : activeTab === "productos" ? (
                "📦"
              ) : (
                "🏭"
              )}
            </div>
            <div className="card-body">
              <h5
                className="card-title"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333",
                  fontSize: "16px",
                }}
              >
                {item.name}
              </h5>
              <p className="card-text text-muted small">
                SKU: <strong>{item.sku}</strong>
              </p>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#EA7028",
                  }}
                >
                  ${(item.price || 0).toLocaleString("es-CO")}
                </span>
                {getStatusBadge(item.stock_quantity, item.min_stock_level)}
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Categoría</small>
                <span
                  className="badge"
                  style={{ backgroundColor: "#EBB583", color: "#fff" }}
                >
                  {item.category}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Stock</small>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {item.stock_quantity} {item.unit || "unidades"}
                </span>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn flex-grow-1 text-white"
                  style={{ backgroundColor: "#EBA94D" }}
                  onClick={() => onEdit(item)}
                  title="Editar producto"
                >
                  ✎ Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  title="Deshabilitar"
                  onClick={() => onDelete(item.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
