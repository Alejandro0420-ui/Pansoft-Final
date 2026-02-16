import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ Interceptor para agregar JWT automáticamente
api.interceptors.request.use((config) => {
  // Obtener token de localStorage
  const token = localStorage.getItem("token");

  // Si existe token, agregarlo al header Authorization
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si los datos son FormData, dejar que axios configure el header automáticamente
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// ✅ Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si token expiró (401) o no autorizado (403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Limpiar token y redirigir a login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ✅ Auth API con validaciones seguras
export const authAPI = {
  login: (username, password) => {
    if (!username || !password) {
      return Promise.reject(new Error("Usuario y contraseña requeridos"));
    }
    return api.post("/auth/login", { username, password });
  },

  register: (userData) => {
    const { username, email, password, full_name } = userData;

    // Validaciones básicas
    if (!username || !email || !password || !full_name) {
      return Promise.reject(new Error("Todos los campos son requeridos"));
    }

    if (password.length < 6) {
      return Promise.reject(
        new Error("Contraseña debe tener al menos 6 caracteres"),
      );
    }

    if (!email.includes("@")) {
      return Promise.reject(new Error("Email inválido"));
    }

    return api.post("/auth/register", userData);
  },

  // ✅ Guardar información del usuario después de login/register
  saveUser: (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  // ✅ Obtener usuario autenticado
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // ✅ Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // ✅ Verificar si está autenticado
  isAuthenticated: () => !!localStorage.getItem("token"),
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
  getProductionOrders: (params) =>
    api.get("/reports/production-orders", { params }),
  getSalesOrders: (params) => api.get("/reports/sales-orders", { params }),
  getProducts: () => api.get("/reports/products"),
  getEmployees: () => api.get("/reports/employees"),
  getSummary: () => api.get("/reports/summary"),
};

export default api;
