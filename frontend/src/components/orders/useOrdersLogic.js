import { useState, useEffect } from "react";
import { toast } from "sonner";
import { salesOrdersAPI, productionOrdersAPI } from "../../services/api";

export const useOrdersLogic = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(true);

  useEffect(() => {
    if (needRefresh) {
      loadOrders();
    }
  }, [needRefresh]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log("📥 Cargando órdenes...");

      const [salesData, prodData] = await Promise.all([
        salesOrdersAPI.getAll(),
        productionOrdersAPI.getAll(),
      ]);

      console.log("✓ Órdenes cargadas:", {
        sales: salesData.data?.length || 0,
        production: prodData.data?.length || 0,
      });

      const salesOrdered = (salesData.data || []).map((o) => ({
        id: o.id,
        orderNo: o.order_number || `VNT-${o.id}`,
        client: o.customer_name,
        date: new Date(o.order_date).toISOString().split("T")[0],
        total: `$${Number(o.total_amount).toLocaleString("es-CO")}`,
        status: o.status,
        items: o.item_count || 0,
        product: "Variado",
        supplies: [],
      }));

      const prodOrdered = (prodData.data || []).map((o) => ({
        id: o.id,
        orderNo: o.order_number || `PROD-${o.id}`,
        product: o.product_name,
        date: new Date(o.order_date).toISOString().split("T")[0],
        quantity: o.quantity,
        status: o.status,
        responsible: o.responsible_name,
        supplies: [],
      }));

      setSalesOrders(salesOrdered);
      setProductionOrders(prodOrdered);
      setNeedRefresh(false);
      toast.success("Órdenes cargadas correctamente");
    } catch (error) {
      console.error("❌ Error cargando órdenes:", error);

      let errorMessage = "Error al cargar órdenes";
      if (error.response?.status === 500) {
        errorMessage = "Error del servidor. Intente recargar la página.";
      } else if (error.response?.status === 404) {
        errorMessage = "Recurso no encontrado";
      } else if (error.message === "Network Error") {
        errorMessage = "Error de conexión. Verifique que el servidor está activo.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    salesOrders,
    productionOrders,
    loading,
    needRefresh,
    setNeedRefresh,
    loadOrders,
  };
};
