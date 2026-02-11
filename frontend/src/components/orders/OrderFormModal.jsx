import { Plus, Wheat } from "lucide-react";
import { Modal } from "../common/Modal";
import { FormInput } from "../common/FormInput";
import { SupplyInput } from "./SupplyInput";
import { PRODUCT_PRICES, AVAILABLE_SUPPLIES, EMPLOYEES, THEME_COLORS, UNIT_OPTIONS } from "./constants";

export function OrderFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  activeTab,
  loading,
  orderType,
  supplies,
  onAddSupply,
  onRemoveSupply,
  newSupply,
  onNewSupplyChange,
  onFormChange, // Nueva prop para manejar cambios de formulario
}) {
  const isSalesOrder = activeTab === "sales";
  const form = orderType;

  const handleCalculateTotal = () => {
    if (!form.product || !form.items) return 0;
    return PRODUCT_PRICES[form.product] * parseInt(form.items);
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
            <FormInput
              label="Cliente"
              placeholder="Nombre del cliente"
              value={form.client || ""}
              onChange={(value) => onFormChange({ ...form, client: value })}
              required
            />
            <FormInput
              label="Producto"
              type="select"
              options={Object.keys(PRODUCT_PRICES).map((p) => ({
                value: p,
                label: `${p} - $${PRODUCT_PRICES[p].toLocaleString("es-CO")}`,
              }))}
              value={form.product || ""}
              onChange={(value) => onFormChange({ ...form, product: value })}
              required
            />
            <FormInput
              label="Cantidad"
              type="number"
              value={form.items || ""}
              onChange={(value) => onFormChange({ ...form, items: value })}
              required
            />
          </>
        ) : (
          <>
            <FormInput
              label="Producto"
              type="select"
              options={Object.keys(PRODUCT_PRICES).map((p) => ({
                value: p,
                label: p,
              }))}
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
                  options={EMPLOYEES.map((e) => ({
                    value: e,
                    label: e,
                  }))}
                  value={form.responsible || ""}
                  onChange={(value) => onFormChange({ ...form, responsible: value })}
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Sección de Insumos */}
        <div className="border-top pt-3 mt-3">
          <h6>
            <Wheat size={16} className="me-2" style={{ display: "inline" }} />
            Insumos (Opcional)
          </h6>
          <div className="row g-2 mt-2">
            <div className="col-md-6">
              <select
                className="form-select"
                value={newSupply.name}
                onChange={(e) => onNewSupplyChange({ ...newSupply, name: e.target.value })}
              >
                <option value="">Seleccionar insumo</option>
                {AVAILABLE_SUPPLIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad"
                value={newSupply.quantity}
                onChange={(e) =>
                  onNewSupplyChange({ ...newSupply, quantity: e.target.value })
                }
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={newSupply.unit}
                onChange={(e) =>
                  onNewSupplyChange({ ...newSupply, unit: e.target.value })
                }
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-1">
              <button
                className="btn w-100"
                style={{
                  backgroundColor: THEME_COLORS.secondary,
                  color: "white",
                }}
                onClick={onAddSupply}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {supplies.length > 0 && (
            <div className="mt-3">
              {supplies.map((s, i) => (
                <SupplyInput
                  key={i}
                  supply={s}
                  onRemove={onRemoveSupply}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Total para órdenes de venta */}
        {isSalesOrder && form.product && form.items && (
          <div
            className="p-3 rounded-2 mt-3"
            style={{ backgroundColor: THEME_COLORS.light, opacity: 0.2 }}
          >
            <div className="d-flex justify-content-between">
              <strong>Total:</strong>
              <strong style={{ color: THEME_COLORS.primary, fontSize: "18px" }}>
                {formatCurrency(handleCalculateTotal())}
              </strong>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
