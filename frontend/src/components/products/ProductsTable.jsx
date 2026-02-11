export function ProductsTable({ items, activeTab, onEdit, onDelete, getStatusBadge }) {
  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: "#EBB583" }}>
            <tr>
              <th style={{ color: "#fff" }}>Nombre</th>
              <th style={{ color: "#fff" }}>SKU</th>
              <th style={{ color: "#fff" }}>Categoría</th>
              <th style={{ color: "#fff" }}>Precio</th>
              <th style={{ color: "#fff" }}>Stock</th>
              <th style={{ color: "#fff" }}>Estado</th>
              <th style={{ color: "#fff" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                style={{
                  opacity: item.is_active === false ? 0.5 : 1,
                  filter: item.is_active === false ? "grayscale(100%)" : "none",
                  backgroundColor: item.is_active === false ? "#f0f0f0" : "transparent",
                }}
              >
                <td>
                  <strong>{item.name}</strong>
                  <br />
                  <small className="text-muted">{item.description}</small>
                </td>
                <td>
                  <code>{item.sku}</code>
                </td>
                <td>
                  <span className="badge" style={{ backgroundColor: "#EBCC83", color: "#333" }}>
                    {item.category}
                  </span>
                </td>
                <td style={{ color: "#EA7028", fontWeight: "bold" }}>
                  ${(item.price || 0).toLocaleString("es-CO")}
                </td>
                <td>
                  <span
                    style={{
                      color: item.stock_quantity <= item.min_stock_level ? "#EA7028" : "#333",
                      fontWeight: "bold",
                    }}
                  >
                    {item.stock_quantity} {item.unit || "unidades"}
                  </span>
                </td>
                <td>{getStatusBadge(item.stock_quantity, item.min_stock_level)}</td>
                <td>
                  <button
                    className="btn btn-sm me-2"
                    style={{ backgroundColor: "#EBA94D", color: "white" }}
                    onClick={() => onEdit(item)}
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Deshabilitar"
                    onClick={() => onDelete(item.id)}
                  >
                    🗑
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
