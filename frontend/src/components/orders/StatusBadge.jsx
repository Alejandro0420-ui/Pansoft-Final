import { STATUS_COLORS } from "./constants";

export function StatusBadge({ status }) {
  const config = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span className="badge" style={{ backgroundColor: config.bg, color: config.text }}>
      {config.label}
    </span>
  );
}
