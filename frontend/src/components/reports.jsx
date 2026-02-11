import { useReportsLogic } from "./reports/useReportsLogic";
import { ReportFilters } from "./reports/ReportFilters";
import { SummarySection } from "./reports/SummarySection";
import { SalesChartSection } from "./reports/SalesChartSection";
import { SalesOrdersSection } from "./reports/SalesOrdersSection";
import { ProductionOrdersSection } from "./reports/ProductionOrdersSection";
import { ProductsSection } from "./reports/ProductsSection";
import { EmployeesSection } from "./reports/EmployeesSection";
import { CustomersSection } from "./reports/CustomersSection";
import { InventorySection } from "./reports/InventorySection";
import { RefreshCw } from "lucide-react";

export function Reports() {
  const { reports, filters, applyFilters, loading, error, reload } =
    useReportsLogic();

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Reportes</h1>
          <p className="text-muted">
            Visualiza análisis y estadísticas del negocio
          </p>
        </div>
        <button
          onClick={reload}
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          disabled={loading}
        >
          <RefreshCw size={20} className={loading ? "spinning" : ""} />
          Actualizar
        </button>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button type="button" className="btn-close" onClick={() => {}} />
        </div>
      )}

      <ReportFilters
        filters={filters}
        onFiltersChange={applyFilters}
        showDates={true}
        showStatus={true}
      />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando reportes...</p>
        </div>
      ) : (
        <>
          <SummarySection summary={reports.summary} />

          <div className="mt-4">
            <SalesChartSection data={reports.sales} />
          </div>

          <SalesOrdersSection data={reports.salesOrders} />

          <ProductionOrdersSection data={reports.productionOrders} />

          <ProductsSection data={reports.products} />

          <EmployeesSection data={reports.employees} />

          <CustomersSection data={reports.customers} />

          <InventorySection data={reports.inventory} />
        </>
      )}
    </div>
  );
}
