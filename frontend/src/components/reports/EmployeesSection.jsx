import { Users } from "lucide-react";
import { ReportTable } from "./ReportTable";

export function EmployeesSection({ data = [] }) {
  const columns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Teléfono" },
    { key: "production_orders_count", label: "Órdenes", width: "100px" },
    {
      key: "start_date",
      label: "Desde",
      width: "120px",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
  ];

  return (
    <ReportTable
      title="Empleados"
      icon={Users}
      data={data}
      columns={columns}
      fileName="empleados"
      emptyMessage="No hay empleados"
    />
  );
}
