import { Package, Wheat, TrendingDown, TrendingUp } from "lucide-react";

// Simple StatCard component
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div
      className="card p-3"
      style={{ borderLeft: `4px solid ${color}`, backgroundColor: "#f8f9fa" }}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="text-muted small mb-1">{label}</p>
          <h4 className="mb-0">{value}</h4>
        </div>
        <Icon size={24} color={color} />
      </div>
    </div>
  );
}

export function InventoryStats({ data, type = "product" }) {
  const criticalItems = data.filter(
    (item) => item.status === "critical",
  ).length;
  const lowItems = data.filter((item) => item.status === "low").length;
  const totalValue = data.reduce((sum, item) => {
    const priceStr = (item.price || "$0")
      .replace("$", "")
      .replace(/\./g, "")
      .replace(",", ".");
    const price = parseFloat(priceStr);
    return sum + item.stock * price;
  }, 0);

  const icon = type === "product" ? Package : Wheat;
  const label = type === "product" ? "Total Productos" : "Total Insumos";

  return (
    <div className="row mb-4">
      <div className="col-md-3 mb-3">
        <StatCard
          label={label}
          value={data.length}
          icon={icon}
          color="#EA7028"
        />
      </div>
      <div className="col-md-3 mb-3">
        <StatCard
          label="Stock Crítico"
          value={criticalItems}
          icon={TrendingDown}
          color="#dc3545"
        />
      </div>
      <div className="col-md-3 mb-3">
        <StatCard
          label="Stock Bajo"
          value={lowItems}
          icon={TrendingUp}
          color="#EBCC83"
        />
      </div>
      <div className="col-md-3 mb-3">
        <StatCard
          label="Valor Total"
          value={`$${totalValue.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`}
          icon={TrendingUp}
          color="#EBA94D"
        />
      </div>
    </div>
  );
}
