import { Package } from "lucide-react";
import { ReportTable } from "./ReportTable";

export function InventorySection({ data = [] }) {
  const columns = [
    { key: "name", label: "Producto" },
    { key: "sku", label: "SKU", width: "100px" },
    { key: "stock_quantity", label: "Cantidad", width: "100px" },
    {
      key: "price",
      label: "Precio",
      width: "100px",
      render: (value) => `COP $${parseFloat(value || 0).toFixed(2)}`,
    },
    {
      key: "total_value",
      label: "Valor Total",
      width: "130px",
      render: (value) => `COP $${parseFloat(value || 0).toFixed(2)}`,
    },
  ];

  return (
    <ReportTable
      title="Inventario Actual"
      icon={Package}
      data={data}
      columns={columns}
      fileName="inventario"
      emptyMessage="No hay inventario"
    />
  );
}
