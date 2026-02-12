import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../common/Modal";
import { FormInput } from "../common/FormInput";
import { PRODUCT_PRICES, EMPLOYEES, THEME_COLORS } from "./constants";

export function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  activeTab,
  loading,
  ordersForm,
  salesItems,
  newSalesItem,
  onFormChange,
  onAddSalesItem,
  onRemoveSalesItem,
  onNewSalesItemChange,
}) {
  const isSalesOrder = activeTab === "sales";
  const form = ordersForm;

  const calculateSalesTotal = () => {
    return salesItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const formatCurrency = (amount) => `$${Number(amount).toLocaleString("es-CO")}`;

  return (
    <Modal
      isOpen={isOpen}
      title={`${isEditing ? "Editar" : "Nueva"} Orden de ${isSalesOrder ? "Venta" : "Producción"}`}
      onClose={onClose}
      size="lg"
      footer={
        <div>
          <button
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="btn text-white ms-2"
            style={{ backgroundColor: THEME_COLORS.primary }}
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Orden"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {isSalesOrder ? (
          <>
            {/* Cliente */}
            <FormInput
              label="Cliente"
              placeholder="Nombre del cliente"
              value={form.client || ""}
              onChange={(value) => onFormChange({ ...form, client: value })}
              required
            />

            {/* Agregar Productos */}
            <div className="border p-3 rounded">
              <h6 className="mb-3">Agregar Productos</h6>
              <div className="row g-2">
                <div className="col-md-7">
                  <FormInput
                    label="Producto"
                    type="select"
                    options={[
                      { value: "", label: "Seleccionar..." },
                      ...Object.keys(PRODUCT_PRICES).map((p) => ({
                        value: p,
                        label: `${p} - $${PRODUCT_PRICES[p].toLocaleString("es-CO")}`,
                      })),
                    ]}
                    value={newSalesItem.product || ""}
                    onChange={(value) =>
                      onNewSalesItemChange({ ...newSalesItem, product: value })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <FormInput
                    label="Cantidad"
                    type="number"
                    value={newSalesItem.quantity}
                    onChange={(value) =>
                      onNewSalesItemChange({
                        ...newSalesItem,
                        quantity: Math.max(1, parseInt(value) || 1),
                      })
                    }
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="btn w-100"
                    style={{
                      backgroundColor: THEME_COLORS.primary,
                      color: "white",
                    }}
                    onClick={onAddSalesItem}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Productos Agregados */}
            {salesItems.length > 0 && (
              <div className="border rounded p-3">
                <h6 className="mb-3">Productos en la Orden</h6>
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product}</td>
                          <td>{item.quantity}</td>
                          <td>${item.unitPrice.toLocaleString("es-CO")}</td>
                          <td>${item.total.toLocaleString("es-CO")}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onRemoveSalesItem(index)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>Total:</strong>
                        </td>
                        <td colSpan="2">
                          <strong style={{ color: THEME_COLORS.primary }}>
                            ${calculateSalesTotal().toLocaleString("es-CO")}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <FormInput
              label="Producto"
              type="select"
              options={[
                { value: "", label: "Seleccionar..." },
                ...Object.keys(PRODUCT_PRICES).map((p) => ({
                  value: p,
                  label: p,
                })),
              ]}
              value={form.product || ""}
              onChange={(value) => onFormChange({ ...form, product: value })}
              required
            />
            <div className="row">
              <div className="col-md-6">
                <FormInput
                  label="Cantidad"
                  type="number"
                  value={form.quantity || ""}
                  onChange={(value) => onFormChange({ ...form, quantity: value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <FormInput
                  label="Responsable"
                  type="select"
                  options={[
                    { value: "", label: "Seleccionar..." },
                    ...EMPLOYEES.map((e) => ({
                      value: e,
                      label: e,
                    })),
                  ]}
                  value={form.responsible || ""}
                  onChange={(value) =>
                    onFormChange({ ...form, responsible: value })
                  }
                  required
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
