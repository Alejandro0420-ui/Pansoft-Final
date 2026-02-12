import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Configurar interceptor para manejar FormData correctamente
api.interceptors.request.use((config) => {
  // Si los datos son FormData, dejar que axios configure el header automáticamente
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  register: (userData) => api.post("/auth/register", userData),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getCharts: () => api.get("/dashboard/charts"),
  getAlerts: () => api.get("/dashboard/alerts"),
  getActivity: () => api.get("/dashboard/activity"),
};

// Products API
export const productsAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  toggleStatus: (id) => api.patch(`/products/${id}/toggle-status`),
};

// Supplies API
export const suppliesAPI = {
  getAll: () => api.get("/supplies"),
  getById: (id) => api.get(`/supplies/${id}`),
  create: (data) => api.post("/supplies", data),
  update: (id, data) => api.put(`/supplies/${id}`, data),
  delete: (id) => api.delete(`/supplies/${id}`),
  toggleStatus: (id) => api.patch(`/supplies/${id}/toggle-status`),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get("/inventory"),
  getById: (id) => api.get(`/inventory/${id}`),
  update: (id, data) => api.put(`/inventory/${id}`, data),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => api.get("/suppliers"),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post("/suppliers", data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Orders API (legacy)
export const ordersAPI = {
  getAll: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Production Orders API
export const productionOrdersAPI = {
  getAll: () => api.get("/production-orders"),
  getById: (id) => api.get(`/production-orders/${id}`),
  create: (data) => api.post("/production-orders", data),
  update: (id, data) => api.put(`/production-orders/${id}`, data),
  updateStatus: (id, status) =>
    api.patch(`/production-orders/${id}/status`, { status }),
  updateInsumo: (orderId, insumoId, data) =>
    api.patch(`/production-orders/${orderId}/insumos/${insumoId}`, data),
  deleteInsumo: (orderId, insumoId) =>
    api.delete(`/production-orders/${orderId}/insumos/${insumoId}`),
  delete: (id) => api.delete(`/production-orders/${id}`),
};

// Sales Orders API
export const salesOrdersAPI = {
  getAll: () => api.get("/sales-orders"),
  getById: (id) => api.get(`/sales-orders/${id}`),
  create: (data) => api.post("/sales-orders", data),
  update: (id, data) => api.put(`/sales-orders/${id}`, data),
  updateStatus: (id, status) =>
    api.patch(`/sales-orders/${id}/status`, { status }),
  updateItem: (orderId, itemId, data) =>
    api.patch(`/sales-orders/${orderId}/items/${itemId}`, data),
  deleteItem: (orderId, itemId) =>
    api.delete(`/sales-orders/${orderId}/items/${itemId}`),
  updateInsumo: (orderId, insumoId, data) =>
    api.patch(`/sales-orders/${orderId}/insumos/${insumoId}`, data),
  delete: (id) => api.delete(`/sales-orders/${id}`),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get("/customers"),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Billing API
export const billingAPI = {
  getAll: () => api.get("/billing"),
  getById: (id) => api.get(`/billing/${id}`),
  create: (data) => api.post("/billing", data),
  update: (id, data) => api.put(`/billing/${id}`, data),
};

// Employees API
export const employeesAPI = {
  getAll: () => api.get("/employees"),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post("/employees", data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Reports API
export const reportsAPI = {
  getSales: (params) => api.get("/reports/sales", { params }),
  getInventory: () => api.get("/reports/inventory"),
  getCustomers: () => api.get("/reports/customers"),
  getProductionOrders: (params) => api.get("/reports/production-orders", { params }),
  getSalesOrders: (params) => api.get("/reports/sales-orders", { params }),
  getProducts: () => api.get("/reports/products"),
  getEmployees: () => api.get("/reports/employees"),
  getSummary: () => api.get("/reports/summary"),
};

export default api;
