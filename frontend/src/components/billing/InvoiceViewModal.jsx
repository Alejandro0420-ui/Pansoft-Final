import { Download } from "lucide-react";

export function InvoiceViewModal({ show, onClose, invoice }) {
  if (!show || !invoice) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `COP $${Number(amount).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
    })}`;
  };

  const getStatusBadge = (status) => {
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
          display: "inline-block",
        }}
      >
        {badgeConfig.label}
      </span>
    );
  };

  return (
    <div
      className="modal d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-3">
          <div className="modal-header border-0 pb-2">
            <h5 className="modal-title">{invoice.invoice_number}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <div className="row mb-4">
              <div className="col-6">
                <p className="text-muted small mb-1">Cliente</p>
                <p className="fw-bold">{invoice.customer_name || "N/A"}</p>
              </div>
              <div className="col-6">
                <p className="text-muted small mb-1">Estado</p>
                {getStatusBadge(invoice.status)}
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-6">
                <p className="text-muted small mb-1">Fecha Emisión</p>
                <p className="fw-bold">{formatDate(invoice.issue_date)}</p>
              </div>
              <div className="col-6">
                <p className="text-muted small mb-1">Fecha Vencimiento</p>
                <p className="fw-bold">{formatDate(invoice.due_date)}</p>
              </div>
            </div>

            <div
              className="row mb-4 p-3 rounded-2"
              style={{ backgroundColor: "#f5f5f5" }}
            >
              <div className="col-6">
                <p className="text-muted small mb-1">Total</p>
                <p className="fw-bold h5" style={{ color: "#EA7028" }}>
                  {formatCurrency(invoice.total_amount)}
                </p>
              </div>
              <div className="col-6">
                <p className="text-muted small mb-1">Pagado</p>
                <p className="fw-bold h5">
                  {formatCurrency(invoice.paid_amount || 0)}
                </p>
              </div>
            </div>

            {Number(invoice.paid_amount || 0) <
              Number(invoice.total_amount) && (
              <div
                className="alert mb-0"
                style={{
                  backgroundColor: "#EBCC83",
                  color: "#333",
                  borderLeft: "4px solid #EA7028",
                }}
                role="alert"
              >
                <p className="mb-1 small fw-bold">Pendiente de pago:</p>
                <p className="mb-0 h6" style={{ color: "#EA7028" }}>
                  {formatCurrency(
                    Number(invoice.total_amount) -
                      Number(invoice.paid_amount || 0),
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer border-0 pt-3">
            <button
              className="btn d-flex align-items-center gap-2"
              style={{
                backgroundColor: "#EBA94D",
                color: "white",
                border: "none",
              }}
              onClick={() => alert("Descargando PDF...")}
            >
              <Download size={18} />
              Descargar PDF
            </button>
            <button
              className="btn text-white"
              style={{ backgroundColor: "#EA7028" }}
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
