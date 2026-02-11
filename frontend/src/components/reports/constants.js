export const REPORT_TYPES = {
  SALES: "sales",
  SALES_ORDERS: "sales_orders",
  PRODUCTION_ORDERS: "production_orders",
  PRODUCTS: "products",
  EMPLOYEES: "employees",
  SUMMARY: "summary",
  INVENTORY: "inventory",
  CUSTOMERS: "customers",
};

export const STATUS_COLORS = {
  pendiente: "#ff9800",
  completada: "#4caf50",
  cancelada: "#f44336",
  produccion: "#2196f3",
};

export const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

export const STOCK_STATUS_COLORS = {
  Bajo: "#f44336",
  Medio: "#ff9800",
  Suficiente: "#4caf50",
};
