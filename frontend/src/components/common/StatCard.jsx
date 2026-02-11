import React from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "#EA7028",
  trend,
  trendColor = "success",
}) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1 small">{label}</p>
            <h3 className="h4 mb-0">{value}</h3>
            {trend && (
              <p className={`text-${trendColor} small mt-2`}>{trend}</p>
            )}
          </div>
          {Icon && (
            <div
              className="p-3 rounded-3 text-white"
              style={{ backgroundColor: color }}
            >
              <Icon size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
