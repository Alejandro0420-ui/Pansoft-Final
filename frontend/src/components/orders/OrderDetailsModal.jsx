import { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Edit2, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { salesOrdersAPI, productionOrdersAPI } from "../../services/api";

export function OrderDetailsModal({
  isOpen,
  onClose,
  selectedOrder,
  activeTab,
  onOrderUpdated,
}) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingValues, setEditingValues] = useState({});

  useEffect(() => {
    if (isOpen && selectedOrder?.id) {
      loadOrderDetails();
    }
  }, [isOpen, selectedOrder]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const api = activeTab === "sales" ? salesOrdersAPI : productionOrdersAPI;
      const response = await api.getById(selectedOrder.id);
      setOrderDetails(response.data);
    } catch (error) {
      console.error("Error cargando detalles:", error);
      toast.error("Error al cargar detalles de la orden");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingItemId(item.id);
    setEditingValues({
      quantity: item.quantity,
      unit_price: item.unit_price || item.quantity_required,
    });
  };

  const saveEdit = async (itemId) => {
    try {
      setLoading(true);
      console.log("Guardando cambios:", {
        orderId: selectedOrder.id,
        itemId,
        quantity: editingValues.quantity,
        unit_price: editingValues.unit_price,
      });

      if (activeTab === "sales") {
        const response = await salesOrdersAPI.updateItem(selectedOrder.id, itemId, {
          quantity: parseInt(editingValues.quantity),
          unit_price: parseFloat(editingValues.unit_price),
        });
        console.log("Respuesta de actualización:", response);
        toast.success("Item actualizado");
      } else {
        const response = await productionOrdersAPI.updateInsumo(selectedOrder.id, itemId, {
          quantity_required: parseInt(editingValues.quantity),
          unit: editingValues.unit || "unidades",
        });
        console.log("Respuesta de actualización:", response);
        toast.success("Insumo actualizado");
      }
      setEditingItemId(null);
      if (onOrderUpdated) onOrderUpdated();
      
      // Esperar un momento y luego recargar
      setTimeout(() => {
        loadOrderDetails();
      }, 300);
    } catch (error) {
      console.error("Error actualizando:", error);
      toast.error("Error al actualizar item: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("¿Eliminar este item de la orden?")) return;

    try {
      setLoading(true);
      if (activeTab === "sales") {
        await salesOrdersAPI.deleteItem(selectedOrder.id, itemId);
        toast.success("Item eliminado");
      } else {
        await productionOrdersAPI.deleteInsumo(selectedOrder.id, itemId);
        toast.success("Insumo eliminado");
      }
      if (onOrderUpdated) onOrderUpdated();
      loadOrderDetails();
    } catch (error) {
      console.error("Error eliminando:", error);
      toast.error("Error al eliminar item");
    } finally {
      setLoading(false);
    }
  };

  const isSalesOrder = activeTab === "sales";
  const items = isSalesOrder ? orderDetails?.items : orderDetails?.insumos || [];

  return (
    <Modal
      isOpen={isOpen}
      title={`Detalles - Orden ${selectedOrder?.order_number || ""}`}
      onClose={onClose}
      size="lg"
    >
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div>
          {/* Información General */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="mb-2">
                <label className="form-label fw-bold">Número de Orden</label>
                <p>{orderDetails?.order_number || "-"}</p>
              </div>
              {isSalesOrder && (
                <div className="mb-2">
                  <label className="form-label fw-bold">Cliente</label>
                  <p>{orderDetails?.customer_name || "-"}</p>
                </div>
              )}
            </div>
            <div className="col-md-6">
              <div className="mb-2">
                <label className="form-label fw-bold">Estado</label>
                <span className="badge bg-info">{orderDetails?.status || "-"}</span>
              </div>
              {isSalesOrder && (
                <div className="mb-2">
                  <label className="form-label fw-bold">Total</label>
                  <p className="text-success fw-bold">
                    COP ${orderDetails?.total_amount?.toLocaleString("es-CO") || "0"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <hr />

          {/* Items/Insumos */}
          <h6 className="mb-3">
            {isSalesOrder ? "Items de la Orden" : "Insumos"}
          </h6>

          {items && items.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead className="table-light">
                  <tr>
                    {isSalesOrder && <th>Producto</th>}
                    {isSalesOrder && <th>Precio</th>}
                    <th>Cantidad</th>
                    {isSalesOrder && <th>Total</th>}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      {isSalesOrder && (
                        <td>{item.product_name || item.soi_product_id || "-"}</td>
                      )}
                      {isSalesOrder && (
                        <td>
                          COP ${item.unit_price?.toLocaleString("es-CO") || "0"}
                        </td>
                      )}
                      <td>
                        {editingItemId === item.id ? (
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={editingValues.quantity}
                            onChange={(e) =>
                              setEditingValues({
                                ...editingValues,
                                quantity: e.target.value,
                              })
                            }
                            min="1"
                          />
                        ) : (
                          item.quantity || item.quantity_required || 0
                        )}
                      </td>
                      {isSalesOrder && (
                        <td>
                          COP ${(item.total || 0).toLocaleString("es-CO")}
                        </td>
                      )}
                      <td>
                        {editingItemId === item.id ? (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => saveEdit(item.id)}
                              disabled={loading}
                              title="Guardar"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-secondary ms-1"
                              onClick={() => setEditingItemId(null)}
                              disabled={loading}
                              title="Cancelar"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => startEdit(item)}
                              disabled={loading}
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger ms-1"
                              onClick={() => deleteItem(item.id)}
                              disabled={loading}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No hay items en esta orden</p>
          )}

          {/* Botones */}
          <div className="mt-4">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
