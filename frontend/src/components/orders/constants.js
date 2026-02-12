// Datos de productos y precios
export const PRODUCT_PRICES = {
  "Pan Francés": 1500,
  "Pan Integral": 2000,
  Croissants: 2500,
  "Tortas de Chocolate": 25000,
  "Donas Glaseadas": 1800,
  "Galletas de Mantequilla": 8500,
  "Muffins de Arándanos": 3500,
};

export const AVAILABLE_SUPPLIES = [
  "Harina de Trigo",
  "Azúcar Blanca",
  "Levadura Seca",
  "Mantequilla",
  "Huevos",
  "Chocolate en Polvo",
  "Sal",
  "Leche",
  "Vainilla",
  "Canela",
];

export const EMPLOYEES = [
  "María García",
  "Carlos López",
  "Ana Martínez",
  "Roberto Sánchez",
];

export const PRODUCT_RECIPES = {
  "Pan Francés": [
    {
      name: "Harina de Trigo",
      quantity: 5,
      unit: "kg",
      stock: 500,
      status: "ok",
    },
    {
      name: "Levadura Seca",
      quantity: 0.2,
      unit: "kg",
      stock: 15,
      status: "low",
    },
    { name: "Sal", quantity: 0.1, unit: "kg", stock: 50, status: "ok" },
  ],
  "Pan Integral": [
    {
      name: "Harina de Trigo",
      quantity: 4,
      unit: "kg",
      stock: 500,
      status: "ok",
    },
    {
      name: "Levadura Seca",
      quantity: 0.15,
      unit: "kg",
      stock: 15,
      status: "low",
    },
  ],
  Croissants: [
    {
      name: "Harina de Trigo",
      quantity: 3,
      unit: "kg",
      stock: 500,
      status: "ok",
    },
    { name: "Mantequilla", quantity: 1.5, unit: "kg", stock: 45, status: "ok" },
    {
      name: "Levadura Seca",
      quantity: 0.15,
      unit: "kg",
      stock: 15,
      status: "low",
    },
  ],
  "Tortas de Chocolate": [
    {
      name: "Harina de Trigo",
      quantity: 2,
      unit: "kg",
      stock: 500,
      status: "ok",
    },
    {
      name: "Chocolate en Polvo",
      quantity: 1,
      unit: "kg",
      stock: 25,
      status: "ok",
    },
    {
      name: "Azúcar Blanca",
      quantity: 1.5,
      unit: "kg",
      stock: 80,
      status: "ok",
    },
  ],
};

export const STATUS_COLORS = {
  completed: { bg: "#EBCC83", text: "#333", label: "Completada" },
  pending: { bg: "#EBA94D", text: "white", label: "Pendiente" },
  processing: { bg: "#EA7028", text: "white", label: "En Proceso" },
  pendiente: { bg: "#EBA94D", text: "white", label: "Pendiente" },
  confirmada: { bg: "#3498DB", text: "white", label: "Confirmada" },
  en_preparacion: { bg: "#EA7028", text: "white", label: "En Preparación" },
  lista: { bg: "#2ECC71", text: "white", label: "Lista" },
  entregada: { bg: "#27AE60", text: "white", label: "Entregada" },
  en_proceso: { bg: "#EA7028", text: "white", label: "En Proceso" },
  completada: { bg: "#EBCC83", text: "#333", label: "Completada" },
  cancelada: { bg: "#6C757D", text: "white", label: "Cancelada" },
};

export const THEME_COLORS = {
  primary: "#EA7028",
  secondary: "#EBA94D",
  light: "#EBB583",
  accent: "#EBCC83",
};

export const UNIT_OPTIONS = ["kg", "litros", "unidades"];
