export function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <small className="text-muted d-block">{label}</small>
          <h4 className="mb-0 mt-2">{value}</h4>
        </div>
        <Icon size={32} style={{ color }} />
      </div>
    </div>
  );
}
