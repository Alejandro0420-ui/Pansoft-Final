import { ShoppingCart } from "lucide-react";
import { ReportTable } from "./ReportTable";
import { STATUS_COLORS } from "./constants";

export function SalesOrdersSection({ data = [] }) {
  const columns = [
    { key: "id", label: "ID Orden", width: "80px" },
    { key: "customer_name", label: "Cliente" },
    {
      key: "status",
      label: "Estado",
      render: (value) => (
        <span
          className="badge"
          style={{
            backgroundColor: STATUS_COLORS[value] || "#999",
          }}
        >
          {value}
        </span>
      ),
    },
    { key: "order_date", label: "Fecha", width: "120px" },
    {
      key: "total_amount",
      label: "Total",
      render: (value) => `COP $${parseFloat(value || 0).toFixed(2)}`,
    },
    { key: "items_count", label: "Items", width: "80px" },
  ];

  return (
    <ReportTable
      title="Órdenes de Venta"
      icon={ShoppingCart}
      data={data}
      columns={columns}
      fileName="ordenes_venta"
      emptyMessage="No hay órdenes de venta registradas"
    />
  );
}
