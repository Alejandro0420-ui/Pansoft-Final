import { Search, Download } from "lucide-react";

export function InvoiceFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  onExport,
}) {
  return (
    <div className="card p-3 border-0 shadow-sm">
      <div className="d-flex flex-wrap gap-3">
        <div className="flex-grow-1" style={{ minWidth: "200px" }}>
          <div className="position-relative">
            <Search
              className="position-absolute start-3 top-50 translate-middle-y"
              size={18}
              color="#999"
            />
            <input
              type="text"
              className="form-control ps-5 border-2"
              style={{ borderColor: "#EBB583" }}
              placeholder="Buscar facturas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <select
          className="form-select border-2"
          style={{ borderColor: "#EBB583", width: "160px" }}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="paid">Pagadas</option>
          <option value="overdue">Vencidas</option>
        </select>

        <input
          type="date"
          className="form-control border-2"
          style={{ borderColor: "#EBB583", width: "160px" }}
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
        />

        <button
          className="btn d-flex align-items-center gap-2"
          style={{
            backgroundColor: "#EBA94D",
            color: "white",
            border: "none",
          }}
          onClick={onExport}
        >
          <Download size={18} />
          Exportar
        </button>
      </div>
    </div>
  );
}
