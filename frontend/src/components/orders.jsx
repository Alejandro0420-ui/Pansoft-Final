import { useState } from "react";
import { toast } from "sonner";
import { salesOrdersAPI, productionOrdersAPI } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

// Importar componentes refactorizados
import { useOrdersLogic } from "./orders/useOrdersLogic";
import { OrdersHeader } from "./orders/OrdersHeader";
import { SearchBar } from "./orders/SearchBar";
import { SalesOrdersTable } from "./orders/SalesOrdersTable";
import { ProductionOrdersTable } from "./orders/ProductionOrdersTable";
import { OrderFormModal } from "./orders/OrderFormModal";
import { SuppliesModal } from "./orders/SuppliesModalNew";
import { PRODUCT_PRICES, THEME_COLORS } from "./orders/constants";

export function Orders() {
  // Usar el hook personalizado para la lógica de órdenes
  const {
    salesOrders,
    productionOrders,
    loading,
    needRefresh,
    setNeedRefresh,
  } = useOrdersLogic();

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("sales");
  const [showModal, setShowModal] = useState(false);
  const [showSuppliesModal, setShowSuppliesModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Estados de formulario
  const [salesForm, setSalesForm] = useState({
    client: "",
    product: "",
    items: "",
  });
  const [productionForm, setProductionForm] = useState({
    product: "",
    quantity: "",
    responsible: "",
  });
  const [supplies, setSupplies] = useState([]);
  const [newSupply, setNewSupply] = useState({
    name: "",
    quantity: "",
    unit: "kg",
  });

  // Funciones auxiliares de formato
  const formatCurrency = (amount) =>
    `$${Number(amount).toLocaleString("es-CO")}`;

  const calculateTotal = () => {
    if (!salesForm.product || !salesForm.items) return 0;
    return PRODUCT_PRICES[salesForm.product] * parseInt(salesForm.items);
  };

  // Funciones de insumos
  const addSupply = () => {
    if (!newSupply.name || !newSupply.quantity) {
      toast.error("Complete nombre y cantidad");
      return;
    }
    setSupplies([...supplies, newSupply]);
    setNewSupply({ name: "", quantity: "", unit: "kg" });
    toast.success("Insumo agregado");
  };

  const removeSupply = (index) => {
    setSupplies(supplies.filter((_, i) => i !== index));
  };

  // Funciones de órdenes
  const handleAddSalesOrder = async () => {
    if (!salesForm.client || !salesForm.product || !salesForm.items) {
      toast.error("Complete todos los campos");
      return;
    }

    try {
      const totalAmount = calculateTotal();

      if (isEditing) {
        await salesOrdersAPI.update(selectedOrder.id, {
          customer_name: salesForm.client,
          total_amount: totalAmount,
          status: selectedOrder.status,
        });
        toast.success("Orden actualizada");
      } else {
        await salesOrdersAPI.create({
          customer_name: salesForm.client,
          total_amount: totalAmount,
          delivery_date: new Date().toISOString().split("T")[0],
        });
        toast.success("Orden creada correctamente");
      }

      setNeedRefresh(true);
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar orden");
    }
  };

  const handleAddProductionOrder = async () => {
    if (
      !productionForm.product ||
      !productionForm.quantity ||
      !productionForm.responsible
    ) {
      toast.error("Complete todos los campos");
      return;
    }

    try {
      const product_id = Math.floor(Math.random() * 10) + 1;
      const employee_id = Math.floor(Math.random() * 5) + 1;

      if (isEditing) {
        await productionOrdersAPI.update(selectedOrder.id, {
          product_id,
          quantity: parseInt(productionForm.quantity),
          responsible_employee_id: employee_id,
          status: selectedOrder.status,
          notes: "",
        });
        toast.success("Orden actualizada");
      } else {
        await productionOrdersAPI.create({
          product_id,
          quantity: parseInt(productionForm.quantity),
          responsible_employee_id: employee_id,
          status: "pendiente",
          notes: "",
        });
        toast.success("Orden creada correctamente");
      }

      setNeedRefresh(true);
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar orden");
    }
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setIsEditing(true);
    if (activeTab === "sales") {
      setSalesForm({
        client: order.client,
        product: order.product,
        items: order.items.toString(),
      });
    } else {
      setProductionForm({
        product: order.product,
        quantity: order.quantity.toString(),
        responsible: order.responsible,
      });
    }
    setShowModal(true);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      if (activeTab === "sales") {
        await salesOrdersAPI.updateStatus(id, newStatus);
      } else {
        await productionOrdersAPI.updateStatus(id, newStatus);
      }
      setNeedRefresh(true);
      toast.success("Estado actualizado");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar estado");
    }
  };

  const resetForm = () => {
    setSalesForm({ client: "", product: "", items: "" });
    setProductionForm({ product: "", quantity: "", responsible: "" });
    setSupplies([]);
    setIsEditing(false);
    setSelectedOrder(null);
  };

  // Filtrado de órdenes
  const filteredSalesOrders = salesOrders.filter(
    (o) =>
      o.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.client.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredProductionOrders = productionOrders.filter(
    (o) =>
      o.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calcular estadísticas
  const stats = {
    totalSales: salesOrders.length,
    completedSales: salesOrders.filter((o) => o.status === "completed").length,
    totalProduction: productionOrders.length,
    completedProduction: productionOrders.filter(
      (o) => o.status === "completada",
    ).length,
  };

  // Handlers para cambios de tab y búsqueda
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    resetForm();
  };

  const handleNewOrder = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="p-4">
      {/* Encabezado y estadísticas */}
      <OrdersHeader
        stats={stats}
        loading={loading}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Contenedor de contenido */}
      <div className="card mt-3">
        <div className="card-body">
          {/* Búsqueda y botón nueva orden */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onNewOrder={handleNewOrder}
            loading={loading}
            activeTab={activeTab}
          />

          {/* Tabla de Órdenes de Venta */}
          {activeTab === "sales" && (
            <SalesOrdersTable
              orders={filteredSalesOrders}
              loading={loading}
              onEdit={openEditModal}
              onViewSupplies={(order) => {
                setSelectedOrder(order);
                setShowSuppliesModal(true);
              }}
              onUpdateStatus={updateStatus}
            />
          )}

          {/* Tabla de Órdenes de Producción */}
          {activeTab === "production" && (
            <ProductionOrdersTable
              orders={filteredProductionOrders}
              loading={loading}
              onEdit={openEditModal}
              onViewSupplies={(order) => {
                setSelectedOrder(order);
                setShowSuppliesModal(true);
              }}
              onUpdateStatus={updateStatus}
            />
          )}
        </div>
      </div>

      {/* Modal de Nueva/Editar Orden */}
      <OrderFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSubmit={
          activeTab === "sales" ? handleAddSalesOrder : handleAddProductionOrder
        }
        isEditing={isEditing}
        activeTab={activeTab}
        loading={loading}
        orderType={activeTab === "sales" ? salesForm : productionForm}
        supplies={supplies}
        onAddSupply={addSupply}
        onRemoveSupply={removeSupply}
        newSupply={newSupply}
        onNewSupplyChange={setNewSupply}
        onFormChange={activeTab === "sales" ? setSalesForm : setProductionForm}
      />

      {/* Modal de Insumos */}
      <SuppliesModal
        isOpen={showSuppliesModal}
        onClose={() => setShowSuppliesModal(false)}
        selectedOrder={selectedOrder}
        activeTab={activeTab}
      />
    </div>
  );
}
