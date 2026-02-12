import { StatCard } from "./StatCard";
import { TrendingUp, Package, Users, Briefcase } from "lucide-react";

export function SummarySection({ summary = {} }) {
  return (
    <div className="row mb-4">
      <div className="col-md-3 mb-3">
        <StatCard
          title="Total Ventas"
          value={`$${parseFloat(summary.total_sales || 0).toFixed(2)}`}
          icon={TrendingUp}
          color="#4caf50"
          bgColor="rgba(76, 175, 80, 0.1)"
        />
      </div>
      <div className="col-md-3 mb-3">
        <StatCard
          title="Órdenes de Producción"
          value={summary.total_production_orders || 0}
          icon={Briefcase}
          color="#2196f3"
          bgColor="rgba(33, 150, 243, 0.1)"
        />
      </div>
      <div className="col-md-3 mb-3">
        <StatCard
          title="Productos"
          value={summary.total_products || 0}
          icon={Package}
          color="#ff9800"
          bgColor="rgba(255, 152, 0, 0.1)"
        />
      </div>
      <div className="col-md-3 mb-3">
        <StatCard
          title="Clientes"
          value={summary.total_customers || 0}
          icon={Users}
          color="#e91e63"
          bgColor="rgba(233, 30, 99, 0.1)"
        />
      </div>
    </div>
  );
}
