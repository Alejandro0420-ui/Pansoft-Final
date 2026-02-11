export function StatCard({
  title,
  value,
  icon: Icon,
  color = "#EA7028",
  bgColor = "rgba(234, 112, 40, 0.1)",
}) {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="card-body d-flex align-items-center gap-3">
        <div
          style={{
            backgroundColor: bgColor,
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <Icon size={28} style={{ color }} />
        </div>
        <div className="flex-grow-1">
          <p className="text-muted mb-1 small">{title}</p>
          <h5 className="mb-0">{value}</h5>
        </div>
      </div>
    </div>
  );
}
