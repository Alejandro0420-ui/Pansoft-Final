import { StatCard } from "../common/StatCard";
import { Package, Wheat, TrendingDown, TrendingUp } from "lucide-react";

export function InventoryStats({ data, type = "product" }) {
  const criticalItems = data.filter(
    (item) => item.status === "critical",
  ).length;
  const lowItems = data.filter((item) => item.status === "low").length;
  const totalValue = data.reduce((sum, item) => {
    const priceStr = (item.price || "COP $0")
      .replace("COP $", "")
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
          value={`COP $${totalValue.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`}
          icon={TrendingUp}
          color="#EBA94D"
        />
      </div>
    </div>
  );
}
