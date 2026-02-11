import { STATUS_OPTIONS } from "./constants";

export function ReportFilters({
  filters,
  onFiltersChange,
  showStatus = true,
  showDates = true,
}) {
  const handleChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  return (
    <div className="d-flex gap-3 mb-3 flex-wrap">
      {showDates && (
        <>
          <div>
            <label className="form-label mb-2">Desde</label>
            <input
              type="date"
              className="form-control"
              value={filters.startDate || ""}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="form-label mb-2">Hasta</label>
            <input
              type="date"
              className="form-control"
              value={filters.endDate || ""}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>
        </>
      )}

      {showStatus && (
        <div>
          <label className="form-label mb-2">Estado</label>
          <select
            className="form-select"
            value={filters.status || ""}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="">Todos los estados</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {filters.startDate && (
        <div className="d-flex align-items-end">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() =>
              onFiltersChange({ startDate: "", endDate: "", status: "" })
            }
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
