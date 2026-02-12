import { Package } from "lucide-react";
import { ReportTable } from "./ReportTable";
import { STOCK_STATUS_COLORS } from "./constants";

export function ProductsSection({ data = [] }) {
  const columns = [
    { key: "name", label: "Producto" },
    { key: "sku", label: "SKU", width: "100px" },
    { key: "stock_quantity", label: "Stock", width: "80px" },
    { key: "min_stock_level", label: "Mín.", width: "80px" },
    {
      key: "stock_status",
      label: "Estado",
      width: "100px",
      render: (value) => (
        <span
          className="badge"
          style={{
            backgroundColor: STOCK_STATUS_COLORS[value] || "#999",
          }}
        >
          {value}
        </span>
      ),
    },
    {
      key: "price",
      label: "Precio",
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
  ];

  return (
    <ReportTable
      title="Inventario de Productos"
      icon={Package}
      data={data}
      columns={columns}
      fileName="productos"
      emptyMessage="No hay productos"
    />
  );
}
