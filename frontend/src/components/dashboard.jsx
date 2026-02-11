import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { Package, TrendingUp, Users, FileText, DollarSign, ShoppingCart, AlertTriangle, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DEFAULT_COLORS = ['#EA7028', '#EBA94D', '#EBCC83', '#EBB583'];

export function Dashboard() {
  const [stats, setStats] = useState({
    monthly_sales: { total: 45231 },
    total_products: { total: 1248 },
    active_customers: { total: 342 },
    pending_orders: { total: 28 },
  });
  const [chartData, setChartData] = useState([
    { name: 'Ene', ventas: 4000, compras: 2400 },
    { name: 'Feb', ventas: 3000, compras: 1398 },
    { name: 'Mar', ventas: 2000, compras: 9800 },
    { name: 'Abr', ventas: 2780, compras: 3908 },
    { name: 'May', ventas: 1890, compras: 4800 },
    { name: 'Jun', ventas: 2390, compras: 3800 },
  ]);
  const [alerts, setAlerts] = useState([
    { text: 'Stock bajo: Pan Integral (Solo 5 unidades)', type: 'warning' },
    { text: 'Factura #1234 vence mañana', type: 'danger' },
    { text: 'Nueva orden de compra recibida', type: 'info' },
    { text: 'Stock crítico: Tortas de Chocolate', type: 'warning' },
  ]);
  const [activity, setActivity] = useState([
    { action: 'Factura #5678 generada', time: 'Hace 5 min', user: 'Juan Pérez' },
    { action: 'Producto agregado al inventario', time: 'Hace 15 min', user: 'María García' },
    { action: 'Cliente nuevo registrado', time: 'Hace 1 hora', user: 'Sistema' },
    { action: 'Orden de compra aprobada', time: 'Hace 2 horas', user: 'Carlos López' },
  ]);

  const categoryData = [
    { name: 'Panes', value: 400 },
    { name: 'Pastelería', value: 300 },
    { name: 'Tortas', value: 200 },
    { name: 'Galletas', value: 150 },
    { name: 'Otros', value: 100 },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, chartsRes, alertsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getCharts(),
        dashboardAPI.getAlerts(),
        dashboardAPI.getActivity(),
      ]);

      setStats(statsRes.data);
      if (chartsRes.data.length > 0) setChartData(chartsRes.data);
      if (alertsRes.data.length > 0) setAlerts(alertsRes.data);
      if (activityRes.data.length > 0) setActivity(activityRes.data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 style={{ fontFamily: 'Open Sans, sans-serif' }}>Dashboard</h1>
        <p className="text-muted" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Bienvenido al panel de control de Pansoft
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-start border-4 h-100" style={{ borderLeftColor: '#EA7028' }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small" style={{ fontFamily: 'Roboto, sans-serif' }}>Ventas del Mes</p>
                  <h3 className="mt-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>${stats.monthly_sales?.total || 0}</h3>
                  <p className="text-success small mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>+12.5% vs mes anterior</p>
                </div>
                <div className="p-3 rounded-3 text-white" style={{ backgroundColor: '#EA7028' }}>
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-start border-4 h-100" style={{ borderLeftColor: '#EBA94D' }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small" style={{ fontFamily: 'Roboto, sans-serif' }}>Productos</p>
                  <h3 className="mt-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>{stats.total_products?.total || 0}</h3>
                  <p className="text-muted small mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>En inventario</p>
                </div>
                <div className="p-3 rounded-3 text-white" style={{ backgroundColor: '#EBA94D' }}>
                  <Package size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-start border-4 h-100" style={{ borderLeftColor: '#EBCC83' }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small" style={{ fontFamily: 'Roboto, sans-serif' }}>Clientes Activos</p>
                  <h3 className="mt-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>{stats.active_customers?.total || 0}</h3>
                  <p className="text-info small mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>+8 nuevos esta semana</p>
                </div>
                <div className="p-3 rounded-3 text-white" style={{ backgroundColor: '#EBCC83' }}>
                  <Users size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-start border-4 h-100" style={{ borderLeftColor: '#EA7028' }}>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-muted small" style={{ fontFamily: 'Roboto, sans-serif' }}>Órdenes Pendientes</p>
                  <h3 className="mt-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>{stats.pending_orders?.total || 0}</h3>
                  <p className="text-warning small mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Requieren atención</p>
                </div>
                <div className="p-3 rounded-3 text-white" style={{ backgroundColor: '#EA7028' }}>
                  <ShoppingCart size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title" style={{ fontFamily: 'Open Sans, sans-serif' }}>Ventas y Compras</h5>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" style={{ fontFamily: 'Roboto, sans-serif' }} />
                  <YAxis style={{ fontFamily: 'Roboto, sans-serif' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="ventas" stackId="1" stroke="#EA7028" fill="#EA7028" />
                  <Area type="monotone" dataKey="compras" stackId="1" stroke="#EBA94D" fill="#EBA94D" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title" style={{ fontFamily: 'Open Sans, sans-serif' }}>Distribución por Categoría</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <AlertTriangle className="text-danger" size={20} />
                <h5 className="card-title mb-0" style={{ fontFamily: 'Open Sans, sans-serif' }}>Alertas Recientes</h5>
              </div>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-2 border-start border-4 ${
                      alert.type === 'danger'
                        ? 'bg-danger-light border-danger'
                        : alert.type === 'warning'
                        ? 'bg-warning-light border-warning'
                        : 'bg-info-light border-info'
                    }`}
                    style={{
                      backgroundColor: alert.type === 'danger' ? '#f8d7da' : alert.type === 'warning' ? '#fff3cd' : '#d1ecf1',
                    }}
                  >
                    <p className="small mb-0" style={{ fontFamily: 'Roboto, sans-serif' }}>{alert.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FileText className="text-danger" size={20} />
                <h5 className="card-title mb-0" style={{ fontFamily: 'Open Sans, sans-serif' }}>Actividad Reciente</h5>
              </div>
              <div className="space-y-3">
                {activity.map((act, index) => (
                  <div key={index} className="d-flex gap-3 pb-3" style={{ borderBottom: index < activity.length - 1 ? '1px solid #eee' : 'none' }}>
                    <div className="mt-1" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA7028', flexShrink: 0 }}></div>
                    <div className="flex-grow-1">
                      <p className="small mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>{act.action}</p>
                      <p className="text-muted small mb-0" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {act.user} • {act.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
