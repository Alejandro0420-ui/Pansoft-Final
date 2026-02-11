import { DownloadButton } from "./DownloadButton";

export function ReportTable({
  title,
  icon: Icon,
  data,
  columns,
  fileName,
  emptyMessage = "No hay datos",
}) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            {Icon && <Icon size={24} className="text-warning" />}
            <h5 className="card-title mb-0">{title}</h5>
          </div>
          <DownloadButton data={data} fileName={fileName} title="CSV" />
        </div>

        {data && data.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead className="table-light">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} style={{ minWidth: col.width || "auto" }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.id || idx}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render
                          ? col.render(item[col.key], item)
                          : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted py-4">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
