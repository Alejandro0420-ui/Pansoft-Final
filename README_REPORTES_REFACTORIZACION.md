# Módulo de Reportes - Refactorización Completa

## 📊 Resumen de Cambios

El módulo de reportes ha sido completamente refactorizado para proporcionar funcionalidad 100% funcional con:

✅ **8 reportes diferentes** (antes eran 3)  
✅ **Filtros dinámicos** por fecha y estado  
✅ **Descarga CSV** para cada reporte  
✅ **Estadísticas resumidas** en dashboard  
✅ **Código modular** con componentes reutilizables  
✅ **Gráficos de ventas** con Recharts

## 📁 Estructura del Proyecto

### Backend (`backend/routes/reports.js`)

Ahora incluye 8 endpoints con filtros completos:

```
GET /reports/sales                  - Gráfico de ventas diarias (con filtros de fecha)
GET /reports/sales-orders          - Órdenes de venta con estado y filtros
GET /reports/production-orders     - Órdenes de producción con estado
GET /reports/products              - Inventario de productos con estado de stock
GET /reports/employees             - Empleados con conteo de órdenes
GET /reports/customers             - Clientes con totales gastados
GET /reports/inventory             - Inventario actual detallado
GET /reports/summary               - Dashboard con totales principales
```

**Características del backend:**

- Filtros por rango de fechas (`startDate`, `endDate`)
- Filtros por estado (`status`)
- Cálculos automáticos de totales y conteos
- Estados de stock automáticos (Bajo/Medio/Suficiente)
- Manejo de errores completo

### Frontend (`frontend/src/components/reports/`)

Estructura modular con componentes reutilizables:

```
reports/
├── constants.js                    - Constantes de colores y estados
├── useReportsLogic.js             - Custom hook para API y estado
├── DownloadButton.jsx             - Descarga CSV
├── ReportFilters.jsx              - Filtros de fecha y estado
├── ReportTable.jsx                - Tabla reutilizable
├── StatCard.jsx                   - Tarjeta de estadística
├── SalesChartSection.jsx          - Gráfico de ventas
├── SummarySection.jsx             - Dashboard de totales
├── SalesOrdersSection.jsx         - Tabla de órdenes de venta
├── ProductionOrdersSection.jsx    - Tabla de órdenes de producción
├── ProductsSection.jsx            - Tabla de inventario de productos
├── EmployeesSection.jsx           - Tabla de empleados
├── CustomersSection.jsx           - Tabla de clientes
└── InventorySection.jsx           - Tabla de inventario
```

## 🎯 Funcionalidades Principales

### 1. **Dashboard de Estadísticas**

Muestra 4 KPIs principales:

- Total de Ventas (suma de órdenes)
- Órdenes de Producción (conteo)
- Total de Productos (conteo)
- Total de Clientes (conteo)

### 2. **Filtros Dinámicos**

- **Rango de Fechas**: Desde/Hasta (opcional)
- **Estado**: Pendiente/Completada/Cancelada (opcional)
- Botón "Limpiar Filtros" para resetear
- Se aplican en tiempo real a todos los reportes

### 3. **Reportes Disponibles**

#### 📈 Gráfico de Ventas

- Visualización de ventas diarias en gráfico de línea
- Responde a filtros de fecha
- Muestra total acumulado por día

#### 🛒 Órdenes de Venta

- ID, Cliente, Estado, Fecha, Total, Items
- Filtrable por estado y rango de fecha
- Descarga con todos los datos

#### 🏭 Órdenes de Producción

- ID, Producto, Cantidad, Estado, Responsable, Fecha
- Filtrable por estado
- Descarga completa

#### 📦 Inventario de Productos

- Producto, SKU, Stock, Mínimo, Estado Stock, Precio
- Estado automático: Bajo (rojo), Medio (naranja), Suficiente (verde)
- Descarga con estado actual

#### 👥 Empleados

- Nombre, Email, Teléfono, Órdenes Asignadas, Desde (fecha)
- Muestra total de órdenes de producción por empleado
- Descarga con historial

