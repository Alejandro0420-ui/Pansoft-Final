import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function SalesChartSection({ data = [] }) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-3">
          <TrendingUp size={24} className="text-success" />
          <h5 className="card-title mb-0">Gráfico de Ventas Diarias</h5>
        </div>

        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
              />
              <Line
                type="monotone"
                dataKey="total_sales"
                stroke="#EA7028"
                strokeWidth={2}
                dot={{ fill: "#EA7028", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted py-4">
            No hay datos de ventas para el período seleccionado
          </div>
        )}
      </div>
    </div>
  );
}
