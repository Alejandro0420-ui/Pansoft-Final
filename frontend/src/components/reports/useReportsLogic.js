import { useState, useEffect } from "react";
import { reportsAPI } from "../../services/api";

export function useReportsLogic() {
  const [reports, setReports] = useState({
    sales: [],
    salesOrders: [],
    productionOrders: [],
    products: [],
    employees: [],
    customers: [],
    inventory: [],
    summary: {},
  });

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = async (currentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filter params
      const salesParams = currentFilters.startDate
        ? {
            startDate: currentFilters.startDate,
            endDate: currentFilters.endDate,
          }
        : {};

      const orderParams = currentFilters.status
        ? {
            status: currentFilters.status,
            startDate: currentFilters.startDate,
            endDate: currentFilters.endDate,
          }
        : {};

      // Load all reports in parallel
      const [
        sales,
        salesOrders,
        productionOrders,
        products,
        employees,
        customers,
        inventory,
        summary,
      ] = await Promise.all([
        reportsAPI.getSales(salesParams).catch(() => ({ data: [] })),
        reportsAPI.getSalesOrders(orderParams).catch(() => ({ data: [] })),
        reportsAPI.getProductionOrders(orderParams).catch(() => ({ data: [] })),
        reportsAPI.getProducts().catch(() => ({ data: [] })),
        reportsAPI.getEmployees().catch(() => ({ data: [] })),
        reportsAPI.getCustomers().catch(() => ({ data: [] })),
        reportsAPI.getInventory().catch(() => ({ data: [] })),
        reportsAPI.getSummary().catch(() => ({ data: {} })),
      ]);

      setReports({
        sales: sales.data || [],
        salesOrders: salesOrders.data || [],
        productionOrders: productionOrders.data || [],
        products: products.data || [],
        employees: employees.data || [],
        customers: customers.data || [],
        inventory: inventory.data || [],
        summary: summary.data || {},
      });
    } catch (err) {
      console.error("Error loading reports:", err);
      setError("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(filters);
  }, []);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    loadReports(newFilters);
  };

  return {
    reports,
    filters,
    applyFilters,
    loading,
    error,
    reload: () => loadReports(filters),
  };
}
