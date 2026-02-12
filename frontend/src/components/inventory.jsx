import { useState, useEffect } from "react";
import { Package, Wheat, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { productsAPI, suppliesAPI } from "../services/api";
import { InventoryStats } from "./inventory/InventoryStats";
import { InventoryTable } from "./inventory/InventoryTable";
import { MovementHistory } from "./inventory/MovementHistory";
import { MovementModal } from "./inventory/MovementModal";
import { EditModal } from "./inventory/EditModal";
import "bootstrap/dist/css/bootstrap.min.css";

export function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [movements, setMovements] = useState([]);
  const [supplyMovements, setSupplyMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [movementForm, setMovementForm] = useState({
    product: "",
    type: "",
    quantity: "",
    motivo: "",
  });

  const SUPPLIES_CATEGORIES = [
    "Harinas",
    "Endulzantes",
    "Levaduras",
    "Lácteos",
    "Saborizantes",
    "Condimentos",
  ];

  useEffect(() => {
    loadData();
    loadMovementHistory();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load products
      const productsRes = await productsAPI.getAll();
      const products = productsRes.data || [];
      const finishedGoods = products
        .filter((p) => !SUPPLIES_CATEGORIES.includes(p.category))
        .map((p) => ({
          id: p.id,
          code: p.sku,
          name: p.name,
          category: p.category,
          stock: p.stock_quantity,
          min: p.min_stock_level,
          max: p.max_stock_level || p.stock_quantity * 2,
          price: `$${Number(p.price || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`,
          status: getStatus(p.stock_quantity, p.min_stock_level),
          unit: "unidades",
          disabled: false,
        }));
      setInventory(finishedGoods);

      // Load supplies
      const suppliesRes = await suppliesAPI.getAll();
      const suppliesData = suppliesRes.data || [];
      const rawMaterials = suppliesData.map((s) => ({
        id: s.id,
        code: s.sku,
        name: s.name,
        category: s.category,
        stock: s.stock_quantity,
        min: s.min_stock_level,
        max: s.max_stock_level || s.stock_quantity * 2,
        price: `$${Number(s.price || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`,
        status: getStatus(s.stock_quantity, s.min_stock_level),
        unit: s.unit || "kg",
        supplier: s.supplier_id || "Por asignar",
        disabled: false,
      }));
      setSupplies(rawMaterials);

      toast.success("Inventario cargado correctamente");
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast.error("Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  };

  const loadMovementHistory = async () => {
    try {
      console.log("📥 Cargando historial de movimientos...");

      // Cargar movimientos de productos y supplies en paralelo
      const [inventoryRes, suppliesRes] = await Promise.all([
        fetch("/api/inventory/history/all/movements?limit=200"),
        fetch("/api/supplies/history/all/movements?limit=200"),
      ]);

      console.log(`📥 Respuesta Inventory: ${inventoryRes.status}`);
      console.log(`📥 Respuesta Supplies: ${suppliesRes.status}`);

      let allMovements = [];

      // Procesar movimientos de inventory
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        console.log(`📥 Datos de inventory recibidos:`, inventoryData);

        if (inventoryData.data && Array.isArray(inventoryData.data)) {
          const inventoryMovements = inventoryData.data.map((movement) => ({
            id: `inv-${movement.id}`,
            date: new Date(movement.created_at).toISOString().split("T")[0],
            product: movement.product_name,
            code: movement.sku,
            type: movement.movement_type === "entrada" ? "entrada" : "salida",
            quantity: Math.abs(movement.quantity_change),
            previousQuantity: movement.previous_quantity,
            newQuantity: movement.new_quantity,
            motivo: movement.reason || movement.notes || "",
            user: movement.user_name || "Sistema",
            created_at: movement.created_at,
            product_id: movement.product_id,
            isSupply: false,
          }));
          allMovements = allMovements.concat(inventoryMovements);
        }
      } else {
        console.warn(`⚠️ Inventory API retornó estado: ${inventoryRes.status}`);
      }

      // Procesar movimientos de supplies
      if (suppliesRes.ok) {
        const suppliesData = await suppliesRes.json();
        console.log(`📥 Datos de supplies recibidos:`, suppliesData);

        if (suppliesData.data && Array.isArray(suppliesData.data)) {
          const suppliesMovements = suppliesData.data.map((movement) => ({
            id: `sup-${movement.id}`,
            date: new Date(movement.created_at).toISOString().split("T")[0],
            product: movement.supply_name,
            code: movement.sku,
            type: movement.movement_type === "entrada" ? "entrada" : "salida",
            quantity: Math.abs(movement.quantity_change),
            previousQuantity: movement.previous_quantity,
            newQuantity: movement.new_quantity,
            motivo: movement.reason || movement.notes || "",
            user: movement.user_name || "Sistema",
            created_at: movement.created_at,
            product_id: movement.supply_id,
            isSupply: true,
          }));
          allMovements = allMovements.concat(suppliesMovements);
        }
      } else {
        console.warn(`⚠️ Supplies API retornó estado: ${suppliesRes.status}`);
      }

      // Ordenar por fecha descendente
      allMovements.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      setMovements(allMovements);
      setSupplyMovements(allMovements);
      console.log(
        `✅ Historial cargado: ${allMovements.length} movimientos totales`,
      );
    } catch (error) {
      console.error("❌ Error fetching movement history:", error);
      // No mostrar error al usuario, solo en consola
      // El historial simplemente no cargará, pero el resto funciona
      setMovements([]);
      setSupplyMovements([]);
    }
  };

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        "⚠️ ¿Estás seguro de que quieres limpiar TODO el historial de movimientos? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    setClearingHistory(true);
    try {
      console.log("🧹 Limpiando historial de movimientos...");

      // Limpiar historial de ambos lados (inventory y supplies)
      const [inventoryRes, suppliesRes] = await Promise.all([
        fetch("/api/inventory/history/clear/all", { method: "DELETE" }),
        fetch("/api/supplies/history/clear/all", { method: "DELETE" }),
      ]);

      let totalDeleted = 0;

      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        console.log(
          `✅ Inventory: ${data.deletedCount} movimientos eliminados`,
        );
        totalDeleted += data.deletedCount;
      }

      if (suppliesRes.ok) {
        const data = await suppliesRes.json();
        console.log(`✅ Supplies: ${data.deletedCount} movimientos eliminados`);
        totalDeleted += data.deletedCount;
      }

      // Recargar el historial vacío
      await loadMovementHistory();

      toast.success(
        `Historial limpiado: ${totalDeleted} movimientos eliminados`,
      );
    } catch (error) {
      console.error("Error al limpiar historial:", error);
      toast.error("Error al limpiar historial");
    } finally {
      setClearingHistory(false);
    }
  };

  const getStatus = (stock, min) => {
    if (stock <= min) return "critical";
    if (stock <= min * 1.5) return "low";
    return "ok";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      critical: { color: "#DC3545", label: "Crítico" },
      low: { color: "#EBA94D", label: "Bajo" },
      ok: { color: "#EBCC83", label: "normal" },
    };
    const config = statusConfig[status] || statusConfig.ok;
    return (
      <span
        className="badge"
        style={{
          backgroundColor: config.color,
          color: "white",
        }}
      >
        {config.label}
      </span>
    );
  };

  const handleAddMovement = async () => {
    if (!movementForm.product || !movementForm.type || !movementForm.quantity) {
      toast.error("Completa todos los campos");
      return;
    }

    const quantity = parseInt(movementForm.quantity);
    const isSupply = activeTab === "supplies";
    const data = isSupply ? supplies : inventory;
    const item = data.find((i) => i.name === movementForm.product);

    if (!item) {
      toast.error("Producto no encontrado");
      return;
    }

    if (movementForm.type === "salida" && item.stock < quantity) {
      toast.error("Stock insuficiente");
      return;
    }

    if (movementForm.type === "entrada" && item.stock + quantity > item.max) {
      toast.error(
        `La cantidad supera el stock máximo (${item.max}). Stock actual: ${item.stock}`,
      );
      return;
    }

    try {
      const newStock =
        movementForm.type === "entrada"
          ? item.stock + quantity
          : item.stock - quantity;

      // Registrar movimiento en la API
      const endpoint = isSupply ? "/api/supplies/" : "/api/inventory/";

      console.log(
        `Actualizando ${endpoint}${item.id} con cantidad ${newStock}`,
      );

      const updateResponse = await fetch(`${endpoint}${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: newStock,
          movementType: movementForm.type,
          reason: movementForm.motivo,
          notes: `Movimiento desde interfaz - ${new Date().toLocaleString()}`,
          userId: 1,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || `Error ${updateResponse.status}`);
      }

      const responseData = await updateResponse.json();
      console.log("Respuesta del servidor:", responseData);

      // Update local state
      const updateData = (arr) =>
        arr.map((i) =>
          i.name === movementForm.product
            ? { ...i, stock: newStock, status: getStatus(newStock, i.min) }
            : i,
        );

      if (isSupply) setSupplies(updateData(supplies));
      else setInventory(updateData(inventory));

      // Recargar el historial desde la API (con manejo de error silencioso)
      try {
        await loadMovementHistory();
      } catch (historyError) {
        console.warn(
          "Historial no disponible, pero movimiento se registró",
          historyError,
        );
      }

      toast.success(
        `Movimiento registrado: ${movementForm.type} de ${quantity} ${item.unit}`,
      );
      setShowMovementModal(false);
      setMovementForm({ product: "", type: "", quantity: "", motivo: "" });
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error al registrar: ${error.message}`);
    }
  };

  const handleEditItem = async (editForm) => {
    if (!selectedItem || !editForm.name || !editForm.code) {
      toast.error("Completa campos requeridos");
      return;
    }

    const isSupply = activeTab === "supplies";

    try {
      const api = isSupply ? suppliesAPI : productsAPI;
      const newStock = parseInt(editForm.stock) || selectedItem.stock;
      const newMin = parseInt(editForm.min) || selectedItem.min;

      await api.update(selectedItem.id, {
        name: editForm.name,
        sku: editForm.code,
        category: editForm.category,
        stock_quantity: newStock,
        min_stock_level: newMin,
        price: parseFloat(editForm.price),
        unit: editForm.unit,
        supplier_id: editForm.supplier,
      });

      const newStatus = getStatus(newStock, newMin);
      const updateData = (arr) =>
        arr.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                code: editForm.code,
                name: editForm.name,
                category: editForm.category,
                stock: newStock,
                min: newMin,
                max: parseInt(editForm.max) || selectedItem.max,
                price: editForm.price.startsWith("$")
                  ? editForm.price
                  : `$${editForm.price}`,
                unit: editForm.unit,
                supplier: editForm.supplier,
                status: newStatus,
              }
            : i,
        );

      if (isSupply) setSupplies(updateData(supplies));
      else setInventory(updateData(inventory));

      toast.success(`${editForm.name} actualizado correctamente`);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar producto");
    }
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const data = activeTab === "supplies" ? supplies : inventory;
  const currentMovements =
    activeTab === "supplies" ? supplyMovements : movements;
  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div
        className="p-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-warning mb-3"></div>
          <p>Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 style={{ fontFamily: "Open Sans, sans-serif" }}>
        Gestión de Inventario
      </h1>
      <p className="text-muted">
        Administre productos e insumos de la panadería
      </p>

      {/* Tabs */}
      <ul
        className="nav nav-tabs mb-4"
        style={{ borderBottomColor: "#EBB583" }}
      >
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "products" ? "active" : ""}`}
            style={{
              backgroundColor:
                activeTab === "products" ? "#EA7028" : "transparent",
              color: activeTab === "products" ? "white" : "#333",
              border: "none",
            }}
            onClick={() => {
              setActiveTab("products");
              setSearchTerm("");
            }}
          >
            <Package size={18} className="me-2" />
            Productos Terminados
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "supplies" ? "active" : ""}`}
            style={{
              backgroundColor:
                activeTab === "supplies" ? "#EA7028" : "transparent",
              color: activeTab === "supplies" ? "white" : "#333",
              border: "none",
            }}
            onClick={() => {
              setActiveTab("supplies");
              setSearchTerm("");
            }}
          >
            <Wheat size={18} className="me-2" />
            Insumos
          </button>
        </li>
      </ul>

      {/* Stats */}
      <InventoryStats data={data} type={activeTab} />

      {/* Search & Button */}
      <div className="card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-9">
            <div className="input-group">
              <span
                className="input-group-text"
                style={{ backgroundColor: "#EBB583", border: "none" }}
              >
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderColor: "#EBB583" }}
              />
            </div>
          </div>
          <div className="col-md-3 text-end">
            <button
              className="btn text-white"
              style={{ backgroundColor: "#EA7028" }}
              onClick={() => setShowMovementModal(true)}
            >
              <Plus size={18} className="me-2" />
              Registrar Movimiento
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <InventoryTable
        items={filteredData}
        onEdit={handleOpenEdit}
        getStatusBadge={getStatusBadge}
        showSupplier={activeTab === "supplies"}
      />

      {/* History */}
      <MovementHistory
        movements={currentMovements}
        onClearHistory={handleClearHistory}
        isClearing={clearingHistory}
      />

      {/* Modals */}
      {showMovementModal && (
        <MovementModal
          isOpen={showMovementModal}
          onClose={() => {
            setShowMovementModal(false);
            setMovementForm({
              product: "",
              type: "",
              quantity: "",
              motivo: "",
            });
          }}
          items={data}
          formData={movementForm}
          onFormChange={(field, value) =>
            setMovementForm({ ...movementForm, [field]: value })
          }
          onSubmit={handleAddMovement}
        />
      )}

      {showEditModal && selectedItem && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onSubmit={handleEditItem}
          isSupply={activeTab === "supplies"}
        />
      )}
    </div>
  );
}
