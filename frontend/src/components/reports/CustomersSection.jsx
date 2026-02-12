import { Users } from "lucide-react";
import { ReportTable } from "./ReportTable";

export function CustomersSection({ data = [] }) {
  const columns = [
    { key: "name", label: "Cliente" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Teléfono" },
    { key: "orders_count", label: "Órdenes", width: "100px" },
    {
      key: "total_spent",
      label: "Total Gastado",
      width: "130px",
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
  ];

  return (
    <ReportTable
      title="Clientes"
      icon={Users}
      data={data}
      columns={columns}
      fileName="clientes"
      emptyMessage="No hay clientes"
    />
  );
}
