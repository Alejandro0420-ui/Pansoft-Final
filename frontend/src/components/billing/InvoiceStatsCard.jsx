export function InvoiceStatsCard({ title, count, icon: Icon, color }) {
  const colorMap = {
    orange: "#EA7028",
    gold: "#EBCC83",
    success: "#EBA94D",
    danger: "#EA7028",
  };

  return (
    <div
      className={`card shadow-sm border-0 position-relative overflow-hidden`}
    >
      <div
        className={`position-absolute top-0 end-0 p-3`}
        style={{ backgroundColor: colorMap[color] || "#EA7028" }}
      >
        <Icon size={32} className="text-white" />
      </div>
      <div className="card-body">
        <p className="text-muted small mb-1">{title}</p>
        <h3 className="mb-0 display-5" style={{ color: "#EA7028" }}>
          {count}
        </h3>
      </div>
    </div>
  );
}
