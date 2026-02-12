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
import { OrderDetailsModal } from "./orders/OrderDetailsModal";
import { PRODUCT_PRICES, EMPLOYEES, THEME_COLORS } from "./orders/constants";

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Estados de formulario
  const [salesForm, setSalesForm] = useState({
    client: "",
  });
  const [salesItems, setSalesItems] = useState([]);
  const [newSalesItem, setNewSalesItem] = useState({
    product: "",
    quantity: 1,
  });
  
  const [productionForm, setProductionForm] = useState({
    product: "",
    quantity: "",
    responsible: "",
  });
  const [supplies, setSupplies] = useState([]);

  // Agregar item a la orden de venta
  const addSalesItem = () => {
    if (!newSalesItem.product || newSalesItem.quantity < 1) {
      toast.error("Selecciona producto y cantidad válida");
      return;
    }
    const unitPrice = PRODUCT_PRICES[newSalesItem.product] || 0;
    setSalesItems([
      ...salesItems,
      {
        product: newSalesItem.product,
        quantity: parseInt(newSalesItem.quantity),
        unitPrice,
        total: unitPrice * parseInt(newSalesItem.quantity),
      },
    ]);
    setNewSalesItem({ product: "", quantity: 1 });
    toast.success("Producto agregado");
  };

  // Remover item de la orden de venta
  const removeSalesItem = (index) => {
    setSalesItems(salesItems.filter((_, i) => i !== index));
  };

  // Calcular total de la orden
  const calculateSalesTotal = () => {
    return salesItems.reduce((sum, item) => sum + item.total, 0);
  };

  // Funciones de órdenes
  const handleAddSalesOrder = async () => {
    if (!salesForm.client || salesItems.length === 0) {
      toast.error("Agrega cliente y al menos un producto");
      return;
    }

    try {
      const totalAmount = calculateSalesTotal();
      const itemsData = salesItems.map(item => ({
        product_id: Object.keys(PRODUCT_PRICES).indexOf(item.product) + 1,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
      }));

      if (isEditing) {
        await salesOrdersAPI.update(selectedOrder.id, {
          customer_name: salesForm.client,
          total_amount: totalAmount,
          status: selectedOrder.status,
          items: itemsData,
        });
        toast.success("Orden actualizada");
      } else {
        await salesOrdersAPI.create({
          customer_name: salesForm.client,
          total_amount: totalAmount,
          delivery_date: new Date().toISOString().split("T")[0],
          items: itemsData,
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
      // Enviar el nombre del producto al backend para que busque el ID correcto
      if (isEditing) {
        await productionOrdersAPI.update(selectedOrder.id, {
          product_name: productionForm.product,
          quantity: parseInt(productionForm.quantity),
          responsible_employee_id: Math.floor(Math.random() * 5) + 1,
          status: selectedOrder.status,
          notes: "",
        });
        toast.success("Orden actualizada");
      } else {
        await productionOrdersAPI.create({
          product_name: productionForm.product,
          quantity: parseInt(productionForm.quantity),
          responsible_employee_id: Math.floor(Math.random() * 5) + 1,
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
      });
      setSalesItems([]);
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
    setSalesForm({ client: "" });
    setSalesItems([]);
    setNewSalesItem({ product: "", quantity: 1 });
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
    completedSales: salesOrders.filter((o) => o.status === "completada").length,
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
              onViewDetails={(order) => {
                setSelectedOrder(order);
                setShowDetailsModal(true);
              }}
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
              onViewDetails={(order) => {
                setSelectedOrder(order);
                setShowDetailsModal(true);
              }}
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
        ordersForm={activeTab === "sales" ? salesForm : productionForm}
        salesItems={activeTab === "sales" ? salesItems : []}
        newSalesItem={activeTab === "sales" ? newSalesItem : { product: "", quantity: 1 }}
        onFormChange={activeTab === "sales" ? setSalesForm : setProductionForm}
        onAddSalesItem={addSalesItem}
        onRemoveSalesItem={removeSalesItem}
        onNewSalesItemChange={setNewSalesItem}
      />

      {/* Modal de Insumos */}
      <SuppliesModal
        isOpen={showSuppliesModal}
        onClose={() => setShowSuppliesModal(false)}
        selectedOrder={selectedOrder}
        activeTab={activeTab}
      />

      {/* Modal de Detalles de Orden */}
      <OrderDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        selectedOrder={selectedOrder}
        activeTab={activeTab}
        onOrderUpdated={() => setNeedRefresh(true)}
      />
    </div>
  );
}
