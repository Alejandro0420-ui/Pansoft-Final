import { Eye, Download, Trash2 } from "lucide-react";

export function InvoiceTable({
  invoices,
  loading,
  onView,
  onDownload,
  onDelete,
  onStatusChange,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (status, invoice) => {
    // Calcular si la factura está vencida
    let actualStatus = status;
    if (status === "pending" && invoice?.due_date) {
      const dueDate = new Date(invoice.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        actualStatus = "overdue";
      }
    }

    const badges = {
      paid: { bg: "#EBA94D", text: "white", label: "Pagada" },
      pending: { bg: "#EBCC83", text: "#333", label: "Pendiente" },
      overdue: { bg: "#EA7028", text: "white", label: "Vencida" },
    };
    const badgeConfig = badges[actualStatus] || {
      bg: "#999",
      text: "white",
      label: actualStatus,
    };

    return (
      <span
        style={{
          backgroundColor: badgeConfig.bg,
          color: badgeConfig.text,
          padding: "0.4rem 0.8rem",
          borderRadius: "0.25rem",
          fontWeight: 500,
          fontSize: "0.85rem",
          cursor: "pointer",
          display: "inline-block",
          transition: "all 0.2s ease",
        }}
        onClick={() => {
          if (actualStatus === "pending") {
            onStatusChange(invoice.id, "paid");
          } else if (actualStatus === "paid") {
            onStatusChange(invoice.id, "pending");
          }
        }}
        title="Click para cambiar estado"
      >
        {badgeConfig.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `COP $${Number(amount).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
    })}`;
  };

  if (loading) {
    return (
      <div className="card p-5 text-center">
        <div
          className="spinner-border"
          style={{ color: "#EA7028" }}
          role="status"
        >
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: "#EBB583" }}>
            <tr>
              <th className="text-dark">Factura</th>
              <th className="text-dark">Cliente</th>
              <th className="text-dark">Emisión</th>
              <th className="text-dark">Vencimiento</th>
              <th className="text-dark">Total</th>
              <th className="text-dark">Estado</th>
              <th className="text-dark">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No hay facturas para mostrar
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="align-middle">
                  <td className="fw-bold">{invoice.invoice_number}</td>
                  <td>{invoice.customer_name || "N/A"}</td>
                  <td className="text-muted small">
                    {formatDate(invoice.issue_date)}
                  </td>
                  <td className="text-muted small">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td style={{ color: "#EA7028" }} className="fw-bold">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td>{getStatusBadge(invoice.status, invoice)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ color: "#EA7028" }}
                        onClick={() => onView(invoice)}
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ color: "#EA7028" }}
                        onClick={() => onDownload(invoice)}
                        title="Descargar PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-ghost text-danger"
                        onClick={() => onDelete(invoice.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