#### 👨‍💼 Clientes

- Cliente, Email, Teléfono, Órdenes, Total Gastado
- Ordenado por total gastado (mayor a menor)
- Descarga con resumen de gastos

#### 📋 Inventario Completo

- Producto, SKU, Cantidad, Precio, Valor Total
- Descarga para auditoría y contabilidad

#### 📊 Resumen/Dashboard

- Totales principales: ventas, órdenes, productos, clientes
- Actualizable con botón "Actualizar"

## 💾 Descarga de Reportes

Cada reporte incluye botón "CSV" que:

- Genera archivo en formato CSV
- Incluye fecha actual en nombre: `reporte_2024-02-15.csv`
- Maneja caracteres especiales correctamente
- Descarga automática en navegador

## 🔄 Hook Personalizado: `useReportsLogic`

```javascript
const { reports, filters, applyFilters, loading, error, reload } = useReportsLogic();

// Estructura de datos retornada:
{
  reports: {
    sales: [],              // Array de ventas diarias
    salesOrders: [],        // Array de órdenes de venta
    productionOrders: [],   // Array de órdenes de producción
    products: [],           // Array de productos
    employees: [],          // Array de empleados
    customers: [],          // Array de clientes
    inventory: [],          // Array de inventario
    summary: {}             // Objeto con totales
  },
  filters: {
    startDate: '',
    endDate: '',
    status: ''
  },
  loading: boolean,         // Estado de carga
  error: string | null,     // Mensajes de error
  applyFilters: (filters) => void,  // Aplicar filtros
  reload: () => void        // Recargar datos
}
```

## 🎨 Tema y Colores

```javascript
THEME_COLORS = {
  primary: "#EA7028", // Naranja principal
  secondary: "#EBB583", // Naranja secundario
  success: "#4caf50", // Verde
  warning: "#ff9800", // Naranja
  danger: "#f44336", // Rojo
};

STOCK_STATUS = {
  Bajo: "#f44336", // Rojo
  Medio: "#ff9800", // Naranja
  Suficiente: "#4caf50", // Verde
};
```

## 🚀 Uso en Componentes

### Ejemplo: Usar el hook

```javascript
function MyReportComponent() {
  const { reports, filters, applyFilters, loading } = useReportsLogic();

  const handleFilter = (newFilters) => {
    applyFilters(newFilters);
  };

  return (
    <>
      <ReportFilters filters={filters} onFiltersChange={handleFilter} />
      {loading ? <Spinner /> : <ReportTable data={reports.salesOrders} />}
    </>
  );
}
```

## 📱 Responsive Design

- Usa Bootstrap 5 para grid responsive
- Tablas con scroll horizontal en móvil
- Gráficos adaptativos con ResponsiveContainer de Recharts
- Filtros en fila que se ajustan

## 🔒 Validación de Datos

- Manejo de nulos/undefined en todos los campos
- Formateo automático de moneda ($)
- Parse de fechas con `toLocaleDateString()`
- Conteos con valores por defecto (0)

## 📝 Próximas Mejoras Posibles

1. **Exportar a PDF**: Usar jsPDF o similar
2. **Gráficos por status**: Estado de las órdenes
3. **Reportes personalizados**: Agregar/quitar columnas
4. **Graph de ingresos vs gastos**: Comparativa
5. **Email reportes**: Enviar automático
6. **Programación de reportes**: Generación automática

## 🐛 Debugging

Para revisar qué datos devuelve cada endpoint:

```javascript
// En navegador, abre consola:
fetch("/reports/sales")
  .then((r) => r.json())
  .then(console.log);
fetch("/reports/sales-orders")
  .then((r) => r.json())
  .then(console.log);
fetch("/reports/products")
  .then((r) => r.json())
  .then(console.log);
```

## 📞 Soportado Por

- **Frontend**: React con Hooks
- **Backend**: Node.js Express
- **BD**: MySQL con mysql2/promise
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styles**: Bootstrap 5
