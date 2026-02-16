import { ShoppingCart, Boxes, CheckCircle } from "lucide-react";

// Simple StatCard component
function StatCard({ label, value, color }) {
  return (
    <div
      className="card p-3"
      style={{ borderLeft: `4px solid ${color}`, backgroundColor: "#f8f9fa" }}
    >
      <p className="text-muted small mb-1">{label}</p>
      <h4 className="mb-0">{value}</h4>
    </div>
  );
}

export function OrdersStats({ salesOrders, productionOrders }) {
  const salesCompleted = salesOrders.filter(
    (o) => o.status === "completada",
  ).length;
  const prodCompleted = productionOrders.filter(
    (o) => o.status === "completada",
  ).length;

  return (
    <div className="row mb-4 g-3">
      <div className="col-md-3">
        <StatCard
          label="Órdenes de Venta"
          value={salesOrders.length}
          icon={ShoppingCart}
        />
      </div>
      <div className="col-md-3">
        <StatCard
          label="Ventas Completadas"
          value={salesCompleted}
          icon={CheckCircle}
          color="#28a745"
        />
      </div>
      <div className="col-md-3">
        <StatCard
          label="Órdenes Producción"
          value={productionOrders.length}
          icon={Boxes}
        />
      </div>
      <div className="col-md-3">
        <StatCard
          label="Prod. Completadas"
          value={prodCompleted}
          icon={CheckCircle}
          color="#28a745"
        />
      </div>
    </div>
  );
}
