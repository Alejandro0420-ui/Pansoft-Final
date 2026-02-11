import { Cog } from "lucide-react";
import { ReportTable } from "./ReportTable";
import { STATUS_COLORS } from "./constants";

export function ProductionOrdersSection({ data = [] }) {
  const columns = [
    { key: "id", label: "ID Orden", width: "80px" },
    { key: "product_name", label: "Producto" },
    { key: "quantity", label: "Cantidad", width: "100px" },
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
    { key: "assigned_to", label: "Asignado A" },
    { key: "created_at", label: "Fecha", width: "120px" },
  ];

  return (
    <ReportTable
      title="Órdenes de Producción"
      icon={Cog}
      data={data}
      columns={columns}
      fileName="ordenes_produccion"
      emptyMessage="No hay órdenes de producción"
    />
  );
}
