import React from "react";

export function DataTable({
  columns,
  data,
  loading,
  emptyMessage,
  onRowClick,
  rowActions,
  striped = true,
  hover = true,
}) {
  const tableClasses = ["table"];
  if (striped) tableClasses.push("table-striped");
  if (hover) tableClasses.push("table-hover");

  return (
    <div className="table-responsive">
      <table className={tableClasses.join(" ")}>
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={col.accessor}>{col.label}</th>
            ))}
            {rowActions && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="text-center py-3"
              >
                Cargando...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="text-center text-muted py-3"
              >
                {emptyMessage || "No hay datos disponibles"}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {columns.map((col) => (
                  <td key={col.accessor}>
                    {col.render
                      ? col.render(row[col.accessor], row)
                      : row[col.accessor]}
                  </td>
                ))}
                {rowActions && <td>{rowActions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
