import { X } from "lucide-react";

export function InvoiceModal({
  show,
  onClose,
  title,
  invoice,
  customers,
  orders,
  onSubmit,
  loading,
}) {
  if (!show) return null;

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `FAC-${timestamp}-${random}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
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
        zIndex: 1070,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
      }}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-scrollable"
        style={{ marginTop: 0, marginBottom: 0 }}
      >
        <div className="modal-content border-0 rounded-3">
          <div className="modal-header border-0 pb-2">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                onSubmit(Object.fromEntries(formData));
              }}
            >
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Cliente *</label>
                  <select
                    name="customer_id"
                    className="form-select border-2"
                    style={{ borderColor: "#EBB583" }}
                    defaultValue={invoice?.customer_id || ""}
                    required
                  >
                    <option value="">Seleccione cliente</option>
                    {customers?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Orden (Opcional)</label>
                  <select
                    name="order_id"
                    className="form-select border-2"
                    style={{ borderColor: "#EBB583" }}
                    defaultValue={invoice?.order_id || ""}
                  >
                    <option value="">Seleccione orden</option>
                    {orders?.map((o) => (
                      <option key={o.id} value={o.id}>
                        Orden #{o.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Fecha Emisión *</label>
                  <input
                    type="date"
                    name="issue_date"
                    className="form-control border-2"
                    style={{ borderColor: "#EBB583" }}
                    defaultValue={formatDateForInput(invoice?.issue_date)}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">
                    Fecha Vencimiento *
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    className="form-control border-2"
                    style={{ borderColor: "#EBB583" }}
                    defaultValue={formatDateForInput(invoice?.due_date)}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Total *</label>
                  <input
                    type="number"
                    name="total_amount"
                    className="form-control border-2"
                    style={{ borderColor: "#EBB583" }}
                    step="0.01"
                    defaultValue={invoice?.total_amount || ""}
                    required
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Número Factura *</label>
                  <input
                    type="text"
                    name="invoice_number"
                    className="form-control border-2"
                    style={{ borderColor: "#EBB583" }}
                    defaultValue={
                      invoice?.invoice_number || generateInvoiceNumber()
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Estado</label>
                  <select
                    name="status"
                    className="form-select border-2"
                    style={{ borderColor: "#EBB583" }}
                    defaultValue={invoice?.status || "pending"}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagada</option>
                    <option value="overdue">Vencida</option>
                  </select>
                </div>
              </div>

              {invoice?.id && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Monto Pagado</label>
                  <input
                    type="number"
                    name="paid_amount"
                    className="form-control border-2"
                    style={{ borderColor: "#EBB583" }}
                    step="0.01"
                    defaultValue={invoice?.paid_amount || 0}
                  />
                </div>
              )}

              <div className="modal-footer border-0 pt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn text-white"
                  style={{ backgroundColor: "#EA7028" }}
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
